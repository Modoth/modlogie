using System;
using Microsoft.EntityFrameworkCore;
using Modlogie.Domain;
using Modlogie.Domain.Models;

namespace Modlogie.Infrastructure.Data
{
    public class ContentTemplatesEntityService : EntityServiceBase<ContentTemplate, Guid>, IContentTemplatesEntityService
    {
        public ContentTemplatesEntityService(ModlogieContext context) : base(context)
        {
        }

        protected override DbSet<ContentTemplate> Entities => DbContext.ContentTemplates;
    }
}