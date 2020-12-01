using System.Collections.Generic;
using System.Reflection;

namespace Modlogie.Domain
{
    public enum ServerKeyType
    {
        String = 0,
        Enum,
        Number,
        Boolean
    }

    public class ServerKey
    {
        public string Key { get; set; }

        public ServerKeyType Type { get; set; } = ServerKeyType.String;
    }

    public class ServerKeys
    {
        public static ServerKey WechatAppId { get; }

        public static ServerKey WechatAppIdSecret { get; }

        public static ServerKey WechatPreviewUserId { get; }

        public static ServerKey IncreaseTags { get; }

        public static ServerKey[] All { get; }

        static ServerKeys()
        {
            var prefix = "__";
            var keyInfos = typeof(ServerKeys).GetProperties(BindingFlags.Static);
            var all = new List<ServerKey>();
            foreach (var info in keyInfos)
            {
                if (info.DeclaringType != typeof(ServerKey))
                {
                    continue;
                }
                var key = new ServerKey { Key = prefix + info.Name };
                info.SetValue(null, key);
                all.Add(key);
            }
            All = all.ToArray();
        }
    }
}