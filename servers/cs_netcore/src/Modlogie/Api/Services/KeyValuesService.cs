using System.Linq;
using System.Threading.Tasks;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;
using Modlogie.Api.Common;
using Modlogie.Api.KeyValues;
using Modlogie.Domain;

namespace Modlogie.Api.Services
{
    public class KeyValuesService : Api.KeyValues.KeyValuesService.KeyValuesServiceBase
    {
        private readonly IKeyValuesEntityService _service;
        private readonly ILoginUserService _userService;

        public KeyValuesService(IKeyValuesEntityService service, ILoginUserService userService)
        {
            _service = service;
            _userService = userService;
        }

        public async override Task<KeyValuesReply> GetAll(Empty request, ServerCallContext context)
        {
            var reply = new KeyValuesReply();
            var items = _service.All();
            if (!(await _userService.GetUser(context.GetHttpContext())).HasWritePermission())
            {
                items = items.Where(i => i.Type != 1);
            }
            reply.KeyValues.AddRange(await items
                .Select(i => new KeyValue { Id = i.Id, Value = i.Value })
                .ToArrayAsync());
            return reply;
        }

        public async override Task<KeyValueReply> AddOrUpdate(KeyValue request, ServerCallContext context)
        {
            var reply = new KeyValueReply();
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
            if (string.IsNullOrWhiteSpace(request.Id))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }
            var item = await _service.All().Where(k => k.Id == request.Id).FirstOrDefaultAsync();
            var newItem = item;
            if (item != null)
            {
                item.Value = request.Value;
                newItem = await _service.Update(item);
            }
            else
            {
                newItem = await _service.Add(new Domain.Models.KeyValue { Id = request.Id, Value = request.Value });
            }
            reply.KeyValue = new KeyValue { Id = newItem.Id, Value = newItem.Value };
            return reply;
        }

        public async override Task<Reply> Delete(StringId request, ServerCallContext context)
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
            var item = await _service.All().Where(k => k.Id == request.Id).FirstOrDefaultAsync();
            if (item != null)
            {
                await _service.Delete(item);
            }
            return reply;
        }

        public async override Task<ServerKeysReply> GetAllServerKeys(Empty request, ServerCallContext context)
        {
            var reply = new ServerKeysReply();
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
            reply.Keys.AddRange(Domain.ServerKeys.All.Select(k => new KeyValues.ServerKey { Key = k.Key, Type = (KeyValues.ServerKey.Types.Type)(int)k.Type }));
            return reply;
        }
    }
}