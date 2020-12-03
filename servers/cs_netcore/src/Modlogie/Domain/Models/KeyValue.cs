using System;
using System.Collections.Generic;

namespace Modlogie.Domain.Models
{
    public partial class KeyValue
    {
        public string Id { get; set; }
        public int? Type { get; set; }
        public string Value { get; set; }
    }
}
