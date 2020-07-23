using System;
using System.Collections.Generic;

namespace Modlogie.Domain.Models
{
    public partial class File : IEntity<Guid>
    {

    }
}

namespace Modlogie.Domain
{
    public interface IFilesEntityService : IEntityService<Domain.Models.File, Guid>
    {

    }
}
