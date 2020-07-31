using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Modlogie.Domain
{
    public class AccontValidationServiceSingleton : IAccontValidationService
    {
        private readonly string _userName;

        private readonly string _password;
        private readonly IUsersEntityService _usersService;

        public AccontValidationServiceSingleton(IConfiguration configuration, IUsersEntityService usersService)
        {
            _userName = configuration.GetValue<string>("User:Name");
            _password = configuration.GetValue<string>("User:Password");
            _usersService = usersService;
        }
        public async Task<LoginUser> Validate(string name, string pwd)
        {
            var invalidAdm = string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(pwd) || name != _userName || pwd != _password;
            // return Task.FromResult(!invalid);
            if (!invalidAdm)
            {

                return new LoginUser { Id = name, Adm = true };
            }

            var user = await _usersService.All().FirstOrDefaultAsync(u => u.Status != 0 && u.Id == name && u.Password == PwdEncrypter.Encrypt(pwd));
            if (user == null)
            {
                return null;
            }

            return new LoginUser
            {
                Id = user.Id,
                Email = user.Email,
                Adm = false,
                Authorised = user.Authorised != 0 && user.AuthorisionExpired > DateTime.Now
            };
        }
    }
}