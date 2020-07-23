using System;
using System.Collections.Generic;

namespace Modlogie.Domain.Models
{
    public partial class KeyValue : IEntity<string>
    {

    }
}

namespace Modlogie.Domain
{
    public interface IKeyValuesEntityService : IEntityService<Domain.Models.KeyValue, string>
    {

    }
}
