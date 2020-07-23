using System;
using System.Text;
using System.Threading.Tasks;
using Grpc.Core;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Modlogie.Api
{
    public static class DistributedSessionMiddlewareExtensions
    {
        public static IApplicationBuilder UseDistributedSession(
            this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<DistributedSessionMiddleware>();
        }

        public static IServiceCollection AddDistributedSession(this IServiceCollection services, Action<DistributedSessionOptions> configure)
        {
            services.Configure(configure);
            return services;
        }

        public static string GetSessionId(this HttpContext context)
        {
            context.Items.TryGetValue(DistributedSessionMiddleware.SESSION_ID_ITEM_KEY, out object res);
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
        public const string SESSION_ID_ITEM_KEY = nameof(SESSION_ID_ITEM_KEY);

        public const string CACHE_SESSION_TYPE = nameof(CACHE_SESSION_TYPE);
        private readonly DistributedCacheEntryOptions _cacheOption;
        private readonly RequestDelegate _next;
        private readonly ILogger<DistributedSessionMiddleware> _logger;
        private readonly DistributedSessionOptions _options;
        private readonly CookieOptions _cookieOption;

        public DistributedSessionMiddleware(RequestDelegate next, ILoggerFactory loggerFactory, IOptions<DistributedSessionOptions> options)
        {
            _options = options.Value;
            _cookieOption = new CookieOptions();
            _cookieOption.HttpOnly = true;
            _cacheOption = new DistributedCacheEntryOptions { SlidingExpiration = _options.IdleTimeout };

            _next = next;
            _logger = loggerFactory.CreateLogger<DistributedSessionMiddleware>();

        }

        public async Task InvokeAsync(HttpContext context, IDistributedCache cache)
        {
            var sessionId = context.Request.Cookies[_options.CookieName];
            if (string.IsNullOrWhiteSpace(sessionId) || (await cache.GetStringAsync(sessionId)) != CACHE_SESSION_TYPE)
            {
                var encodedBytes = Encoding.Unicode.GetBytes(Guid.NewGuid().ToString());
                sessionId = Convert.ToBase64String(encodedBytes);
                await cache.SetStringAsync(sessionId, CACHE_SESSION_TYPE, _cacheOption);
                _cookieOption.Expires = DateTimeOffset.UtcNow.AddDays(1);
                context.Response.Cookies.Append(_options.CookieName, sessionId, _cookieOption);
            }
            context.Items.Add(SESSION_ID_ITEM_KEY, sessionId);
            await _next(context);
        }
    }
}