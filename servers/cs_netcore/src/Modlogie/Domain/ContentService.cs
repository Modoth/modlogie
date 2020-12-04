using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Modlogie.Domain.Models;

namespace Modlogie.Domain
{
    public class ContentService : IContentService
    {
        private readonly IContentsEntityService _entitiesService;

        public ContentService(IContentsEntityService entitiesService)
        {
            _entitiesService = entitiesService;
        }

        public async Task Delete(string id)
        {
            if (Guid.TryParse(id, out var gid))
            {
                await _entitiesService.DeleteRange(_entitiesService.All().Where(c => c.Id == gid));
            }
        }

        public async Task<string> Publish(PublishArticle article)
        {
            var sb = new StringBuilder();
            foreach (var slice in article.Slices)
            {
                if (slice.Type == PublishArticleSliceType.String)
                {
                    sb.Append(slice.Value);
                    continue;
                }

                if (slice.Type == PublishArticleSliceType.Image)
                {
                    sb.Append($"{article.BaseUrl}/{slice.Value}");
                }
            }

            var content = await _entitiesService.All().FirstOrDefaultAsync(c => c.Id == article.Id);
            var existed = content != null;
            if (!existed)
            {
                content = new Content
                {
                    Id = article.Id
                };
            }

            content.Created = DateTime.Now;
            content.Name = article.Title;
            content.Group = article.Group;
            content.Data = sb.ToString();
            content.Url = article.Url;
            if (existed)
            {
                content = await _entitiesService.Update(content);
            }
            else
            {
                content = await _entitiesService.Add(content);
            }
            return content.Id.ToString();
        }
    }
}