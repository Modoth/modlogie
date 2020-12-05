using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Modlogie.Domain;
using Modlogie.Domain.Models;
using Newtonsoft.Json;

namespace Modlogie.Api.Controllers
{
    public class Template
    {
        public Guid Id { get; set; }

        public string ListPrefix { get; set; }

        public string ListSurfix { get; set; }

        public string ArticlePrefix { get; set; }

        public string ArticleSurfix { get; set; }

        public DateTime Updated { get; set; }

        public static implicit operator Template(ContentTemplate t)
        {
            if (t == null)
            {
                return null;
            }
            var template = JsonConvert.DeserializeObject<Template>(t.Data);
            template.Updated = t.Updated;
            template.Id = t.Id;
            return template;
        }
    }

    [Route("content/static")]
    public class ContentCacheController : Controller
    {
        private static Dictionary<string, Template> _templateCaches = new Dictionary<string, Template>();
        private const int PageSize = 10;
        private readonly IContentTemplatesEntityService _templatesService;
        private readonly IContentsEntityService _contentsService;
        private readonly IFileContentService _filesService;

        private readonly string _resourcesGroup;


        public ContentCacheController(IConfiguration configuration,
        IContentTemplatesEntityService templatesService,
        IContentsEntityService contentsService,
        IFileContentService filesService)
        {
            _templatesService = templatesService;
            _contentsService = contentsService;
            _filesService = filesService;
            _resourcesGroup = configuration.GetValue<string>("File:Resources");
        }

        private async Task<Template> GetTemplate(string templateName)
        {
            if (!_templateCaches.TryGetValue(templateName, out Template template))
            {
                template = await _templatesService.All().Where(t => t.Name == templateName).FirstOrDefaultAsync();
                if (template != null)
                {
                    _templateCaches[templateName] = template;
                }
                return template;
            }
            var newT = await _templatesService.All().Where(t => t.Name == templateName && t.Updated > template.Updated).FirstOrDefaultAsync();
            if (newT != null)
            {
                template = newT;
                _templateCaches[templateName] = template;
            }

            var existed = await _templatesService.All().Where(t => t.Name == templateName).AnyAsync();
            if (!existed)
            {
                _templateCaches.Remove(templateName);
                return null;
            }

            return template;
        }

        [HttpGet("{templateName}/{page?}")]
        public async Task<object> Get(string templateName, int page = 0)
        {
            var template = await GetTemplate(templateName);
            if (template == null)
            {
                return NotFound();
            }
            var items = await _contentsService.All()
            .OrderByDescending(c => c.Created)
            .Skip(page * PageSize).Take(PageSize)
            .Select(c => new { ContentCaches = c.ContentCaches, Id = c.Id, Name = c.Name })
            .ToListAsync();
            var sb = new StringBuilder();
            sb.Append(template.ListPrefix);
            sb.Append("<ol>");
            foreach (var item in items)
            {
                var url = $"/content/static/{templateName}/file/{item.Id}";
                if (item.ContentCaches != null)
                {
                    var cache = item.ContentCaches.FirstOrDefault(c => c.TemplateId == template.Id);
                    if (cache != null)
                    {
                        url = $"/{cache.Content}";
                    }
                }
                sb.Append($"<li><a href=\"{url}\">{item.Name}</a></li>");
            }
            sb.Append("</ol>");
            sb.Append(template.ListSurfix);
            return Content(sb.ToString(), "text/html");
        }

        [HttpGet("{templateName}/file/{articleId}")]
        public async Task<object> Get(string templateName, string articleId)
        {
            var template = await GetTemplate(templateName);
            if (template == null || !Guid.TryParse(articleId, out Guid id))
            {
                return NotFound();
            }
            var item = await _contentsService.All().Include(c => c.ContentCaches)
            .FirstOrDefaultAsync(c => c.Id == id);
            if (item == null)
            {
                return NotFound();

            }
            var cache = item.ContentCaches.FirstOrDefault(c => c.TemplateId == template.Id);
            if (cache != null)
            {
                return Redirect($"/{cache.Content}");
            }

            var cacheContent = $"{template.ArticlePrefix}\n{item.Data}\n{template.ArticleSurfix}";

            var cacheId = await _filesService.Add(_resourcesGroup, cacheContent, "html");

            cache = new ContentCache
            {
                ContentId = item.Id,
                TemplateId = template.Id,
                Content = cacheId,
                Updated = DateTime.Now
            };

            if (item.ContentCaches == null)
            {
                item.ContentCaches = new List<ContentCache>();
            }

            item.ContentCaches.Add(cache);

            await _contentsService.Update(item);

            return Content(cacheContent, "text/html", UTF8Encoding.Default);
        }
    }
}