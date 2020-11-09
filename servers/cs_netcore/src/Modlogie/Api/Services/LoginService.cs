using System.Threading.Tasks;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;
using Modlogie.Api.Common;
using Modlogie.Api.Login;
using Modlogie.Api.Users;
using Modlogie.Domain;

namespace Modlogie.Api.Services
{
    public class LoginService : Login.LoginService.LoginServiceBase
    {
        private readonly ILoginUserService _loginUserService;
        private readonly IUsersEntityService _usersService;
        private readonly IAccountValidationService _validator;


        public LoginService(ILoginUserService loginUserService,
            IAccountValidationService validator, IUsersEntityService usersService)
        {
            _validator = validator;
            _loginUserService = loginUserService;
            _usersService = usersService;
        }

        public override async Task<AccountReply> CheckLogin(Empty request, ServerCallContext context)
        {
            var reply = new AccountReply();
            var user = await _loginUserService.GetUser(context.GetHttpContext());
            if (user != null)
            {
                UpdateAccountReply(reply, user);
            }

            return reply;
        }

        public override async Task<Reply> Logout(Empty request, ServerCallContext context)
        {
            var replay = new Reply();
            await _loginUserService.ClearUser(context.GetHttpContext());
            return replay;
        }

        private void UpdateAccountReply(AccountReply reply, LoginUser user)
        {
            reply.Name = user.Id;
            if (user.Adm)
            {
                reply.Type = User.Types.Type.Adm;
            }
            else if (user.Authorised)
            {
                reply.Type = User.Types.Type.Authorised;
            }

            reply.Email = user.Email ?? "";
        }

        public override async Task<Reply> UpdateName(UpdateNameRequest request, ServerCallContext context)
        {
            var reply = new Reply();
            if (!PwdEncryptor.ValidateUserName(request.NewName))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var user = await _loginUserService.GetUser(context.GetHttpContext());
            if (user == null || user.Adm)
            {
                reply.Error = Error.InvalidOperation;
                return reply;
            }

            var userEntity = await _usersService.All().FirstOrDefaultAsync(u => u.Id == user.Id);
            if (userEntity == null)
            {
                reply.Error = Error.InvalidOperation;
                return reply;
            }

            if (userEntity.Id == request.NewName)
            {
                return reply;
            }

            var existed = await _usersService.All().FirstOrDefaultAsync(u => u.Id == request.NewName);
            if (existed != null)
            {
                reply.Error = Error.InvalidOperation;
                return reply;
            }

            userEntity.Id = request.NewName;
            await _usersService.Update(userEntity);
            user.Id = request.NewName;
            await _loginUserService.SetUser(context.GetHttpContext(), user);
            return reply;
        }

        public override async Task<Reply> UpdatePassword(UpdatePasswordRequest request, ServerCallContext context)
        {
            var reply = new Reply();
            if (!PwdEncryptor.ValidateUserName(request.NewPassword))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var user = await _loginUserService.GetUser(context.GetHttpContext());
            if (user == null || user.Adm)
            {
                reply.Error = Error.InvalidOperation;
                return reply;
            }

            var userEntity = await _usersService.All().FirstOrDefaultAsync(u =>
                u.Id == user.Id && u.Password == PwdEncryptor.Encrypt(request.Password));
            if (userEntity == null)
            {
                reply.Error = Error.InvalidUserOrPwd;
                return reply;
            }

            userEntity.Password = PwdEncryptor.Encrypt(request.NewPassword);
            await _usersService.Update(userEntity);
            await _loginUserService.ClearUser(context.GetHttpContext());
            return reply;
        }

        public override async Task<AccountReply> Login(Account request, ServerCallContext context)
        {
            var reply = new AccountReply();
            var user = await _validator.Validate(request.Name, request.Pwd);
            if (user != null)
            {
                await _loginUserService.SetUser(context.GetHttpContext(), user);
                UpdateAccountReply(reply, user);
            }
            else
            {
                reply.Error = Error.InvalidUserOrPwd;
                await _loginUserService.SetUser(context.GetHttpContext(), null);
            }

            return reply;
        }
    }
}