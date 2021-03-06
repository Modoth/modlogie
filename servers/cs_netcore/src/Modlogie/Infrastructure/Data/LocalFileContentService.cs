using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Modlogie.Domain;

namespace Modlogie.Infrastructure.Data
{
    public class LocalFileContentServiceOptions
    {
        public string ContentRoot { get; set; }
    }

    public class LocalFileContentService : IFileContentService
    {
        private readonly LocalFileContentServiceOptions _options;

        public LocalFileContentService(IOptions<LocalFileContentServiceOptions> options)
        {
            _options = options.Value;
        }

        public async Task<string> Add(string group, string content, string type)
        {
            var (id, filePath) = GenerateAndPrepareForFileName(group, type);
            await File.WriteAllTextAsync(filePath, content);
            return id;
        }

        public async Task<string> Add(string group, Func<Stream, Task> writeContent, string type)
        {
            var (id, filePath) = GenerateAndPrepareForFileName(group, type);
            await using var fs = File.OpenWrite(filePath);
            await writeContent(fs);

            return id;
        }

        public Task<bool> Delete(string id)
        {
            var filePath = Path.Join(_options.ContentRoot, id);
            var folder = Path.GetDirectoryName(filePath);
            if(!Directory.Exists(folder)){
                 return Task.FromResult(true);
            }
            if(File.Exists(filePath)){
                File.Delete(filePath);
            }
            if(Directory.GetFiles(folder).Length == 0){
                Directory.Delete(folder);
            }
            return Task.FromResult(true);
        }

#pragma warning disable 1998
        public async Task<Stream> Open(string id)
#pragma warning restore 1998
        {
            var filePath = Path.Join(_options.ContentRoot, id);
            return File.Open(filePath, FileMode.Open);
        }

#pragma warning disable 1998
        public async Task<bool> Existed(string id)
#pragma warning restore 1998
        {
            var filePath = Path.Join(_options.ContentRoot, id);
            return File.Exists(filePath);
        }

        private (string, string) GenerateAndPrepareForFileName(string group, string type)
        {
            if (string.IsNullOrWhiteSpace(type)) type = "bin";

            var guid = Guid.NewGuid().ToString();
            var idx = guid.IndexOf("-", StringComparison.Ordinal);
            var folder = Path.Join(group, guid.Substring(0, idx));
            var file = guid.Substring(idx + 1, guid.Length - (idx + 1)) + "." + type;
            var id = Path.Join(folder, file);
            var folderPath = Path.Join(_options.ContentRoot, folder);
            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

            var filePath = Path.Join(_options.ContentRoot, id);
            return (id, filePath);
        }
    }
}