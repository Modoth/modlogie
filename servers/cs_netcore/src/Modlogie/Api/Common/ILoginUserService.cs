using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Modlogie.Domain;

namespace Modlogie.Api.Common
{

    public interface ILoginUserService
    {
        Task<LoginUser> GetUser(HttpContext context);

        Task SetUser(HttpContext context, LoginUser user);

        Task ClearUser(HttpContext context);
        
        Task ClearUser(string id);
    }
}