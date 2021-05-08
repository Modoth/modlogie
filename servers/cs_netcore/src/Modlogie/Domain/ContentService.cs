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
        private readonly IFileContentService _fileService;

        public ContentService(IContentsEntityService entitiesService, IFileContentService fileService)
        {
            _entitiesService = entitiesService;
            _fileService = fileService;
        }

        public async Task Delete(string id)
        {
            if (Guid.TryParse(id, out var gid))
            {
                var content = await _entitiesService.All().Include(c => c.ContentCaches).Where(c => c.Id == gid).FirstOrDefaultAsync();
                if (content == null)
                {
                    return;
                }
                var files = content.ContentCaches == null ? null : content.ContentCaches.Select(c => c.Content).ToList();
                await _entitiesService.Delete(content);
                if (files != null && files.Count > 0)
                {
                    files.ForEach(f => _fileService.Delete(f));
                }
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

            var content = await _entitiesService.All().Include(c => c.ContentCaches).FirstOrDefaultAsync(c => c.Id == article.Id);
            var existed = content != null;
            if (!existed)
            {
                content = new Content
                {
                    Id = article.Id,
                    Created = DateTime.Now
                };
            }

            content.Updated = DateTime.Now;
            content.Name = article.Title;
            content.Group = article.Group;
            content.Data = sb.ToString();
            content.Url = article.Url;
            if (existed)
            {
                content = await _entitiesService.Update(content);
                var files = content.ContentCaches == null ? null : content.ContentCaches.Select(c => c.Content).ToList();
                if (files != null && files.Count > 0)
                {
                    files.ForEach(f => _fileService.Delete(f));
                }
            }
            else
            {
                content = await _entitiesService.Add(content);
            }
            return content.Id.ToString();
        }
    }
}