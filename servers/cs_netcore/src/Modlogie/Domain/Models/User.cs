using System;

namespace Modlogie.Domain.Models
{
    public partial class User
    {
        public DateTime Created { get; set; }
        public DateTime AuthorisionExpired { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public ulong? Authorised { get; set; }
        public ulong? Status { get; set; }
        public string Comment { get; set; }
        public string Id { get; set; }
    }
}