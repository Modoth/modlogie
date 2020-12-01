using System.Threading.Tasks;
using Grpc.Core;
using Modlogie.Api.Publish;

namespace Modlogie.Api.Services
{
    public class PublishService : Publish.PublishService.PublishServiceBase
    {
        public override Task<AddResponce> Add(AddRequest request, ServerCallContext context)
        {
            return base.Add(request, context);
        }

        public override Task<Reply> Delete(DeleteRequest request, ServerCallContext context)
        {
            return base.Delete(request, context);
        }
    }
}