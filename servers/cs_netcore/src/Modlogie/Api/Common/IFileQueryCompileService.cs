using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using Modlogie.Api.Files;
using File = Modlogie.Domain.Models.File;

namespace Modlogie.Api.Common
{
    public class FileParentId
    {
        public string Path { get; set; }
    }

    public interface IFileQueryCompileService
    {
        Expression<Func<File, bool>> Compile(IEnumerable<FileParentId> ins, Query query);
    }
}