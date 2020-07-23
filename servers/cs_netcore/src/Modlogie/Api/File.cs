using System.Collections.Generic;
using System.Linq;

namespace Modlogie.Api
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