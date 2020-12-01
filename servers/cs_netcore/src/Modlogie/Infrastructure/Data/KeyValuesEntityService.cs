using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Modlogie.Domain;
using Modlogie.Domain.Models;

namespace Modlogie.Infrastructure.Data
{
    public class KeyValuesEntityService : EntityServiceBase<KeyValue, string>, IKeyValuesEntityService
    {
        public KeyValuesEntityService(ModlogieContext context) : base(context)
        {
        }

        protected override DbSet<KeyValue> Entities => DbContext.KeyValues;

        public async Task<string> GetValue(string id)
        {
            var config = await this.All().Where(c => c.Id == id).FirstOrDefaultAsync();
            if (config != null)
            {
                return config.Value;
            }
            return null;
        }
    }
}