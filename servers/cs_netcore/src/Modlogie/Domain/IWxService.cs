namespace Modlogie.Domain
{
    public interface IWxService : IPublishService
    {
    }

    public static class WxUploadTypes
    {
        public static readonly string CONFIG_THUMB = "thumb";

        public static readonly string CONFIG_IMAGE = "image";
    }
}