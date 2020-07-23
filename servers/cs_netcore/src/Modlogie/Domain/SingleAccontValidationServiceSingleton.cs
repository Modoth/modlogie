using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace Modlogie.Domain
{
    public class SingleAccontValidationServiceSingleton : IAccontValidationService
    {
        private readonly string _userName;

        private readonly string _password;

        public SingleAccontValidationServiceSingleton(IConfiguration configuration)
        {
            _userName = configuration.GetValue<string>("User:Name");
            _password = configuration.GetValue<string>("User:Password");
        }
        public Task<bool> Validate(string name, string pwd)
        {
            var invalid = string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(pwd) || name != _userName || pwd != _password;
            return Task.FromResult(!invalid);
        }
    }
}