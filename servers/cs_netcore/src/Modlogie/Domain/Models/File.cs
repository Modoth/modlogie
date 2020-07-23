using System;
using System.Collections.Generic;

namespace Modlogie.Domain.Models
{
    public partial class File
    {
        public File()
        {
            FileTags = new HashSet<FileTag>();
            InverseParent = new HashSet<File>();
        }

        public Guid Id { get; set; }
        public DateTime Created { get; set; }
        public DateTime Modified { get; set; }
        public string Name { get; set; }
        public Guid? ParentId { get; set; }
        public int? Type { get; set; }
        public string MainTag { get; set; }
        public string Path { get; set; }
        public string Content { get; set; }
        public ulong? Shared { get; set; }
        public int? NormalFilesCount { get; set; }

        public virtual File Parent { get; set; }
        public virtual ICollection<FileTag> FileTags { get; set; }
        public virtual ICollection<File> InverseParent { get; set; }
    }
}
