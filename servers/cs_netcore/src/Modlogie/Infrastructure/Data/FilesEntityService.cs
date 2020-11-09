using System;
using Microsoft.EntityFrameworkCore;
using Modlogie.Domain;
using Modlogie.Domain.Models;

namespace Modlogie.Infrastructure.Data
{
    public class FilesEntityService : EntityServiceBase<File, Guid>, IFilesEntityService
    {
        public FilesEntityService(ModlogieContext context) : base(context)
        {
        }

        protected override DbSet<File> Entities => DbContext.Files;
    }
}