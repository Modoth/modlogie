using System;
using System.Collections.Generic;

namespace Modlogie.Domain.Models
{
    public partial class FileTag
    {
        public Guid FileId { get; set; }
        public Guid TagId { get; set; }
        public string Value { get; set; }

        public virtual File File { get; set; }
        public virtual Tag Tag { get; set; }
    }
}
