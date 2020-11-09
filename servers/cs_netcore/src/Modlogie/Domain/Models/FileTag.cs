using System;

namespace Modlogie.Domain.Models
{
    public class FileTag
    {
        public Guid FileId { get; set; }
        public Guid TagId { get; set; }
        public string Value { get; set; }

        public virtual File File { get; set; }
        public virtual Tag Tag { get; set; }
    }
}