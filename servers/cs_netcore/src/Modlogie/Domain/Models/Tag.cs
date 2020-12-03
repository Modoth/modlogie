using System;
using System.Collections.Generic;

namespace Modlogie.Domain.Models
{
    public partial class Tag
    {
        public Tag()
        {
            FileTags = new HashSet<FileTag>();
        }

        public Guid Id { get; set; }
        public string Name { get; set; }
        public int Type { get; set; }
        public string Values { get; set; }

        public virtual ICollection<FileTag> FileTags { get; set; }
    }
}
