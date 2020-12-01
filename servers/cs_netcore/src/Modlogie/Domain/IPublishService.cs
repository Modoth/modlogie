using System.IO;
using System.Threading.Tasks;

namespace Modlogie.Domain
{
    public enum PublishArticleSliceType
    {
        STRING = 0,
        IMAGE = 1
    }
    public class PublishArticleSlice
    {
        public PublishArticleSliceType Type { get; set; }

        public string Value { get; set; }
    }
    public class PublishArticle
    {
        public string BaseUrl { get; set; }

        public string Url { get; set; }

        public string Title { get; set; }

        public PublishArticleSlice[] Slices { get; set; }
    }
    public interface IPublishService
    {
        Task<string> Publish(PublishArticle article);

        Task Delete(string id);
    }
}