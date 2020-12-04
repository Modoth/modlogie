using System;
using System.IO;
using System.Threading.Tasks;

namespace Modlogie.Domain
{
    public interface IFileContentService
    {
        Task<string> Add(string group, string content, string type = "txt");

        Task<string> Add(string group, Func<Stream, Task> writeContent, string type = "txt");

        Task<Stream> Open(string id);

        Task<bool> Delete(string id);

        Task<bool> Existed(string id);
    }
}