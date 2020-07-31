using System;
using System.Linq;
using System.Threading.Tasks;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Modlogie.Api.Common;
using Modlogie.Api.Login;
using Modlogie.Domain;

namespace Modlogie.Api.Services
{
    public class LoginService : Modlogie.Api.Login.LoginService.LoginServiceBase
    {
        private readonly IAccontValidationService _validator;
        private readonly ILoginUserService _loginUserService;
        private readonly IUsersEntityService _usersService;
        private readonly ILogger<LoginService> _logger;


        public LoginService(ILoginUserService loginUserService, ILogger<LoginService> logger, IAccontValidationService validator, IUsersEntityService usersService)
        {
            _logger = logger;
            _validator = validator;
            _loginUserService = loginUserService;
            _usersService = usersService;
        }

        public async override Task<AccountReply> CheckLogin(Google.Protobuf.WellKnownTypes.Empty request, ServerCallContext context)
        {
            var reply = new AccountReply();
            var user = await _loginUserService.GetUser(context.GetHttpContext());
            if (user != null)
            {
                UpdateAccountReply(reply, user);
            }
            return reply;
        }

        public async override Task<Reply> Logout(Google.Protobuf.WellKnownTypes.Empty request, ServerCallContext context)
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
                reply.Type = Users.User.Types.Type.Adm;
            }
            else if (user.Authorised)
            {
                reply.Type = Users.User.Types.Type.Authorised;
            }
            reply.Email = user.Email ?? "";
        }

        public override async Task<Reply> UpdateName(UpdateNameRequest request, ServerCallContext context)
        {
            var reply = new Reply();
            if (!PwdEncrypter.ValidateUserName(request.NewName))
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
            if (!PwdEncrypter.ValidateUserName(request.NewPassword))
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
            var userEntity = await _usersService.All().FirstOrDefaultAsync(u => u.Id == user.Id && u.Password == PwdEncrypter.Encrypt(request.Password));
            if (userEntity == null)
            {
                reply.Error = Error.InvalidUserOrPwd;
                return reply;
            }
            userEntity.Password = PwdEncrypter.Encrypt(request.NewPassword);
            await _usersService.Update(userEntity);
            await _loginUserService.ClearUser(context.GetHttpContext());
            return reply;
        }

        public async override Task<AccountReply> Login(Account request, ServerCallContext context)
        {
            var reply = new AccountReply();
            var user = await _validator.Validate(request.Name, request.Pwd);
            if (user != null)
            {
                await this._loginUserService.SetUser(context.GetHttpContext(), user);
                UpdateAccountReply(reply, user);
            }
            else
            {
                reply.Error = Error.InvalidUserOrPwd;
                await this._loginUserService.SetUser(context.GetHttpContext(), null);
            }
            return reply;
        }

    }
}
