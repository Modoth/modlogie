using System;
using Microsoft.EntityFrameworkCore;
using Modlogie.Domain;
using Modlogie.Domain.Models;

namespace Modlogie.Infrastructure.Data
{
    public class TagsEntityService : EntityServiceBase<Tag, Guid>, ITagsEntityService
    {
        public TagsEntityService(ModlogieContext context) : base(context)
        {
        }

        protected override DbSet<Tag> Entities => DbContext.Tags;
    }
}