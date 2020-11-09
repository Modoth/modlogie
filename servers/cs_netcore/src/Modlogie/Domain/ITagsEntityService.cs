using System;
using Modlogie.Domain.Models;

namespace Modlogie.Domain.Models
{
    public partial class Tag : IEntity<Guid>
    {
    }
}

namespace Modlogie.Domain
{
    public interface ITagsEntityService : IEntityService<Tag, Guid>
    {
    }
}