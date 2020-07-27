using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Modlogie.Api.Common;
using Modlogie.Domain;
using static Modlogie.Api.File.Types;

namespace Modlogie.Api.Services
{
    public class FilesService : Api.FilesService.FilesServiceBase
    {
        private const string PATH_SEP = "/";

        private const string FOLDERS_VERSION_CACHE_KEY = "FILES_VERSION";

        private async Task<FilesReply> UpdateFolderVersionsCache()
        {
            var folders = await this.GetFoldersInternal();
            var version = await _contentService.Add(_cachesGroup, (fs) =>
            {
                using (var s = new Google.Protobuf.CodedOutputStream(fs))
                {
                    folders.WriteTo(s);
                }
                return Task.FromResult(true);
            }, "bin");
            await _cahce.SetStringAsync(FOLDERS_VERSION_CACHE_KEY, version);
            return folders;
        }

        private async Task ClearFolderVersionsCache()
        {
            await _cahce.RemoveAsync(FOLDERS_VERSION_CACHE_KEY);
            return;
        }

        private async Task<string> GetFolderVersionsCache()
        {
            return await _cahce.GetStringAsync(FOLDERS_VERSION_CACHE_KEY);
        }

        private string GetFolderCacheFile(string version)
        {

            return "caches/folders." + version + ".json";
        }

        private const string FOLDERS_VERSION_CLEAN_CACHES_KEY = "FILES_VERSION";

        private static string JoinPath(string basePath, string name)
        {
            return basePath + PATH_SEP + name;
        }

        private static string GetParentPath(string path)
        {
            return path.Substring(0, path.LastIndexOf(PATH_SEP));
        }

        private static Expression<Func<Domain.Models.File, object>> _folderCachesSelector = i =>
        new
        {
            Id = i.Id.ToString(),
            Name = i.Name,
            Path = i.Path,
            NormalFilesCount = i.NormalFilesCount ?? 0,
            ParentId = i.ParentId != null ? i.ParentId.ToString() : string.Empty,
            FileTags = i.FileTags != null ? i.FileTags.Select(t => new { TagId = t.TagId.ToString(), Value = t.Value }) : null
        };

        private static Expression<Func<Domain.Models.File, File>> _selector = i =>
        new File
        {
            Id = i.Id.ToString(),
            Name = i.Name,
            Path = i.Path,
            NormalFilesCount = i.NormalFilesCount ?? 0,
            ParentId = i.ParentId != null ? i.ParentId.ToString() : string.Empty,
            Content = i.Content ?? string.Empty,
            Comment = i.Comment ?? string.Empty,
            FileTagsForSelect = i.FileTags != null ? i.FileTags.Select(t => new FileTag { TagId = t.TagId.ToString(), Value = t.Value }) : null
        };
        private static Func<Domain.Models.File, File> _converter = _selector.Compile();
        private readonly string _instanceName;
        private readonly string _resourcesGroup;
        private readonly string _cachesGroup;
        private readonly IFilesEntityService _service;
        private readonly ITagsEntityService _tagsService;
        private readonly IFileContentService _contentService;
        private readonly IFileQueryCompileService _queryCompiler;
        private readonly ILoginUserService _userService;
        private readonly IDistributedCache _cahce;

        public FilesService(IConfiguration configuration,
        IFilesEntityService service,
        ITagsEntityService tagsService,
        IFileContentService contentService,
        ILoginUserService userService,
        Common.IFileQueryCompileService queryCompiler,
        IDistributedCache cahce)
        {
            _instanceName = configuration.GetValue<string>("Execute:InstanceName");
            _resourcesGroup = configuration.GetValue<string>("File:Resources");
            _cachesGroup = configuration.GetValue<string>("File:Caches");
            _service = service;
            _tagsService = tagsService;
            _contentService = contentService;
            _queryCompiler = queryCompiler;
            _userService = userService;
            _cahce = cahce;
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

        private async Task<FilesReply> GetFoldersInternal()
        {
            var reply = new FilesReply();
            reply.Files.AddRange(await _service.All()
            .Where(f => f.Type == (int)FileType.Folder)
                .Select(_selector)
                .ToArrayAsync());
            return reply;
        }

        public async override Task<FilesReply> GetFolders(Empty request, ServerCallContext context)
        {

            var version = await _cahce.GetStringAsync(FOLDERS_VERSION_CACHE_KEY);
            if (string.IsNullOrWhiteSpace(version))
            {
                var reply = await UpdateFolderVersionsCache();
                return reply;
            }
            else
            {
                var reply = new FilesReply();
                reply.Version = version;
                return reply;
            }
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

        public async override Task<AddOrUpdateTagsReply> AddOrUpdateTags(AddOrUpdateTagsRequest request, ServerCallContext context)
        {
            var reply = new AddOrUpdateTagsReply();
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

            var item = await _service.All().Where(i => i.Id == id).Include(i => i.FileTags).ThenInclude(t => t.Tag).FirstOrDefaultAsync();
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
            var updates = request.Tags.Select(t => new { TagId = Guid.Parse(t.TagId), Value = t.Value, Content = t.Content, ContentType = GetContentType(t.ContentType), File = item });

            var resourceContentToDelete = new List<string>();
            foreach (var update in updates)
            {
                Modlogie.Domain.Models.FileTag tag;
                if (tagsDict.ContainsKey(update.TagId))
                {
                    tag = tagsDict[update.TagId];
                }
                else
                {
                    tag = new Modlogie.Domain.Models.FileTag
                    {
                        Tag = await _tagsService.All().FirstOrDefaultAsync(t => t.Id == update.TagId),
                        File = item
                    };

                    if (tag.Tag == null)
                    {
                        reply.Error = Error.NoSuchEntity;
                        return reply;
                    }
                    tags.Add(tag);
                }
                if (tag.Tag.Type == (int)Tag.Types.Type.Resource)
                {
                    if (string.IsNullOrWhiteSpace(update.ContentType))
                    {
                        reply.Error = Error.InvalidArguments;
                        return reply;
                    }
                    if (!string.IsNullOrWhiteSpace(tag.Value))
                    {
                        resourceContentToDelete.Add(tag.Value);
                    }
                    tag.Value = await _contentService.Add(_resourcesGroup, stream =>
                    {
                        update.Content.WriteTo(stream);
                        return Task.FromResult(true);
                    }, update.ContentType);
                }
                else
                {
                    tag.Value = update.Value;
                }
                reply.TagContents.Add(tag.Value);
            }

            await _service.Update(item);
            foreach (var todelete in resourceContentToDelete)
            {
                try
                {
                    await _contentService.Delete(todelete);
                }
                catch (Exception e)
                {
                    //ignore
                }
            }
            if (item.Type == (int)FileType.Folder)
            {
                await ClearFolderVersionsCache();
            }
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
                item.FileTags = item.FileTags.Where(t => !deletes.Contains(t.TagId)).ToList();
                await _service.Update(item);
                if (item.Type == (int)FileType.Folder)
                {
                    await ClearFolderVersionsCache();
                }
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
                    await ClearFolderVersionsCache();

                }
                else if (file.Type == (int)FileType.Folder)
                {
                    await ClearFolderVersionsCache();
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
            if (item.Type == (int)FileType.Folder)
            {
                await ClearFolderVersionsCache();

            }
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
                    await ClearFolderVersionsCache();
                }
                else if (file.Type == (int)FileType.Folder)
                {
                    await ClearFolderVersionsCache();

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
            item.Content = await _contentService.Add(_resourcesGroup, request.Content);
            item = await _service.Update(item);
            if (!string.IsNullOrWhiteSpace(originContent))
            {
                await _contentService.Delete(originContent);
            }
            return reply;
        }

        public override async Task<Reply> UpdateComment(UpdateCommentRequest request, ServerCallContext context)
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
            item.Comment = request.Comment;
            item = await _service.Update(item);
            if (item.Type == (int)FileType.Folder)
            {
                await ClearFolderVersionsCache();
            }
            return reply;
        }

        private string GetContentType(string type)
        {
            if (string.IsNullOrWhiteSpace(type))
            {

                return null;
            }
            type = type.Split('/').Last();
            if (!new Regex(@"[a-z0-9]{3,6}").Match(type).Success)
            {
                return null;
            }
            return type;
        }

        public async override Task<ResourceReply> AddResource(AddResourceRequest request, ServerCallContext context)
        {
            var reply = new ResourceReply();
            var type = GetContentType(request.Type);
            if (string.IsNullOrWhiteSpace(type))
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
            file.Content = await _contentService.Add(_resourcesGroup, stream =>
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
                            await ClearFolderVersionsCache();
                            file.Parent.NormalFilesCount = Math.Max(0, ((file.Parent.NormalFilesCount ?? 0) - 1));
                            await _service.Update(file.Parent);
                        }
                        else if (file.Type == (int)FileType.Folder)
                        {
                            await ClearFolderVersionsCache();
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