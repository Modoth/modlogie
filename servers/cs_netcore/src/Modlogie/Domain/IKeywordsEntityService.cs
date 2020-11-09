using Modlogie.Domain.Models;

namespace Modlogie.Domain.Models
{
    public partial class Keyword : IEntity<string>
    {
    }
}

namespace Modlogie.Domain
{
    public interface IKeywordsEntityService : IEntityService<Keyword, string>
    {
    }
}