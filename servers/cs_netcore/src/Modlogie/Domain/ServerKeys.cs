using System;
using System.Collections.Generic;

namespace Modlogie.Domain
{
    public enum ServerKeyType
    {
        STRING = 0,
        ENUM,
        NUMBER,
        BOOLEAN
    }

    public class ServerKey
    {
        public string Key { get; set; }

        public ServerKeyType Type { get; set; } = ServerKeyType.STRING;
    }
    public class ServerKeys
    {
        public static ServerKey WechatApiToken = new ServerKey { Key = nameof(WechatApiToken) };

        public static ServerKey __IncreasableTags = new ServerKey { Key = nameof(__IncreasableTags) };

        public static ServerKey[] All = new ServerKey[] { WechatApiToken, __IncreasableTags };
    }
}
