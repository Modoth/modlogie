using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Modlogie.Api.Common
{
    public interface ILoginUserService
    {
        Task<string> GetUser(HttpContext context);

        Task SetUser(HttpContext context, string userName);

        Task ClearUser(HttpContext context);
    }
}