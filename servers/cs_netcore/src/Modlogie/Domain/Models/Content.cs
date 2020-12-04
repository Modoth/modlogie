using System;
using System.Collections.Generic;

namespace Modlogie.Domain.Models
{
    public partial class Content
    {
        public Content()
        {
            ContentCaches = new HashSet<ContentCache>();
        }

        public Guid Id { get; set; }
        public string Name { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
        public string Group { get; set; }
        public string Url { get; set; }
        public string Data { get; set; }

        public virtual ICollection<ContentCache> ContentCaches { get; set; }
    }
}
