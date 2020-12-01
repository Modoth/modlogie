using System.Threading.Tasks;

namespace Modlogie.Domain
{
    public interface IPublishService
    {
        Task<string> Publish(PublishArticle article);

        Task Delete(string id);
    }
}