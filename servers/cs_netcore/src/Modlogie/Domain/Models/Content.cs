using System;
using System.Collections.Generic;

namespace Modlogie.Domain.Models
{
    public partial class Content
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public DateTime Created { get; set; }
        public string Group { get; set; }
        public string Data { get; set; }
        public string Url { get; set; }
    }
}
