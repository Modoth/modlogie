using System;
using Microsoft.EntityFrameworkCore;
using Modlogie.Domain;
using Modlogie.Domain.Models;

namespace Modlogie.Infrastructure.Data
{
    public class ContentsEntityService : EntityServiceBase<Content, Guid>, IContentsEntityService
    {
        public ContentsEntityService(ModlogieContext context) : base(context)
        {
        }

        protected override DbSet<Content> Entities => DbContext.Contents;
    }
}