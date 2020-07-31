using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Modlogie.Api.Files;

namespace Modlogie.Api.Common
{
    public class FileParentId
    {
        public String Path { get; set; }
    }
    public interface IFileQueryCompileService
    {
        Expression<Func<Domain.Models.File, bool>> Compile(IEnumerable<FileParentId> ins, Query query);
    }
}