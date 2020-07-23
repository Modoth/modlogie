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
            if (CurrentTransaction == null)
            {
                CurrentTransaction = new EntityServiceContextTransaction
                {
                    OnCommit = Commit,
                    OnDisposed = ClearReansaction
                };
            }
            return CurrentTransaction;
        }

        private void ClearReansaction()
        {
            CurrentTransaction = null;
        }

        private Task<int> Commit()
        {
            return this.SaveChangesAsync();
        }
    }

    public class EntityServiceContextTransaction : IEntityServiceContextTransaction
    {
        private ModlogieContext _context;

        public Action OnDisposed;

        public Func<Task<int>> OnCommit;

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
            if (OnDisposed != null)
            {
                var ondisposed = OnDisposed;
                OnDisposed = null;
                ondisposed();
            }
        }
    }
}