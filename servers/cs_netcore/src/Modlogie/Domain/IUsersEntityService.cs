using Modlogie.Domain.Models;

namespace Modlogie.Domain.Models
{
    public partial class User : IEntity<string>
    {
    }
}

namespace Modlogie.Domain
{
    public interface IUsersEntityService : IEntityService<User, string>
    {
    }
}