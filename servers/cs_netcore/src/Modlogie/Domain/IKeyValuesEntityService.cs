using System.Threading.Tasks;
using Modlogie.Domain.Models;

namespace Modlogie.Domain.Models
{
    public partial class KeyValue : IEntity<string>
    {
    }
}

namespace Modlogie.Domain
{
    public interface IKeyValuesEntityService : IEntityService<KeyValue, string>
    {
        Task<string> GetValue(string id);
    }
}