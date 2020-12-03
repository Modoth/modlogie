using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Modlogie.Domain;

namespace Modlogie.Api.Controllers
{
    [Route("[controller]")]
    public class RssController : Controller
    {
        private string RssPathKey(string group) => $"LATEST_RSS_CACHE_PATH_{group}";
        private string RssTimeKey(string group) => $"LATEST_RSS_CACHE_TIME_{group}";

        private readonly IContentsEntityService _contentsService;
        private readonly string _cachesGroup;
        private readonly IFileContentService _fileService;
        private readonly IDistributedCache _cache;

        private const Int32 MaxRssItemCount = 100;

        public RssController(IConfiguration configuration,
            IFileContentService fileService,
            IDistributedCache cache,
            IContentsEntityService contentsService)
        {
            _cachesGroup = configuration.GetValue<string>("File:Caches");
            _fileService = fileService;
            _cache = cache;
            _contentsService = contentsService;
        }

        private static int TimeZoneValue = 8;

        private string FormatDatetime(DateTime time)
        {
            return time.AddHours(TimeZoneValue).ToLocalTime().ToString();
        }

        private async Task<(string, DateTime, bool)> GenerateRss(string group)
        {
            var contents = await _contentsService.All()
            .Where(c => String.Equals(c.Group, group, StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(c => c.Created).Take(MaxRssItemCount).ToListAsync();
            if (contents.Count == 0)
            {
                return (null, default(DateTime), true);
            }
            var created = contents[0].Created;
            var sb = new StringBuilder();
            sb.Append(@"<?xml version=""1.0"" encoding=""UTF-8""?>
<rss version=""2.0"" xmlns:atom=""http://www.w3.org/2005/Atom"">
<channel>
" +
$"    <lastBuildDate>{FormatDatetime(created)}</lastBuildDate>" + @"
    <ttl>180</ttl>");
            foreach (var content in contents)
            {
                sb.Append(@"
    <item>
" +
$"        <title>{content.Name}</title>\n" +
$"        <link>{content.Url}</link>" + @"
        <description>");
                sb.Append(content.Data);
                sb.Append(@"
        </description>
" +
$"        <pubDate>{FormatDatetime(content.Created)}</pubDate>\n" +
$"        <guid>{content.Id}</guid>" + @"
    </item>");
            }
            sb.Append(@"
</channel>
</rss>");
            return (sb.ToString(), created, false);
        }


        private async Task<(string, string, bool)> CacheRss(string group)
        {
            var (rss, created, err) = await GenerateRss(group);
            var version = await _fileService.Add(_cachesGroup, rss, "rss");
            await _cache.SetStringAsync(RssPathKey(group), version);
            await _cache.SetStringAsync(RssTimeKey(group), created.Ticks.ToString());
            return (rss, version, false);
        }
        private async Task<(string, string, bool)> GetRssFromCache(string group)
        {
            var version = await _cache.GetStringAsync(RssPathKey(group));
            if (string.IsNullOrWhiteSpace(version))
            {
                return await CacheRss(group);
            }
            if (!long.TryParse(await _cache.GetStringAsync(RssTimeKey(group)), out long created))
            {
                return await CacheRss(group);
            }
            var latestContentCreated = await _contentsService.All()
            .Where(c => String.Equals(c.Group, group, StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(c => c.Created)
            .Select(c => c.Created)
            .FirstOrDefaultAsync();
            if (latestContentCreated.Ticks == 0)
            {
                return (null, null, true);
            }
            if (latestContentCreated.Ticks > created)
            {
                return await CacheRss(group);
            }
            return (null, version, false);
        }

        [HttpGet("{group}")]
        public async Task<object> Get(string group)
        {
            var (rss, url, notFount) = await GetRssFromCache(group);
            if (notFount)
            {
                return NotFound();
            }
            if (String.IsNullOrWhiteSpace(rss))
            {
                return Redirect("/" + url);
            }
            return Content(rss, "application/rss+xml", UTF8Encoding.Default);
        }
    }
}