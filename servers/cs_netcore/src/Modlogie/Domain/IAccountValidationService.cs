using System.Threading.Tasks;

namespace Modlogie.Domain
{
    public class LoginUser
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public bool Authorised { get; set; }

        public bool Adm { get; set; }
    }

    public interface IAccountValidationService
    {
        Task<LoginUser> Validate(string name, string pwd);
    }
}