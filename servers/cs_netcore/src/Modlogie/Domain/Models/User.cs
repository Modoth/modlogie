using System;
using System.Collections.Generic;

namespace Modlogie.Domain.Models
{
    public partial class User
    {
        public string Id { get; set; }
        public DateTime Created { get; set; }
        public DateTime AuthorisionExpired { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public ulong? Authorised { get; set; }
        public ulong? Status { get; set; }
        public string Comment { get; set; }
    }
}
