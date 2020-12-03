using System;
using Modlogie.Domain.Models;

namespace Modlogie.Domain.Models
{
    public partial class Content : IEntity<Guid>
    {
    }
}

namespace Modlogie.Domain
{
    public interface IContentsEntityService : IEntityService<Content, Guid>
    {
    }
}