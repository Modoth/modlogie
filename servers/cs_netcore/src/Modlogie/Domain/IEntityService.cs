using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Modlogie.Domain
{
    public interface IEntityServiceContextTransaction : IDisposable
    {
        Task<int> Commit();
    }
    public interface IEntityServiceContext
    {
        IEntityServiceContextTransaction BeginTransaction();

        IEntityServiceContextTransaction CurrentTransaction { get; }
    }

    public interface IEntity<TKey>
    {
        TKey Id { get; set; }
    }
    public interface IEntityService<TEntity, TKey> where TEntity : class, IEntity<TKey>
    {
        IQueryable<TEntity> All();

        IEntityServiceContext Context { get; }

        Task<TEntity> Update(TEntity entity);

        Task<TEntity> Add(TEntity entity);

        Task<int> UpdateRange(IEnumerable<TEntity> entities);

        Task<int> Delete(TEntity entity);

        Task<int> DeleteRange(IEnumerable<TEntity> entities);

    }
}