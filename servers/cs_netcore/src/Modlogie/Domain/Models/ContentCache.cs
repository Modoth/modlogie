using System;
using System.Collections.Generic;

namespace Modlogie.Domain.Models
{
    public partial class ContentCache
    {
        public Guid ContentId { get; set; }
        public Guid TemplateId { get; set; }
        public string Content { get; set; }
        public DateTime Updated { get; set; }

        public virtual Content ContentNavigation { get; set; }
        public virtual ContentTemplate Template { get; set; }
    }
}
