using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Modlogie.Domain;
using Modlogie.Domain.Models;

namespace Modlogie.Infrastructure.Data
{
    public class KeyValuesEntityService : EntityServiceBase<KeyValue, string>, IKeyValuesEntityService
    {
        public KeyValuesEntityService(ModlogieContext context) : base(context) { }

        protected override DbSet<KeyValue> Entities => DbContext.KeyValues;
    }
}