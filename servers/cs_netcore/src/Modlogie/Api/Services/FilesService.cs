using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;
using Modlogie.Api.Common;
using Modlogie.Domain;
using static Modlogie.Api.File.Types;

namespace Modlogie.Api.Services
{
    public class FilesService : Api.FilesService.FilesServiceBase
    {
        private const string PATH_SEP = "/";

        private static string JoinPath(string basePath, string name)
        {
            return basePath + PATH_SEP + name;
        }

        private static string GetParentPath(string path)
        {
            return path.Substring(0, path.LastIndexOf(PATH_SEP));
        }

        private static Expression<Func<Domain.Models.File, File>> _selector = i =>
        new File
        {
            Id = i.Id.ToString(),
            Name = i.Name,
            Path = i.Path,
            NormalFilesCount = i.NormalFilesCount ?? 0,
            ParentId = i.ParentId != null ? i.ParentId.ToString() : string.Empty,
            Content = i.Content ?? string.Empty,
            FileTagsForSelect = i.FileTags != null ? i.FileTags.Select(t => new FileTag { TagId = t.TagId.ToString(), Value = t.Value }) : null
        };
        private static Func<Domain.Models.File, File> _converter = _selector.Compile();

        private readonly IFilesEntityService _service;
        private readonly IFileContentService _contentService;
        private readonly IFileQueryCompileService _queryCompiler;
        private readonly ILoginUserService _userService;

        public FilesService(IFilesEntityService service, IFileContentService contentService, ILoginUserService userService, Common.IFileQueryCompileService queryCompiler)
        {
            _service = service;
            _contentService = contentService;
            _queryCompiler = queryCompiler;
            _userService = userService;
        }

        public async override Task<FilesReply> Query(QueryRequest request, ServerCallContext context)
        {
            var reply = new FilesReply();
            var query = request.Query;
            var parentPaths = default(IEnumerable<FileParentId>);
            if (!string.IsNullOrWhiteSpace(query.Parent))
            {
                var indexedParentPath = query.Parent!;
                parentPaths = await _service.All().Where(n => n.Type == (int)FileType.Folder && n.Path == indexedParentPath).Select(
                n => new FileParentId { Path = n.Path + PATH_SEP }
            ).ToArrayAsync();
                if (parentPaths.Count() == 0)
                {
                    return null;
                }
            }
            Expression<Func<Domain.Models.File, bool>> queryFunc;
            try
            {
                queryFunc = this._queryCompiler.Compile(parentPaths, query);
            }
            catch
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }
            var items = _service.All().Where(queryFunc);
            var filter = request.Filter;
            if (!string.IsNullOrWhiteSpace(filter))
            {
                filter = filter!.Trim();
                items = items.Where(n =>
                n.Name!.Contains(filter, StringComparison.CurrentCultureIgnoreCase));
            }
            if (query != null && !string.IsNullOrWhiteSpace(query.OrderBy))
            {
                Expression<Func<Modlogie.Domain.Models.File, Object>> orderBy = default;
                switch (query.OrderBy)
                {
                    case nameof(Modlogie.Domain.Models.File.Name):
                        orderBy = node => node.Name!;
                        break;
                    case nameof(Modlogie.Domain.Models.File.Created):
                        orderBy = node => node.Created;
                        break;
                }
                if (orderBy == null)
                {
                    reply.Error = Error.InvalidArguments;
                    return reply;
                }
                if (query.OrderByDesc == true)
                {
                    items = items.OrderByDescending(orderBy);
                }
                else
                {
                    items = items.OrderBy(orderBy);
                }
            }
            int? total = null;
            if (request.Skip > 0)
            {
                total = await items.CountAsync();
                items = items.Skip(request.Skip);
            }
            if (request.Take > 0)
            {
                items = items.Take(request.Take);
            }
            var files = await items
                            .Select(_selector)
                            .ToArrayAsync();
            reply.Files.AddRange(files);
            if (total.HasValue)
            {
                reply.Total = total.Value;
            }
            return reply;
        }

        public async override Task<FilesReply> GetFolders(Empty request, ServerCallContext context)
        {
            var reply = new FilesReply();
            reply.Files.AddRange(await _service.All()
            .Where(f => f.Type == (int)FileType.Folder)
                .Select(_selector)
                .ToArrayAsync());
            return reply;
        }

        public async override Task<FilesReply> GetFiles(GetFilesRequest request, ServerCallContext context)
        {
            var reply = new FilesReply();
            var items = _service.All().Where(f => f.Type == (int)FileType.Normal);
            if (!string.IsNullOrWhiteSpace(request.ParentId))
            {
                if (!Guid.TryParse(request.ParentId, out Guid folderId))
                {
                    reply.Error = Error.NoSuchEntity;
                    return reply;
                }
                var folder = await _service.All().Where(k => k.Id == folderId && k.Type == (int)FileType.Folder).FirstOrDefaultAsync();
                if (folder == null)
                {
                    reply.Error = Error.NoSuchEntity;

                }
                var pathPrefix = folder.Path + PATH_SEP;
                items = items.Where(f => f.Path.StartsWith(pathPrefix));
            }
            int? total = null;
            if (request.Skip > 0)
            {
                total = await items.CountAsync();
                items = items.Skip(request.Skip);
            }
            if (request.Take > 0)
            {
                items = items.Take(request.Take);
            }

            reply.Files.AddRange(await items
                .Select(_selector)
                .ToArrayAsync());
            if (total.HasValue)
            {
                reply.Total = total.Value;
            }
            return reply;
        }

        public async override Task<Reply> AddOrUpdateTags(AddOrUpdateTagsRequest request, ServerCallContext context)
        {
            var reply = new Reply();
            if (string.IsNullOrWhiteSpace(await _userService.GetUser(context.GetHttpContext())))
            {
                reply.Error = Error.InvalidOperation;
                return reply;
            }
            if (!Guid.TryParse(request.Id, out Guid id))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var item = await _service.All().Where(i => i.Id == id).Include(i => i.FileTags).FirstOrDefaultAsync();
            if (item == null)
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }

            if (item.FileTags == null)
            {
                item.FileTags = new List<Modlogie.Domain.Models.FileTag>();
            }
            var tags = item.FileTags;
            var tagsDict = tags.ToDictionary(t => t.TagId);
            var updates = request.Tags.Select(t => new Modlogie.Domain.Models.FileTag { TagId = Guid.Parse(t.TagId), Value = t.Value, File = item });
            foreach (var tag in updates)
            {
                if (tagsDict.ContainsKey(tag.TagId))
                {
                    tagsDict[tag.TagId].Value = tag.Value;
                }
                else
                {
                    tags.Add(tag);
                }
            }

            await _service.Update(item);

            return reply;
        }

        public async override Task<Reply> DeleteTags(DeleteTagsRequest request, ServerCallContext context)
        {
            var reply = new Reply();
            if (string.IsNullOrWhiteSpace(await _userService.GetUser(context.GetHttpContext())))
            {
                reply.Error = Error.InvalidOperation;
                return reply;
            }

            if (!Guid.TryParse(request.Id, out Guid id))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var item = await _service.All().Where(i => i.Id == id).Include(i => i.FileTags).FirstOrDefaultAsync();
            if (item == null)
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }

            if (item.FileTags != null)
            {
                var deletes = request.Tags.Select(t => Guid.Parse(t.TagId)).ToHashSet();
                item.FileTags = item.FileTags.Where(t => deletes.Contains(t.TagId)).ToList();
                await _service.Update(item);
            }

            var tags = item.FileTags;
            return reply;
        }

        private bool ValidateFileName(string name)
        {
            return !string.IsNullOrWhiteSpace(name) && name.IndexOf(PATH_SEP) < 0;
        }

        public async override Task<FileReply> Add(AddRequest request, ServerCallContext context)
        {
            var reply = new FileReply();
            if (string.IsNullOrWhiteSpace(await _userService.GetUser(context.GetHttpContext())))
            {
                reply.Error = Error.InvalidOperation;
                return reply;
            }
            if (!ValidateFileName(request.Name))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }
            var file = new Modlogie.Domain.Models.File { Type = (int)request.FileType, Name = request.Name, Created = DateTime.Now, Modified = DateTime.Now };
            Modlogie.Domain.Models.File parent = null;
            if (!string.IsNullOrWhiteSpace(request.ParentId))
            {
                if (!Guid.TryParse(request.ParentId, out Guid parentId))
                {
                    reply.Error = Error.NoSuchEntity;
                    return reply;
                }
                parent = await _service.All().FirstOrDefaultAsync(f => f.Id == parentId && f.Type == (int)FileType.Folder);
                if (parent == null)
                {
                    reply.Error = Error.NoSuchEntity;
                    return reply;
                }
                file.Parent = parent;
                file.Path = JoinPath(parent.Path, file.Name);
            }
            else
            {
                file.Path = PATH_SEP + file.Name;
            }
            using (var trans = _service.Context.BeginTransaction())
            {
                file = await _service.Add(file);
                if (file.Type == (int)FileType.Normal && file.Parent != null && file.Parent.Type == (int)FileType.Folder)
                {
                    file.Parent.NormalFilesCount = (file.Parent.NormalFilesCount ?? 0) + 1;
                    await _service.Update(file.Parent);
                }
                await trans.Commit();
            }
            reply.File = _converter(file);
            return reply;
        }

        public async override Task<FileReply> UpdateName(UpdateNameRequest request, ServerCallContext context)
        {
            var reply = new FileReply();
            if (string.IsNullOrWhiteSpace(await _userService.GetUser(context.GetHttpContext())))
            {
                reply.Error = Error.InvalidOperation;
                return reply;
            }
            if (!ValidateFileName(request.Name))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            if (!Guid.TryParse(request.Id, out Guid id))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var item = await _service.All().Where(i => i.Id == id).FirstOrDefaultAsync();
            if (item == null)
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }

            using (var trans = _service.Context.BeginTransaction())
            {
                var childrenPathSufix = item.Path + PATH_SEP;
                item.Name = request.Name;
                item.Path = JoinPath(GetParentPath(item.Path), item.Name);
                item = await _service.Update(item);
                var children = _service.All()
                .Where(n => n.Path!.StartsWith(childrenPathSufix));
                if (children.Any())
                {
                    foreach (var sub in children)
                    {
                        sub.Path = JoinPath(item.Path, sub.Path!.Substring(childrenPathSufix.Length));
                    }
                    await _service.UpdateRange(children);
                }

                await trans.Commit();
            }
            reply.File = _converter(item);
            return reply;
        }

        public async override Task<FileReply> Move(MoveRequest request, ServerCallContext context)
        {
            var reply = new FileReply();
            if (string.IsNullOrWhiteSpace(await _userService.GetUser(context.GetHttpContext())))
            {
                reply.Error = Error.InvalidOperation;
                return reply;
            }
            if (!Guid.TryParse(request.Id, out Guid id) || !Guid.TryParse(request.ParentId, out Guid parentId))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var file = await _service.All().Where(i => i.Id == id).Include(i => i.Parent).FirstOrDefaultAsync();
            if (file == null)
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }

            var parent = await _service.All().Where(i => i.Id == parentId && i.Type == (int)FileType.Folder).FirstOrDefaultAsync();
            if (parent == null)
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }

            using (var trans = _service.Context.BeginTransaction())
            {
                if (file.Type == (int)FileType.Normal && file.Parent != null && file.Parent.Type == (int)FileType.Folder)
                {
                    file.Parent.NormalFilesCount = Math.Max(0, ((file.Parent.NormalFilesCount ?? 0) - 1));
                    await _service.Update(file.Parent);
                }

                var childrenPathSufix = file.Path + PATH_SEP;
                file.ParentId = parent.Id;
                file.Parent = parent;
                file.Path = JoinPath(parent.Path, file.Name);
                file = await _service.Update(file);
                var children = _service.All()
                .Where(n => n.Path!.StartsWith(childrenPathSufix));
                if (children.Any())
                {
                    foreach (var sub in children)
                    {
                        sub.Path = JoinPath(file.Path, sub.Path!.Substring(childrenPathSufix.Length));
                    }
                    await _service.UpdateRange(children);
                }

                if (file.Type == (int)FileType.Normal && file.Parent != null && file.Parent.Type == (int)FileType.Folder)
                {
                    file.Parent.NormalFilesCount = Math.Max(0, ((file.Parent.NormalFilesCount ?? 0) + 1));
                    await _service.Update(file.Parent);
                }

                await trans.Commit();
            }
            reply.File = _converter(file);
            return reply;
        }

        public override async Task<Reply> UpdateContent(UpdateContentRequest request, ServerCallContext context)
        {
            var reply = new Reply();
            if (string.IsNullOrWhiteSpace(await _userService.GetUser(context.GetHttpContext())))
            {
                reply.Error = Error.InvalidOperation;
                return reply;
            }
            if (!Guid.TryParse(request.Id, out Guid id))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var item = await _service.All().Where(i => i.Id == id).FirstOrDefaultAsync();
            if (item == null)
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }
            var originContent = item.Content;
            var resources = request.ResourceIds.Select(r => Guid.Parse(r)).ToHashSet();
            item.Content = await _contentService.Add(request.Content);
            using (var trans = _service.Context.BeginTransaction())
            {
                var children = await _service.All().Where(f => f.ParentId == item.Id).ToListAsync();
                item = await _service.Update(item);
                await _service.DeleteRange(children);
                await trans.Commit();
            }
            if (!string.IsNullOrWhiteSpace(originContent))
            {
                await _contentService.Delete(originContent);
            }
            return reply;
        }

        public async override Task<ResourceReply> AddResource(AddResourceRequest request, ServerCallContext context)
        {
            var reply = new ResourceReply();
            var type = request.Type;
            if (string.IsNullOrWhiteSpace(type))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }
            type = type.Split('/').Last();
            if (!new Regex(@"[a-z0-9]{3,6}").Match(type).Success)
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }
            if (string.IsNullOrWhiteSpace(await _userService.GetUser(context.GetHttpContext())))
            {
                reply.Error = Error.InvalidOperation;
                return reply;
            }
            if (!Guid.TryParse(request.ParentId, out Guid id))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var parent = await _service.All().Where(i => i.Id == id).FirstOrDefaultAsync();
            if (parent == null)
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }
            var file = new Modlogie.Domain.Models.File { Type = (int)FileType.Resource, Name = Guid.NewGuid().ToString(), Parent = parent, Created = DateTime.Now, Modified = DateTime.Now };
            file.Path = JoinPath(parent.Path, file.Name);
            file.Content = await _contentService.Add(stream =>
            {
                request.Content.WriteTo(stream);
                return Task.FromResult(true);
            }, type);
            file = await _service.Add(file);
            reply.Id = file.Id.ToString();
            reply.ContentId = file.Content;
            return reply;
        }

        public async override Task<Reply> Delete(StringId request, ServerCallContext context)
        {
            var reply = new Reply();
            if (string.IsNullOrWhiteSpace(await _userService.GetUser(context.GetHttpContext())))
            {
                reply.Error = Error.InvalidOperation;
                return reply;
            }
            if (Guid.TryParse(request.Id, out Guid id))
            {
                var file = await _service.All().Where(k => k.Id == id).Include(k => k.Parent).FirstOrDefaultAsync();
                if (file != null)
                {
                    using (var trans = _service.Context.BeginTransaction())
                    {
                        var childrenPathSufix = file.Path + PATH_SEP;
                        var children = _service.All()
                        .Where(n => n.Path!.StartsWith(childrenPathSufix));
                        if (children.Any())
                        {
                            foreach (var sub in children)
                            {
                                sub.Path = JoinPath(file.Path, sub.Path!.Substring(childrenPathSufix.Length));
                            }
                            await _service.UpdateRange(children);
                        }

                        await _service.Delete(file);
                        await _service.DeleteRange(children);
                        if (file.Type == (int)FileType.Normal && file.Parent != null && file.Parent.Type == (int)FileType.Folder)
                        {
                            file.Parent.NormalFilesCount = Math.Max(0, ((file.Parent.NormalFilesCount ?? 0) - 1));
                            await _service.Update(file.Parent);
                        }
                        await trans.Commit();
                    }
                }
                else
                {
                    reply.Error = Error.NoSuchEntity;
                }
            }
            else
            {
                reply.Error = Error.InvalidArguments;
            }

            return reply;
        }
    }
}