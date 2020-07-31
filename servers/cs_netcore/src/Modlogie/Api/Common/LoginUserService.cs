using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Modlogie.Domain;
using Newtonsoft.Json;

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

        private static string GetKeyOfUser(string sessionId)
        {
            return $"{sessionId}-login-user";
        }

        private static string GetKeyOfSessionId(string name)
        {
            return $"{name}-session-id";
        }

        public async Task ClearUser(string id)
        {
            var sessionId = await _cache.GetStringAsync(GetKeyOfSessionId(id));
            if (sessionId != null)
            {
                await _cache.RemoveAsync(GetKeyOfSessionId(id));
                await _cache.RemoveAsync(GetKeyOfUser(sessionId));
            }
        }

        public async Task ClearUser(HttpContext context)
        {
            var sessionId = context.GetSessionId();
            var user = await GetUser(sessionId);
            if (user != null)
            {
                await _cache.RemoveAsync(GetKeyOfSessionId(user.Id));
                await _cache.RemoveAsync(GetKeyOfUser(sessionId));
            }
        }

        public async Task<LoginUser> GetUser(string sessionId)
        {
            var userStr = await _cache.GetStringAsync(GetKeyOfUser(sessionId));
            if (string.IsNullOrWhiteSpace(userStr))
            {
                return null;
            }
            return JsonConvert.DeserializeObject<LoginUser>(userStr);
        }

        public async Task<LoginUser> GetUser(HttpContext context)
        {
            var sessionId = context.GetSessionId();
            return await GetUser(sessionId);
        }

        public async Task SetUser(HttpContext context, LoginUser user)
        {
            var userName = user.Id.ToString();
            var sessionId = context.GetSessionId();
            var existedName = await _cache.GetStringAsync(GetKeyOfUser(sessionId));
            await _cache.RemoveAsync(GetKeyOfSessionId(existedName));
            if (userName != null)
            {
                await _cache.SetStringAsync(GetKeyOfUser(sessionId), JsonConvert.SerializeObject(user));
                await _cache.SetStringAsync(GetKeyOfSessionId(userName), sessionId);
            }
            else
            {
                await _cache.RemoveAsync(GetKeyOfUser(sessionId));
            }
        }
    }
}