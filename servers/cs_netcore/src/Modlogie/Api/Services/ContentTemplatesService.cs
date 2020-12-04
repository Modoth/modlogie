using System;
using System.Linq;
using System.Threading.Tasks;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;
using Modlogie.Api.Common;
using Modlogie.Api.ContentTemplates;
using Modlogie.Domain;

namespace Modlogie.Api.Services
{
    public class ContentTemplatesService : ContentTemplates.ContentTemplatesService.ContentTemplatesServiceBase
    {
        private readonly IContentTemplatesEntityService _service;
        private readonly ILoginUserService _userService;

        public ContentTemplatesService(IContentTemplatesEntityService service, ILoginUserService userService)
        {
            _service = service;
            _userService = userService;
        }

        public override async Task<ContentTemplatesReply> GetAll(Empty request, ServerCallContext context)
        {
            var reply = new ContentTemplatesReply();
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

            var items = _service.All();

            reply.ContentTemplates.AddRange(await items
                .Select(i => new ContentTemplate { Id = i.Id.ToString(), Name = i.Name, Data = i.Data })
                .ToArrayAsync());
            return reply;
        }

        public override async Task<AddOrUpdateReply> AddOrUpdate(ContentTemplate request, ServerCallContext context)
        {
            var reply = new AddOrUpdateReply();
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

            if (!string.IsNullOrWhiteSpace(request.Id))
            {
                if (!Guid.TryParse(request.Id, out Guid id))
                {
                    reply.Error = Error.InvalidArguments;
                    return reply;
                }
                var item = await _service.All().Where(k => k.Id == id).FirstOrDefaultAsync();
                item.Data = request.Data;
                item.Updated = DateTime.Now;
                reply.Id = request.Id;
                return reply;
            }

            var newItem = await _service.Add(new Domain.Models.ContentTemplate
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Data = request.Data,
                Updated = DateTime.Now
            });
            reply.Id = newItem.Id.ToString();
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

            if (!Guid.TryParse(request.Id, out Guid id))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var item = await _service.All().Where(k => k.Id == id).FirstOrDefaultAsync();
            if (item != null)
            {
                await _service.Delete(item);
            }

            return reply;
        }
    }
}