using Microsoft.EntityFrameworkCore;
using Modlogie.Domain;
using Modlogie.Domain.Models;

namespace Modlogie.Infrastructure.Data
{
    public class UsersEntityService : EntityServiceBase<User, string>, IUsersEntityService
    {
        public UsersEntityService(ModlogieContext context) : base(context)
        {
        }

        protected override DbSet<User> Entities => DbContext.Users;
    }
}