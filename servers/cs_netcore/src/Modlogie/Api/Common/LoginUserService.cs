using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;

namespace Modlogie.Api.Common
{
    public class LoginUserService : ILoginUserService
    {
        public LoginUserService(IConfiguration configuration, IDistributedCache cache)
        {
            _cache = cache;
            _cacheOption = new DistributedCacheEntryOptions { SlidingExpiration = TimeSpan.FromSeconds(configuration.GetValue<int>("Session:IdleTimeout")) };
        }
        private readonly IDistributedCache _cache;
        private readonly DistributedCacheEntryOptions _cacheOption;

        private static string GetKeyOfUserName(string sessionId)
        {
            return $"{sessionId}-login-user-id";
        }

        private static string GetKeyOfSessionId(string name)
        {
            return $"{name}-session-id";
        }

        public async Task ClearUser(HttpContext context)
        {
            var sessionId = context.GetSessionId();
            var name = await _cache.GetStringAsync(GetKeyOfUserName(sessionId));
            if (name != null)
            {
                await _cache.RemoveAsync(GetKeyOfSessionId(name));
                await _cache.RemoveAsync(GetKeyOfUserName(sessionId));
            }
        }

        public async Task<string> GetUser(HttpContext context)
        {
            var sessionId = context.GetSessionId();
            var name = await _cache.GetStringAsync(GetKeyOfUserName(sessionId));
            return name;
        }

        public async Task SetUser(HttpContext context, string userName)
        {
            var sessionId = context.GetSessionId();
            var existedName = await _cache.GetStringAsync(GetKeyOfUserName(sessionId));
            await _cache.RemoveAsync(GetKeyOfSessionId(existedName));
            if (userName != null)
            {
                await _cache.SetStringAsync(GetKeyOfUserName(sessionId), userName);
                await _cache.SetStringAsync(GetKeyOfSessionId(userName), sessionId);
            }
            else
            {
                await _cache.RemoveAsync(GetKeyOfUserName(sessionId));
            }
        }
    }
}