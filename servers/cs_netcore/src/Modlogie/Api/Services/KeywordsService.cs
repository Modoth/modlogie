using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;
using Modlogie.Api.Common;
using Modlogie.Api.Keywords;
using Modlogie.Domain;

namespace Modlogie.Api.Services
{
    public class KeywordsService : Api.Keywords.KeywordsService.KeywordsServiceBase
    {
        private readonly IKeywordsEntityService _service;
        private readonly ILoginUserService _userService;

        public KeywordsService(IKeywordsEntityService service, ILoginUserService userService)
        {
            _service = service;
            _userService = userService;
        }

        private static Expression<Func<Domain.Models.Keyword, Keyword>> _selector = i =>
        new Keyword
        {
            Id = i.Id,
            Description = i.Description ?? "",
            Url = i.Url
        };
        private static Func<Domain.Models.Keyword, Keyword> _converter = _selector.Compile();

        public async override Task<KeywordReply> Get(StringId request, ServerCallContext context)
        {
            var reply = new KeywordReply();
            var item = await _service.All().Where(i => i.Id == request.Id).FirstOrDefaultAsync();
            if (item != null)
            {
                reply.Keyword = _converter(item);
            }
            return reply;
        }

        public async override Task<KeywordsReply> GetAll(Keywords.GetAllRequest request, ServerCallContext context)
        {
            var reply = new KeywordsReply();
            var items = _service.All();
            if (!string.IsNullOrWhiteSpace(request.Filter))
            {
                items = items.Where(i => i.Id.Contains(request.Filter.Trim(), StringComparison.CurrentCultureIgnoreCase));
            }
            if (request.Skip > 0 || request.Take > 0)
            {
                reply.Total = await items.CountAsync();
            }
            if (request.Skip > 0)
            {
                items = items.Skip(request.Skip);
            }
            if (request.Take > 0)
            {
                items = items.Take(request.Take);
            }
            reply.Keywords.AddRange(await items
                .Select(_selector)
                .ToArrayAsync());
            return reply;
        }

        public async override Task<Reply> Add(Keyword request, ServerCallContext context)
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
            if (string.IsNullOrWhiteSpace(request.Id) || string.IsNullOrWhiteSpace(request.Url))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }
            var item = await _service.All().Where(k => k.Id == request.Id).FirstOrDefaultAsync();
            if (item != null)
            {
                reply.Error = Error.EntityConflict;
                return reply;
            }
            var newItem = new Modlogie.Domain.Models.Keyword
            {
                Id = request.Id,
                Url = request.Url
            };
            if (!string.IsNullOrWhiteSpace(request.Description))
            {
                newItem.Description = request.Description;
            }
            newItem = await _service.Add(newItem);

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

        public override Task<Reply> UpdateUrl(Keyword request, ServerCallContext context)
        {
            return UpdateFields(request, context, (keyword) =>
           {
               keyword.Url = request.Url;
               return Task.FromResult(Error.None);
           });
        }

        public override Task<Reply> UpdateDescription(Keyword request, ServerCallContext context)
        {
            return UpdateFields(request, context, (keyword) =>
           {
               keyword.Description = request.Description;
               return Task.FromResult(Error.None);
           });
        }

        private async Task<Reply> UpdateFields(Keyword request, ServerCallContext context, Func<Domain.Models.Keyword, Task<Error>> updateField)
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
            var item = await _service.All().Where(i => i.Id == request.Id).FirstOrDefaultAsync();
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
            return reply;
        }
    }
}