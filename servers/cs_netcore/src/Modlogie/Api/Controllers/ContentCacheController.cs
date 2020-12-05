using System;
using System.Collections.Concurrent;
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
        private const int PageSize = 10;
        private static readonly ConcurrentDictionary<string, Template> TemplateCaches = new ConcurrentDictionary<string, Template>();

        private static string HomeCacheKey;
        private static string HomeCache;

        private static object HomeCacheLock = new object();

        private readonly IContentsEntityService _contentsService;
        private readonly IFileContentService _filesService;

        private readonly string _resourcesGroup;
        private readonly IContentTemplatesEntityService _templatesService;


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
            if (!TemplateCaches.TryGetValue(templateName, out var template))
            {
                template = await _templatesService.All().Where(t => t.Name == templateName).FirstOrDefaultAsync();
                if (template != null)
                {
                    TemplateCaches[templateName] = template;
                }

                return template;
            }

            var value = template;
            var newT = await _templatesService.All().Where(t => t.Name == templateName && t.Updated > value.Updated)
                .FirstOrDefaultAsync();
            if (newT != null)
            {
                template = newT;
                TemplateCaches[templateName] = template;
            }

            var existed = await _templatesService.All().Where(t => t.Name == templateName).AnyAsync();
            if (!existed)
            {
                TemplateCaches.Remove(templateName, out Template _);
                return null;
            }

            return template;
        }

        [HttpGet()]
        public async Task<object> Get()
        {
            var templates = await _templatesService.All().Select(t => t.Name).OrderBy(n => n).ToListAsync();
            if (templates.Count == 0)
            {
                return NotFound();
            }
            var groups = await _contentsService.All().Select(t => t.Group).Distinct().OrderBy(g => g).ToListAsync();
            if (groups.Count == 0)
            {
                return NotFound();
            }
            var cacheKey = String.Join(",", templates) + String.Join(",", groups);
            if (cacheKey != HomeCacheKey)
            {
                lock (HomeCacheLock)
                {
                    if (cacheKey != HomeCacheKey)
                    {
                        var sb = new StringBuilder();
                        sb.Append(@"<html>
<head>
  <meta charset=""utf-8"" />
  <title>Index</title>
  <meta
    name=""viewport""
    content=""width=device-width, maximum-scale=1.0,user-scalable=no, initial-scale=1""
  />
  <style>
  a {
    margin: 0 10px;
    }
  ul{
    margin: 20px auto;
    max-width: calc(min(90%, 760px));
  }
  </style>
</head>
<body>
    <ul>");
                        foreach (var group in groups)
                        {
                            sb.Append($"<li>{group}{String.Join("", templates.Select(t => $"<a href=\"/content/static/{t}/{group}\">{t}</a>"))}</li>");
                        }
                        sb.Append(@"    </ul></body>
</html>");
                        HomeCache = sb.ToString();
                        HomeCacheKey = cacheKey;
                    }
                }

            }

            return Content(HomeCache, "text/html", UTF8Encoding.Default);
        }

        [HttpGet("{templateName}/{group}/{page?}")]
        public async Task<object> Get(string templateName, string group, int page = 0)
        {
            var template = await GetTemplate(templateName);
            if (template == null)
            {
                return NotFound();
            }

            var items = await _contentsService.All()
            .Where(c => String.Equals(group, c.Group, StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(c => c.Created)
                .Skip(page * PageSize).Take(PageSize)
                .Select(c => new { c.ContentCaches, c.Id, c.Name })
                .ToListAsync();
            var sb = new StringBuilder();
            sb.Append(template.ListPrefix);
            sb.Append("<ol>");
            foreach (var item in items)
            {
                var url = $"/content/static/{templateName}/file/{item.Id}";
                var cache = item.ContentCaches?.FirstOrDefault(c => c.TemplateId == template.Id);
                if (cache != null)
                {
                    url = $"/{cache.Content}";
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
            if (template == null || !Guid.TryParse(articleId, out var id))
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

            item.ContentCaches ??= new List<ContentCache>();

            item.ContentCaches.Add(cache);

            await _contentsService.Update(item);

            return Content(cacheContent, "text/html", Encoding.Default);
        }
    }
}