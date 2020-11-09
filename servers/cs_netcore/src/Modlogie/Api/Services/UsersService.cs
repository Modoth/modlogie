using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;
using Modlogie.Api.Common;
using Modlogie.Api.Users;
using Modlogie.Domain;
using User = Modlogie.Domain.Models.User;

namespace Modlogie.Api.Services
{
    public class UsersService : Users.UsersService.UsersServiceBase
    {
        private static readonly Expression<Func<User, Users.User>> Selector = i =>
            new Users.User
            {
                Id = i.Id.ToString(),
                Email = i.Email,
                AuthorisionExpired = i.AuthorisionExpired.ToUniversalTime().ToTimestamp(),
                Type = i.Authorised == 0 ? Users.User.Types.Type.Normal : Users.User.Types.Type.Authorised,
                Status = i.Status == 0 ? Users.User.Types.Status.Disabled : Users.User.Types.Status.Enabled,
                Comment = i.Comment ?? ""
            };

        private static readonly Func<User, Users.User> Converter = Selector.Compile();
        private readonly IEmailService _emailService;
        private readonly IUsersEntityService _service;
        private readonly ILoginUserService _userService;

        public UsersService(IUsersEntityService service, ILoginUserService userService, IEmailService emailService)
        {
            _service = service;
            _userService = userService;
            _emailService = emailService;
        }

        public override async Task<UsersReply> GetAll(GetAllRequest request, ServerCallContext context)
        {
            var reply = new UsersReply();
            var user = await _userService.GetUser(context.GetHttpContext());
            if (user == null)
            {
                reply.Error = Error.NeedLogin;
                return reply;
            }

            if (!user.HasWritePermission())
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            var users = _service.All();
            if (!string.IsNullOrWhiteSpace(request.Filter))
            {
                users = users.Where(u => u.Id.Contains(request.Filter, StringComparison.CurrentCultureIgnoreCase));
            }

            users = users.OrderByDescending(u => u.Status).ThenBy(u => u.Id);
            if (request.Skip > 0 || request.Take > 0)
            {
                reply.Total = await users.CountAsync();
            }

            if (request.Skip > 0)
            {
                users = users.Skip(request.Skip);
            }

            if (request.Take > 0)
            {
                users = users.Take(request.Take);
            }

            reply.Users.AddRange(await users
                .Select(Selector)
                .ToArrayAsync());
            return reply;
        }

        public override async Task<UserReply> Add(AddRequest request, ServerCallContext context)
        {
            var reply = new UserReply();
            if (!PwdEncryptor.ValidateUserName(request.Id) || !PwdEncryptor.ValidateEmail(request.Email))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var user = await _userService.GetUser(context.GetHttpContext());
            if (user == null)
            {
                reply.Error = Error.NeedLogin;
                return reply;
            }

            if (!user.HasWritePermission())
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            var existed = await _service.All().FirstOrDefaultAsync(u => u.Id == request.Id || u.Email == request.Email);
            if (existed != null)
            {
                reply.Error = Error.EntityConflict;
                return reply;
            }

            var password = string.IsNullOrWhiteSpace(request.Password)
                ? Guid.NewGuid().ToString().Replace("-", "").Substring(0, 8)
                : request.Password;
            await _emailService.Send(request.Email, "User register", $"{password}");
            var newUser = new User
            {
                Id = request.Id,
                Email = request.Email,
                Status = 0,
                Created = DateTime.Now,
                Authorised = 0,
                AuthorisionExpired = DateTime.Now,
                Password = PwdEncryptor.Encrypt(password)
            };
            newUser = await _service.Add(newUser);
            reply.User = Converter(newUser);
            return reply;
        }

        public override async Task<Reply> Delete(StringId request, ServerCallContext context)
        {
            var reply = new Reply();
            var user = await _userService.GetUser(context.GetHttpContext());
            if (user == null)
            {
                reply.Error = Error.NeedLogin;
                return reply;
            }

            if (!user.HasWritePermission())
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            await _userService.ClearUser(request.Id);
            var existed = await _service.All().FirstOrDefaultAsync(u => u.Id == request.Id);
            if (existed == null)
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }

            await _service.Delete(existed);
            return reply;
        }

        private async Task<Reply> UpdateFields(string id, ServerCallContext context,
            Func<User, Task<Error>> updateField)
        {
            var reply = new Reply();
            var user = await _userService.GetUser(context.GetHttpContext());
            if (user == null)
            {
                reply.Error = Error.NeedLogin;
                return reply;
            }

            if (!user.HasWritePermission())
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                reply.Error = Error.InvalidArguments;
            }
            else
            {
                var item = await _service.All().Where(i => i.Id == id).FirstOrDefaultAsync();
                if (item != null)
                {
                    reply.Error = await updateField(item);
                    if (reply.Error == Error.None)
                    {
                        await _service.Update(item);
                    }
                }
                else
                {
                    reply.Error = Error.NoSuchEntity;
                }
            }

            return reply;
        }

        public override Task<Reply> UpdateType(UpdateTypeRequest request, ServerCallContext context)
        {
            return UpdateFields(request.Id, context, async user =>
            {
                if (request.UserType == Users.User.Types.Type.Adm)
                {
                    return Error.InvalidOperation;
                }

                if (request.UserType == Users.User.Types.Type.Normal)
                {
                    user.Authorised = 0;
                    await _userService.ClearUser(request.Id);
                }
                else if (request.UserType == Users.User.Types.Type.Authorised)
                {
                    user.Authorised = 1;
                    await _userService.ClearUser(request.Id);
                }

                return Error.None;
            });
        }

        public override Task<Reply> UpdateAuthorisationExpired(UpdateAuthorisionExpiredRequest request,
            ServerCallContext context)
        {
            return UpdateFields(request.Id, context, async user =>
            {
                user.AuthorisionExpired = request.AuthorisionExpired.ToDateTime().ToUniversalTime();
                await _userService.ClearUser(request.Id);
                return Error.None;
            });
        }

        public override Task<Reply> UpdateStatus(UpdateStatusRequest request, ServerCallContext context)
        {
            return UpdateFields(request.Id, context, async user =>
            {
                user.Status = request.UserStatus == Users.User.Types.Status.Disabled ? 0 : 1ul;
                await _userService.ClearUser(request.Id);
                return Error.None;
            });
        }

        public override Task<Reply> UpdateComment(UpdateCommentRequest request, ServerCallContext context)
        {
            return UpdateFields(request.Id, context, user =>
            {
                user.Comment = request.Comment;
                return Task.FromResult(Error.None);
            });
        }
    }
}