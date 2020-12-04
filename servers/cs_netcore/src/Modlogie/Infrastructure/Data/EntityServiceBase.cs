using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Modlogie.Domain;

namespace Modlogie.Infrastructure.Data
{
    public abstract class EntityServiceBase<TEntity, TKey> : IEntityService<TEntity, TKey>
        where TEntity : class, IEntity<TKey>
    {
        protected readonly ModlogieContext DbContext;

        protected EntityServiceBase(ModlogieContext context)
        {
            DbContext = context;
        }

        protected abstract DbSet<TEntity> Entities { get; }
        public IEntityServiceContext Context => DbContext;

        public virtual async Task<TEntity> Add(TEntity entity)
        {
            await Entities.AddAsync(entity);
            if (Context.CurrentTransaction == null)
            {
                await DbContext.SaveChangesAsync();
            }

            return entity;
        }

        public virtual async Task AddRange(IEnumerable<TEntity> entities)
        {
            await Entities.AddRangeAsync(entities);
            if (Context.CurrentTransaction == null)
            {
                await DbContext.SaveChangesAsync();
            }
        }

        public virtual async Task<TEntity> Update(TEntity entity)
        {
            Entities.Update(entity);
            if (Context.CurrentTransaction == null)
            {
                await DbContext.SaveChangesAsync();
            }

            return entity;
        }

        public IQueryable<TEntity> All()
        {
            return Entities;
        }

        public virtual async Task<int> Delete(TEntity entity)
        {
            Entities.Remove(entity);
            if (Context.CurrentTransaction == null)
            {
                return await DbContext.SaveChangesAsync();
            }

            return 0;
        }

        public virtual async Task<int> DeleteRange(IEnumerable<TEntity> entities)
        {
            Entities.RemoveRange(entities);
            if (Context.CurrentTransaction == null)
            {
                return await DbContext.SaveChangesAsync();
            }

            return 0;
        }

        public virtual async Task<int> DeleteAll()
        {
            Entities.RemoveRange(Entities);
            if (Context.CurrentTransaction == null)
            {
                return await DbContext.SaveChangesAsync();
            }

            return 0;
        }

        public virtual async Task<int> UpdateRange(IEnumerable<TEntity> entities)
        {
            Entities.UpdateRange(entities);
            if (Context.CurrentTransaction == null)
            {
                return await DbContext.SaveChangesAsync();
            }

            return 0;
        }
    }
}