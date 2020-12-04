using System;
using Modlogie.Domain.Models;

namespace Modlogie.Domain.Models
{
    public partial class ContentTemplate : IEntity<Guid>
    {
    }
}

namespace Modlogie.Domain
{
    public interface IContentTemplatesEntityService : IEntityService<ContentTemplate, Guid>
    {
    }
}