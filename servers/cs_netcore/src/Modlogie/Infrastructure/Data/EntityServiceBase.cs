using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Modlogie.Domain;

namespace Modlogie.Infrastructure.Data
{
    public abstract class EntityServiceBase<TEntity, TKey> : IEntityService<TEntity, TKey> where TEntity : class, IEntity<TKey>
    {
        protected readonly ModlogieContext DbContext;

        public EntityServiceBase(ModlogieContext context)
        {
            DbContext = context;
        }
        public IEntityServiceContext Context => DbContext;

        protected abstract DbSet<TEntity> Entities { get; }

        public async Task<TEntity> Add(TEntity entity)
        {
            this.Entities.Add(entity);
            if (Context.CurrentTransaction == null)
            {
                await DbContext.SaveChangesAsync();
            }
            return entity;
        }

        public async Task<TEntity> Update(TEntity entity)
        {
            this.Entities.Update(entity);
            if (Context.CurrentTransaction == null)
            {
                await DbContext.SaveChangesAsync();
            }
            return entity;
        }

        public IQueryable<TEntity> All()
        {
            return this.Entities;
        }

        public async Task<int> Delete(TEntity entity)
        {
            this.Entities.Remove(entity);
            if (Context.CurrentTransaction == null)
            {
                return await DbContext.SaveChangesAsync();
            }
            return 0;
        }

        public async Task<int> DeleteRange(IEnumerable<TEntity> entities)
        {
            this.Entities.RemoveRange(entities);
            if (Context.CurrentTransaction == null)
            {
                return await DbContext.SaveChangesAsync();
            }
            return 0;
        }

        public async Task<int> UpdateRange(IEnumerable<TEntity> entities)
        {
            this.Entities.UpdateRange(entities);
            if (Context.CurrentTransaction == null)
            {
                return await DbContext.SaveChangesAsync();
            }
            return 0;
        }
    }
}