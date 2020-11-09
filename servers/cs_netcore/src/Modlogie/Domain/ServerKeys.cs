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
        public static ServerKey WechatApiToken = new ServerKey {Key = nameof(WechatApiToken)};

        public static ServerKey IncreaseTags = new ServerKey {Key = "__" + nameof(IncreaseTags)};

        public static readonly ServerKey[] All = {WechatApiToken, IncreaseTags};
    }
}