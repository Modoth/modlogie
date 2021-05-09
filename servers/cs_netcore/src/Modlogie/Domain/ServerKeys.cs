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
        static ServerKeys()
        {
            var prefix = "_";
            var keyInfos = typeof(ServerKeys).GetProperties(BindingFlags.Static | BindingFlags.Public);
            var all = new List<ServerKey>();
            foreach (var info in keyInfos)
            {
                if (info.PropertyType != typeof(ServerKey)) continue;
                var key = info.GetValue(null) as ServerKey;
                if (key == null)
                {
                    key = new ServerKey { Key = prefix + info.Name };
                    info.SetValue(null, key);
                }

                all.Add(key);
            }

            All = all.ToArray();
        }

        public static ServerKey WxAppId { get; private set; }

        public static ServerKey WxAppSecret { get; private set; }

        public static ServerKey WxPreviewUserId { get; private set; }

        public static ServerKey WxValidateToken { get; private set; }

        public static ServerKey DefaultPrivate { get; private set; }

        public static ServerKey IncreaseTags { get; private set; } = new ServerKey { Key = "__" + nameof(IncreaseTags) };

        public static ServerKey[] All { get; }
    }
}