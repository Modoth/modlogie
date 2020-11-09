using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;

namespace Modlogie.Api
{
    public static class ConfigurationExtensions
    {
        public static string GetMySqlConnectionString(this IConfiguration configuration, bool ignoreDbName = false)
        {
            var ssb = new MySqlConnectionStringBuilder();
            var section = configuration.GetSection("ConnectionProps");
            foreach (var s in section.GetChildren())
            {
                if (ignoreDbName && s.Key == "Database" || s.Value == null)
                {
                    continue;
                }

                ssb.Add(s.Key, s.Value);
            }

            return ssb.ToString();
        }
    }
}