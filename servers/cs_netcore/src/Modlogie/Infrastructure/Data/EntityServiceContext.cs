using System;
using System.Threading.Tasks;
using Modlogie.Domain;

namespace Modlogie.Infrastructure.Data
{
    public partial class ModlogieContext : IEntityServiceContext
    {
        public IEntityServiceContextTransaction CurrentTransaction { get; private set; }

        public IEntityServiceContextTransaction BeginTransaction()
        {
            return CurrentTransaction ??= new EntityServiceContextTransaction
            {
                OnCommit = Commit,
                OnDisposed = ClearTransaction
            };
        }

        private void ClearTransaction()
        {
            CurrentTransaction = null;
        }

        private Task<int> Commit()
        {
            return SaveChangesAsync();
        }
    }

    public class EntityServiceContextTransaction : IEntityServiceContextTransaction
    {
        public Func<Task<int>> OnCommit;

        public Action OnDisposed;

        public Task<int> Commit()
        {
            if (OnCommit != null)
            {
                return OnCommit();
            }

            return Task.FromResult(0);
        }

        public void Dispose()
        {
            if (OnDisposed == null)
            {
                return;
            }

            var onDisposed = OnDisposed;
            OnDisposed = null;
            onDisposed();
        }
    }
}