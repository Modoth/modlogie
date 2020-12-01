using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;
using Modlogie.Api.Common;
using Modlogie.Api.Files;
using Modlogie.Api.Publish;
using Modlogie.Domain;
using AddRequest = Modlogie.Api.Publish.AddRequest;

namespace Modlogie.Api.Services
{
    public class PublishService : Publish.PublishService.PublishServiceBase
    {
        private readonly IFilesEntityService _filesService;

        private readonly Dictionary<string, IPublishService> _publishServices =
            new Dictionary<string, IPublishService>();

        private readonly ILoginUserService _userService;

        public PublishService(IWxService wxService,
            ILoginUserService userService,
            IFilesEntityService filesService
        )
        {
            _publishServices.Add("wx", wxService);
            _userService = userService;
            _filesService = filesService;
        }

        public override async Task<AddResponce> Add(AddRequest request, ServerCallContext context)
        {
            var reply = new AddResponce();
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

            var publishService = _publishServices[request.Type];
            if (publishService == null)
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            if (!Guid.TryParse(request.ArticleId, out var articleId))
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }

            var file = await _filesService.All()
                .Where(f => f.Id == articleId && f.Type == (int) File.Types.FileType.Normal)
                .FirstOrDefaultAsync();
            if (file == null)
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }

            try
            {
                var article = new PublishArticle
                {
                    Title = file.Name,
                    BaseUrl = request.BaseUrl,
                    Url = request.Url
                };
                var regexp = new Regex(@"\$\{FILENAME=(.*?)\}");
                var matches = regexp.Matches(request.Content);
                var slices = new List<PublishArticleSlice>();
                var cur = 0;
                foreach (Match match in matches)
                {
                    if (match.Index > cur)
                        slices.Add(new PublishArticleSlice
                        {
                            Type = PublishArticleSliceType.String,
                            Value = request.Content.Substring(cur, match.Index - cur)
                        });
                    slices.Add(new PublishArticleSlice
                    {
                        Type = PublishArticleSliceType.Image,
                        Value = match.Groups[1].Value
                    });
                    cur = match.Index + match.Value.Length;
                }

                if (cur < request.Content.Length)
                    slices.Add(new PublishArticleSlice
                    {
                        Type = PublishArticleSliceType.String,
                        Value = request.Content.Substring(cur, request.Content.Length - cur)
                    });
                article.Slices = slices.ToArray();
                var id = await publishService.Publish(article);
                reply.Id = id;
            }
            catch
            {
                reply.Error = Error.InvalidArguments;
            }

            return reply;
        }

        public override async Task<Reply> Delete(DeleteRequest request, ServerCallContext context)
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

            var publishService = _publishServices[request.Type];
            if (publishService == null)
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            try
            {
                await publishService.Delete(request.Id);
            }
            catch
            {
                reply.Error = Error.InvalidArguments;
            }

            return reply;
        }
    }
}