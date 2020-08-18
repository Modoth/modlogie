using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Modlogie.Domain;
using Modlogie.Domain.Models;

namespace Modlogie.Infrastructure.Data
{
    public class KeywordsEntityService : EntityServiceBase<Keyword, string>, IKeywordsEntityService
    {
        public KeywordsEntityService(ModlogieContext context) : base(context) { }

        protected override DbSet<Keyword> Entities => DbContext.Keywords;
    }
}