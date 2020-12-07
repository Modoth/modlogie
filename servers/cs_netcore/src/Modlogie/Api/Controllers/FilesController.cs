using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Modlogie.Domain;
using static Modlogie.Api.Files.File.Types;

namespace Modlogie.Api.Controllers
{
    [Route("s/[controller]")]
    public class FilesController : Controller
    {
        private readonly IFilesEntityService _filesService;
        private readonly IFileContentService _contentsService;

        public FilesController(IFilesEntityService filesService,
            IFileContentService contentsService)
        {
            _filesService = filesService;
            _contentsService = contentsService;
        }

        public async Task<object> Get(Expression<Func<Domain.Models.File, bool>> predicate)
        {
            var file = await _filesService.All().Where(predicate).Where(f => f.Private == 0ul && f.Type == (int)FileType.Resource)
            .FirstOrDefaultAsync();
            if (file == null)
            {
                return NotFound();
            }
            return Redirect("/" + file.Content);
        }

        [HttpGet("id/{id}")]
        public Task<object> Get(Guid id)
        {
            return Get(f => f.ParentId == id);
        }

        [HttpGet("{*path}")]
        public Task<object> Get(string path)
        {
            path = "/" + path + "/";
            return Get(f => f.Path.StartsWith(path));
        }
    }
}