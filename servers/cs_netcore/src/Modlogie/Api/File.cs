using System.Collections.Generic;
using System.Linq;

// ReSharper disable once CheckNamespace
namespace Modlogie.Api.Files
{
    public partial class File
    {
        public IEnumerable<FileTag> FileTagsForSelect
        {
            set
            {
                if (value != null && value.Any())
                {
                    Tags.AddRange(value);
                }
            }
        }
    }
}