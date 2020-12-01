using System.IO;
using System.Threading.Tasks;

namespace Modlogie.Domain
{
    public interface IWxService : IPublishService
    {
        Task<string> Send(string mediaId);

        Task<string> Upload(string fileName, Stream file, string type);
    }

    public static class WxUploadTypes
    {
        public static readonly string CONFIG_THUMB = "thumb";

        public static readonly string CONFIG_IMAGE = "image";
    }
}