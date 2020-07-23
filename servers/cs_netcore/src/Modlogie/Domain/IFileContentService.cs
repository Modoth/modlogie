using System;
using System.IO;
using System.Threading.Tasks;

namespace Modlogie.Domain
{
    public interface IFileContentService
    {
        Task<string> Add(string content);

        Task<string> Add(Func<Stream,Task> writeContent, string type);

        Task<bool> Delete(string id);
    }
}