using System;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Modlogie.Api
{
    public static class DistributedSessionMiddlewareExtensions
    {
        public static void UseDistributedSession(this IApplicationBuilder builder)
        {
            builder.UseMiddleware<DistributedSessionMiddleware>();
        }

        public static void AddDistributedSession(this IServiceCollection services,
            Action<DistributedSessionOptions> configure)
        {
            services.Configure(configure);
        }

        public static string GetSessionId(this HttpContext context)
        {
            context.Items.TryGetValue(DistributedSessionMiddleware.SessionIdItemKey, out var res);
            return res as string;
        }
    }

    public class DistributedSessionOptions
    {
        public string CookieName { get; set; }

        public TimeSpan IdleTimeout { get; set; }
    }

    public class DistributedSessionMiddleware
    {
        public const string SessionIdItemKey = "SESSION_ID_ITEM_KEY";

        private const string CacheSessionType = "CACHE_SESSION_TYPE";
        private readonly DistributedCacheEntryOptions _cacheOption;
        private readonly CookieOptions _cookieOption;
        private readonly RequestDelegate _next;
        private readonly DistributedSessionOptions _options;

        public DistributedSessionMiddleware(RequestDelegate next,
            IOptions<DistributedSessionOptions> options)
        {
            _options = options.Value;
            _cookieOption = new CookieOptions {HttpOnly = true};
            _cacheOption = new DistributedCacheEntryOptions {SlidingExpiration = _options.IdleTimeout};
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IDistributedCache cache)
        {
            var sessionId = context.Request.Cookies[_options.CookieName];
            if (string.IsNullOrWhiteSpace(sessionId) || await cache.GetStringAsync(sessionId) != CacheSessionType)
            {
                var encodedBytes = Encoding.Unicode.GetBytes(Guid.NewGuid().ToString());
                sessionId = Convert.ToBase64String(encodedBytes);
                await cache.SetStringAsync(sessionId, CacheSessionType, _cacheOption);
                _cookieOption.Expires = DateTimeOffset.UtcNow.AddDays(1);
                context.Response.Cookies.Append(_options.CookieName, sessionId, _cookieOption);
            }

            context.Items.Add(SessionIdItemKey, sessionId);
            await _next(context);
        }
    }
}