using System;
using System.Collections.Generic;

namespace Modlogie.Domain.Models
{
    public partial class Tag2Tags
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public int Type { get; set; }
        public string Values { get; set; }
    }
}
