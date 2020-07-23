using System;
using System.Linq;
using System.Threading.Tasks;
using Grpc.Core;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Modlogie.Api.Common;
using Modlogie.Domain;

namespace Modlogie.Api.Services
{
    public class LoginService : Modlogie.Api.LoginService.LoginServiceBase
    {
        private readonly IAccontValidationService _validator;
        private readonly ILoginUserService _loginUserService;
        private readonly ILogger<LoginService> _logger;


        public LoginService(ILoginUserService loginUserService, ILogger<LoginService> logger, IAccontValidationService validator)
        {
            _logger = logger;
            _validator = validator;
            _loginUserService = loginUserService;
        }

        public async override Task<UserReply> CheckLogin(Google.Protobuf.WellKnownTypes.Empty request, ServerCallContext context)
        {
            var replay = new UserReply();
            var name = await _loginUserService.GetUser(context.GetHttpContext());
            if (!string.IsNullOrWhiteSpace(name))
            {
                replay.Name = name;
            }
            return replay;
        }

        public async override Task<Reply> Logout(Google.Protobuf.WellKnownTypes.Empty request, ServerCallContext context)
        {
            var replay = new Reply();
            await _loginUserService.ClearUser(context.GetHttpContext());
            return replay;
        }

        public async override Task<UserReply> Login(Account request, ServerCallContext context)
        {
            var replay = new UserReply();
            if (await _validator.Validate(request.Name, request.Pwd))
            {
                await this._loginUserService.SetUser(context.GetHttpContext(), request.Name);
                replay.Name = request.Name;
            }
            else
            {
                replay.Error = Error.InvalidUserOrPwd;
                await this._loginUserService.SetUser(context.GetHttpContext(), null);
            }
            return replay;
        }

    }
}
