﻿using System;
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
        public DateTime? Published { get; set; }
        public string Name { get; set; }
        public Guid? ParentId { get; set; }
        public int? Type { get; set; }
        public int? AdditionalType { get; set; }
        public string Path { get; set; }
        public string Content { get; set; }
        public string Comment { get; set; }
        public ulong? Private { get; set; }
        public int? Weight { get; set; }

        public virtual File Parent { get; set; }
        public virtual ICollection<FileTag> FileTags { get; set; }
        public virtual ICollection<File> InverseParent { get; set; }
    }
}
