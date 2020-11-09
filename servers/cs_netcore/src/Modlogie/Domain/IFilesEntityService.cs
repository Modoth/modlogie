using System;
using Modlogie.Domain.Models;

namespace Modlogie.Domain.Models
{
    public partial class File : IEntity<Guid>
    {
    }
}

namespace Modlogie.Domain
{
    public interface IFilesEntityService : IEntityService<File, Guid>
    {
    }
}