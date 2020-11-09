using System.Threading.Tasks;

namespace Modlogie.Domain
{
    public interface IEmailService
    {
        Task<bool> Send(string to, string subject, string content);
    }
}