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
        IEntityServiceContextTransaction CurrentTransaction { get; }
        IEntityServiceContextTransaction BeginTransaction();
    }

    public interface IEntity<TKey>
    {
        TKey Id { get; set; }
    }

    public interface IEntityService<TEntity, TKey> where TEntity : class, IEntity<TKey>
    {
        IEntityServiceContext Context { get; }
        IQueryable<TEntity> All();

        Task<TEntity> Update(TEntity entity);

        Task<TEntity> Add(TEntity entity);

        Task AddRange(IEnumerable<TEntity> entities);

        Task<int> UpdateRange(IEnumerable<TEntity> entities);

        Task<int> Delete(TEntity entity);

        Task<int> DeleteAll();

        Task<int> DeleteRange(IEnumerable<TEntity> entities);
    }
}