using System;
using System.Collections.Generic;

namespace Modlogie.Domain.Models
{
    public partial class Keyword : IEntity<string>
    {

    }
}

namespace Modlogie.Domain
{
    public interface IKeywordsEntityService : IEntityService<Domain.Models.Keyword, string>
    {

    }
}
