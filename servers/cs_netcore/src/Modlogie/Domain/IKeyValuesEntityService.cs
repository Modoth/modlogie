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
    }
}