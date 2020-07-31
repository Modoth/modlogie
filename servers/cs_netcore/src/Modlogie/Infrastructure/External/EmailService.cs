using System;
using System.Threading.Tasks;
using Modlogie.Domain;

namespace Modlogie.Infrastructure.External
{
    public class EmailService : IEmailService
    {
        public Task<bool> Send(string to, string subject, string content)
        {
            Console.WriteLine($"SendTo: {to}, Subject: {subject}, Content:\n{content}");
            return Task.FromResult(true);
        }
    }
}