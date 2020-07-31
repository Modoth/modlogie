using System;
using System.Collections.Generic;

namespace Modlogie.Domain.Models
{
    public partial class User : IEntity<string>
    {

    }
}

namespace Modlogie.Domain
{
    public interface IUsersEntityService : IEntityService<Domain.Models.User, string>
    {

    }
}
