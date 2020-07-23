using System.Threading.Tasks;

namespace Modlogie.Domain{
    public interface IAccontValidationService
    {
        Task<bool> Validate(string name, string pwd);
    }
}