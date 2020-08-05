using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;
using Modlogie.Api.Common;
using Modlogie.Api.Tags;
using Modlogie.Domain;

namespace Modlogie.Api.Services
{
    public class TagsService : Modlogie.Api.Tags.TagsService.TagsServiceBase
    {
        private static Expression<Func<Domain.Models.Tag, Tag>> _selector = i =>
        new Tag
        {
            Id = i.Id.ToString(),
            Name = i.Name,
            Type = (Tag.Types.Type)i.Type,
            Values = i.Values
        };
        private static Func<Domain.Models.Tag, Tag> _converter = _selector.Compile();

        private readonly ITagsEntityService _service;
        private readonly ILoginUserService _userService;

        public TagsService(ITagsEntityService service, ILoginUserService userService)
        {
            _service = service;
            _userService = userService;
        }
        public async override Task<TagsReply> GetAll(Empty request, ServerCallContext context)
        {
            var reply = new TagsReply();
            reply.Tags.AddRange(await _service.All()
                .Select(_selector)
                .ToArrayAsync());
            return reply;
        }

        public async override Task<TagReply> Add(Tag request, ServerCallContext context)
        {
            var reply = new TagReply();
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
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }
            var existed = await _service.All().Where(i => i.Name == request.Name).FirstOrDefaultAsync();
            if (existed != null)
            {
                reply.Error = Error.EntityConflict;
                return reply;
            }
            var newTag = await _service.Add(new Domain.Models.Tag { Name = request.Name, Type = (int)request.Type, Values = request.Values });
            reply.Tag = _converter(newTag);
            return reply;
        }

        private async Task<Reply> UpdateFields(Tag request, ServerCallContext context, Func<Domain.Models.Tag, Task<Error>> updateField)
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
            if (Guid.TryParse(request.Id, out Guid id))
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
            else
            {
                reply.Error = Error.InvalidArguments;
            }
            return reply;
        }

        public override Task<Reply> UpdateName(Tag request, ServerCallContext context)
        {
            return this.UpdateFields(request, context, tag =>
            {
                tag.Name = request.Name;
                return Task.FromResult(Error.None);
            });
        }

        public override Task<Reply> UpdateValues(Tag request, ServerCallContext context)
        {
            return this.UpdateFields(request, context, tag =>
            {
                tag.Values = request.Values;
                return Task.FromResult(Error.None);
            });
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
            if (Guid.TryParse(request.Id, out Guid id))
            {
                var item = await _service.All().Where(k => k.Id == id).FirstOrDefaultAsync();
                if (item != null)
                {
                    await _service.Delete(item);
                }
                else
                {
                    reply.Error = Error.NoSuchEntity;
                }
            }
            else
            {
                reply.Error = Error.InvalidArguments;
            }

            return reply;
        }
    }
}