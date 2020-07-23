using System;
using System.Collections.Generic;

namespace Modlogie.Domain.Models
{
    public partial class Tag : IEntity<Guid>
    {

    }
}

namespace Modlogie.Domain
{
    public interface ITagsEntityService : IEntityService<Domain.Models.Tag, Guid>
    {

    }
}
