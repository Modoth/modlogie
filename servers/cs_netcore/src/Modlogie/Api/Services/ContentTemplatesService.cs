using System;
using System.Collections.Generic;
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
        private readonly IFileContentService _fileService;
        private readonly IContentTemplatesEntityService _service;
        private readonly ILoginUserService _userService;

        public ContentTemplatesService(IContentTemplatesEntityService service, ILoginUserService userService,
            IFileContentService fileService)
        {
            _service = service;
            _userService = userService;
            _fileService = fileService;
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
                if (!Guid.TryParse(request.Id, out var id))
                {
                    reply.Error = Error.InvalidArguments;
                    return reply;
                }

                var item = await _service.All().Include(c => c.ContentCaches).Where(c => c.Id == id)
                    .FirstOrDefaultAsync();
                item.Data = request.Data;
                item.Updated = DateTime.Now;
                reply.Id = request.Id;
                var files = item.ContentCaches?.Select(c => c.Content).ToList();
                item.ContentCaches = new List<Domain.Models.ContentCache>();
                await _service.Update(item);
                if (files != null && files.Count > 0)
                {
                    files.ForEach(f => _fileService.Delete(f));
                }

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

            if (!Guid.TryParse(request.Id, out var id))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var item = await _service.All().Include(c => c.ContentCaches).Where(k => k.Id == id).FirstOrDefaultAsync();
            if (item != null)
            {
                var files = item.ContentCaches?.Select(c => c.Content).ToList();
                await _service.Delete(item);
                if (files != null && files.Count > 0)
                {
                    files.ForEach(f => _fileService.Delete(f));
                }
            }

            return reply;
        }
    }
}