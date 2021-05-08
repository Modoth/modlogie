using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Google.Protobuf;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Modlogie.Api.Common;
using Modlogie.Api.Files;
using Modlogie.Api.Tags;
using Modlogie.Domain;
using static Modlogie.Api.Files.File.Types;
using File = Modlogie.Domain.Models.File;
using FileTag = Modlogie.Api.Files.FileTag;

namespace Modlogie.Api.Services
{
    public static class FilesServiceUtils
    {
        public static bool HasWritePermission(this LoginUser user)
        {
            if (user == null)
            {
                return false;
            }

            return user.Adm;
        }

        public static bool HasReadPrivatePermission(this LoginUser user)
        {
            if (user == null)
            {
                return false;
            }

            return user.Adm || user.Authorised;
        }
    }

    public class FilesService : Files.FilesService.FilesServiceBase
    {
        private const string PathSep = "/";

        private const string FoldersVersionCacheKey = "FILES_VERSION";

        private static readonly Expression<Func<File, Files.File>> Selector = i =>
            new Files.File
            {
                Id = i.Id.ToString(),
                Name = i.Name,
                Path = i.Path,
                NormalFilesCount = i.NormalFilesCount ?? 0,
                ParentId = i.ParentId != null ? i.ParentId.ToString() : string.Empty,
                Content = i.Content ?? string.Empty,
                Comment = i.Comment ?? string.Empty,
                Private = i.Private == 1ul,
                Published = i.Published.HasValue ? i.Published.Value.ToUniversalTime().ToTimestamp() : new Timestamp(),
                AdditionalType = i.AdditionalType ?? 0,
                FileTagsForSelect = i.FileTags != null
                    ? i.FileTags.Select(t => new FileTag { TagId = t.TagId.ToString(), Value = t.Value })
                    : null
            };

        private static readonly Func<File, Files.File> Converter = Selector.Compile();
        private readonly IDistributedCache _cache;
        private readonly string _cachesGroup;
        private readonly IFileContentService _contentService;
        private readonly IKeyValuesEntityService _keyValueService;
        private readonly IFileQueryCompileService _queryCompiler;
        private readonly string _resourcesGroup;
        private readonly IFilesEntityService _service;
        private readonly ITagsEntityService _tagsService;
        private readonly ILoginUserService _userService;

        public FilesService(IConfiguration configuration,
            IFilesEntityService service,
            ITagsEntityService tagsService,
            IFileContentService contentService,
            ILoginUserService userService,
            IKeyValuesEntityService keyValueService,
            IFileQueryCompileService queryCompiler,
            IDistributedCache cache)
        {
            _resourcesGroup = configuration.GetValue<string>("File:Resources");
            _cachesGroup = configuration.GetValue<string>("File:Caches");
            _service = service;
            _tagsService = tagsService;
            _contentService = contentService;
            _queryCompiler = queryCompiler;
            _userService = userService;
            _keyValueService = keyValueService;
            _cache = cache;
        }

        private async Task<FilesReply> UpdateFolderVersionsCache()
        {
            var folders = await GetFoldersInternal();
            var version = await _contentService.Add(_cachesGroup, fs =>
            {
                using (var s = new CodedOutputStream(fs))
                {
                    folders.WriteTo(s);
                }

                return Task.FromResult(true);
            }, "bin");
            await _cache.SetStringAsync(FoldersVersionCacheKey, version);
            return folders;
        }

        private async Task ClearFolderVersionsCache()
        {
            await _cache.RemoveAsync(FoldersVersionCacheKey);
        }

        private static string JoinPath(string basePath, string name)
        {
            return basePath + PathSep + name;
        }

        private static string GetParentPath(string path)
        {
            return path.Substring(0, path.LastIndexOf(PathSep, StringComparison.Ordinal));
        }

        public override async Task<FilesReply> Query(QueryRequest request, ServerCallContext context)
        {
            var reply = new FilesReply();
            var query = request.Query;
            var parentPaths = default(FileParentId[]);
            if (!string.IsNullOrWhiteSpace(query.Parent))
            {
                var indexedParentPath = query.Parent!;
                parentPaths = await _service.All()
                    .Where(n => n.Type == (int)FileType.Folder && n.Path == indexedParentPath).Select(
                        n => new FileParentId { Path = n.Path + PathSep }
                    ).ToArrayAsync();
                if (!parentPaths.Any())
                {
                    return null;
                }
            }

            Expression<Func<File, bool>> queryFunc;
            try
            {
                queryFunc = _queryCompiler.Compile(parentPaths, query);
            }
            catch
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var items = _service.All().Where(queryFunc);
            var readPrivate = (await _userService.GetUser(context.GetHttpContext())).HasReadPrivatePermission();
            if (!readPrivate)
            {
                items = items.Where(i => i.Private == 0ul);
            }

            var filter = request.Filter;
            if (!string.IsNullOrWhiteSpace(filter))
            {
                filter = filter!.Trim();
                items = items.Where(n =>
                    n.Path!.Contains(filter, StringComparison.CurrentCultureIgnoreCase));
            }

            var randomOrder = query.OrderBy == "Random";
            int? total = null;
            if (randomOrder)
            {
                total = await items.CountAsync();
                var skip = total.Value - request.Take;
                if (skip > 0)
                {
                    skip = new Random().Next();
                    items = items.Skip(skip);
                }

                if (request.Take > 0)
                {
                    items = items.Take(request.Take);
                }
            }
            else
            {
                if (!string.IsNullOrWhiteSpace(query.OrderBy))
                {
                    Expression<Func<File, object>> orderBy = default;
                    switch (query.OrderBy)
                    {
                        case nameof(File.Name):
                            orderBy = node => node.Name!;
                            break;
                        case nameof(File.Created):
                            orderBy = node => node.Created;
                            break;
                        case nameof(File.Modified):
                            orderBy = node => node.Modified;
                            break;
                        case nameof(File.Published):
                            orderBy = node => node.Published;
                            break;
                    }

                    if (orderBy == null)
                    {
                        reply.Error = Error.InvalidArguments;
                        return reply;
                    }

                    items = query.OrderByDesc ? items.OrderByDescending(orderBy) : items.OrderBy(orderBy);
                }

                if (request.Skip > 0 || request.Take > 0)
                {
                    total = await items.CountAsync();
                }

                if (request.Skip > 0)
                {
                    items = items.Skip(request.Skip);
                }

                if (request.Take > 0)
                {
                    items = items.Take(request.Take);
                }
            }

            var files = await items
                .Select(Selector)
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
                .Select(Selector)
                .ToArrayAsync());
            return reply;
        }

        public override async Task<FilesReply> GetFolders(Empty request, ServerCallContext context)
        {
            var version = await _cache.GetStringAsync(FoldersVersionCacheKey);
            if (string.IsNullOrWhiteSpace(version) || !await _contentService.Existed(version))
            {
                var reply = await UpdateFolderVersionsCache();
                return reply;
            }
            else
            {
                var reply = new FilesReply { Version = version };
                return reply;
            }
        }

        public override async Task<FilesReply> GetFiles(GetFilesRequest request, ServerCallContext context)
        {
            var reply = new FilesReply();
            var items = _service.All().Where(f => f.Type == (int)FileType.Normal);
            if (!string.IsNullOrWhiteSpace(request.ParentId))
            {
                if (!Guid.TryParse(request.ParentId, out var folderId))
                {
                    reply.Error = Error.NoSuchEntity;
                    return reply;
                }

                var folder = await _service.All().Where(k => k.Id == folderId && k.Type == (int)FileType.Folder)
                    .FirstOrDefaultAsync();
                if (folder == null)
                {
                    reply.Error = Error.NoSuchEntity;
                    return reply;
                }

                var pathPrefix = folder.Path + PathSep;
                items = items.Where(f => f.Path.StartsWith(pathPrefix));
            }

            var readPrivate = (await _userService.GetUser(context.GetHttpContext())).HasReadPrivatePermission();
            if (!readPrivate)
            {
                items = items.Where(i => i.Private == 0ul);
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
                .Select(Selector)
                .ToArrayAsync());
            if (total.HasValue)
            {
                reply.Total = total.Value;
            }

            return reply;
        }


        public override async Task<FileReply> GetResourceById(StringId request, ServerCallContext context)
        {
            var reply = new FileReply();
            if (string.IsNullOrWhiteSpace(request.Id))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            if (!Guid.TryParse(request.Id, out var fileId))
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }

            var readPrivate = (await _userService.GetUser(context.GetHttpContext())).HasReadPrivatePermission();
            var items = _service.All().Where(f => f.Type == (int)FileType.Resource);
            if (!readPrivate)
            {
                items = items.Where(i => i.Private == 0ul);
            }

            var file = await items.Where(k => k.Id == fileId).FirstOrDefaultAsync();
            if (file != null)
            {
                reply.File = Converter(file);
            }

            return reply;
        }

        private string DbcToSbc(string input)
        {
            return new string(input.Select(c => c == 32 ? (char)12288 : c < 127 ? (char)(c + 65248) : c).ToArray());
        }

        private bool AddFileFromNewFolderItem(HashSet<string> existedFiles, List<File> files, NewFolderItem item,
            File parent, DateTime created, bool autoFix)
        {
            if (!ValidateFileName(item.Name))
            {
                return autoFix;
            }

            if (autoFix)
            {
                var key = DbcToSbc(item.Name).ToLower();
                if (existedFiles.Contains(key))
                {
                    return true;
                }

                existedFiles.Add(key);
            }

            var file = new File
            {
                Type = (int)FileType.Folder,
                Name = item.Name,
                Created = created,
                Modified = created,
                Published = created
            };
            files.Add(file);
            if (parent != null)
            {
                file.Parent = parent;
                file.Path = JoinPath(parent.Path, file.Name);
            }
            else
            {
                file.Path = PathSep + file.Name;
            }

            if (item.Children != null && item.Children.Count > 0)
            {
                var existedChildren = autoFix ? new HashSet<string>() : null;
                foreach (var c in item.Children)
                {
                    if (!AddFileFromNewFolderItem(existedChildren, files, c, file, created, autoFix))
                    {
                        return false;
                    }
                }
            }

            return true;
        }

        public override async Task<FilesReply> AddFolders(AddFoldersRequest request, ServerCallContext context)
        {
            var reply = new FilesReply();
            var user = await _userService.GetUser(context.GetHttpContext());
            if (user == null)
            {
                reply.Error = Error.NeedLogin;
                return reply;
            }

            if (!user.HasWritePermission())
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            File parent = null;
            if (!string.IsNullOrWhiteSpace(request.ParentId))
            {
                if (!Guid.TryParse(request.ParentId, out var parentId))
                {
                    reply.Error = Error.NoSuchEntity;
                    return reply;
                }

                parent = await _service.All()
                    .FirstOrDefaultAsync(f => f.Id == parentId && f.Type == (int)FileType.Folder);
                if (parent == null)
                {
                    reply.Error = Error.NoSuchEntity;
                    return reply;
                }
            }

            var now = DateTime.Now;
            var files = new List<File>();
            var autoFix = request.AutoFix;
            var existedFiles = autoFix ? new HashSet<string>() : null;
            foreach (var f in request.Folders)
            {
                if (!AddFileFromNewFolderItem(existedFiles, files, f, parent, now, autoFix))
                {
                    reply.Error = Error.InvalidArguments;
                    return reply;
                }
            }

            await _service.AddRange(files);
            await ClearFolderVersionsCache();
            reply.Files.AddRange(files.Select(Converter));
            return reply;
        }

        public override async Task<AddOrUpdateTagsReply> AddOrUpdateTags(AddOrUpdateTagsRequest request,
            ServerCallContext context)
        {
            var reply = new AddOrUpdateTagsReply();
            var user = await _userService.GetUser(context.GetHttpContext());
            if (user == null)
            {
                reply.Error = Error.NeedLogin;
                return reply;
            }

            if (!user.HasWritePermission())
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            if (!Guid.TryParse(request.Id, out var id))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var item = await _service.All().Where(i => i.Id == id).Include(i => i.FileTags).ThenInclude(t => t.Tag)
                .FirstOrDefaultAsync();
            if (item == null)
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }

            item.FileTags ??= new List<Domain.Models.FileTag>();

            var tags = item.FileTags;
            var tagsDict = tags.ToDictionary(t => t.TagId);
            var updates = request.Tags.Select(t => new
            {
                TagId = Guid.Parse(t.TagId),
                t.Value,
                t.Content,
                ContentType = GetContentType(t.ContentType),
                File = item
            });

            var resourceContentToDelete = new List<string>();
            foreach (var update in updates)
            {
                Domain.Models.FileTag tag;
                if (tagsDict.ContainsKey(update.TagId))
                {
                    tag = tagsDict[update.TagId];
                }
                else
                {
                    tag = new Domain.Models.FileTag
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
            foreach (var tobedeleted in resourceContentToDelete)
            {
                try
                {
                    await _contentService.Delete(tobedeleted);
                }
                catch (Exception)
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

        public override async Task<Reply> UpdatePublished(UpdatePublishedRequest request, ServerCallContext context)
        {
            var reply = new Reply();
            var user = await _userService.GetUser(context.GetHttpContext());
            if (user == null)
            {
                reply.Error = Error.NeedLogin;
                return reply;
            }

            if (!user.HasWritePermission())
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            if (!Guid.TryParse(request.Id, out var id))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var item = await _service.All().Where(i => i.Id == id).Include(i => i.FileTags).ThenInclude(t => t.Tag)
                .FirstOrDefaultAsync();
            if (item == null)
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }

            item.Published = request.Published.ToDateTime().ToUniversalTime();
            await _service.Update(item);
            return reply;
        }

        public override async Task<Reply> DeleteTags(DeleteTagsRequest request, ServerCallContext context)
        {
            var reply = new Reply();
            var user = await _userService.GetUser(context.GetHttpContext());
            if (user == null)
            {
                reply.Error = Error.NeedLogin;
                return reply;
            }

            if (!user.HasWritePermission())
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            if (!Guid.TryParse(request.Id, out var id))
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

            return reply;
        }

        private bool ValidateFileName(string name)
        {
            return !string.IsNullOrWhiteSpace(name) && name.IndexOf(PathSep, StringComparison.Ordinal) < 0;
        }

        public override async Task<FileReply> Add(AddRequest request, ServerCallContext context)
        {
            var reply = new FileReply();
            var user = await _userService.GetUser(context.GetHttpContext());
            if (user == null)
            {
                reply.Error = Error.NeedLogin;
                return reply;
            }

            if (!user.HasWritePermission())
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            if (!ValidateFileName(request.Name))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var file = new File
            { Type = (int)request.FileType, Name = request.Name, Created = DateTime.Now, Modified = DateTime.Now };
            if (!string.IsNullOrWhiteSpace(request.ParentId))
            {
                if (!Guid.TryParse(request.ParentId, out var parentId))
                {
                    reply.Error = Error.NoSuchEntity;
                    return reply;
                }

                var parent = await _service.All()
                    .FirstOrDefaultAsync(f => f.Id == parentId && f.Type == (int)FileType.Folder);
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
                file.Path = PathSep + file.Name;
            }

            using (var trans = _service.Context.BeginTransaction())
            {
                file = await _service.Add(file);
                if (file.Type == (int)FileType.Normal && file.Parent != null &&
                    file.Parent.Type == (int)FileType.Folder)
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

            reply.File = Converter(file);
            return reply;
        }

        public override async Task<FileReply> UpdateName(UpdateNameRequest request, ServerCallContext context)
        {
            var reply = new FileReply();
            var user = await _userService.GetUser(context.GetHttpContext());
            if (user == null)
            {
                reply.Error = Error.NeedLogin;
                return reply;
            }

            if (!user.HasWritePermission())
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            if (!ValidateFileName(request.Name))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            if (!Guid.TryParse(request.Id, out var id))
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
                var childrenPathSuffix = item.Path + PathSep;
                item.Name = request.Name;
                item.Path = JoinPath(GetParentPath(item.Path), item.Name);
                item = await _service.Update(item);
                var children = _service.All()
                    .Where(n => n.Path!.StartsWith(childrenPathSuffix));
                if (children.Any())
                {
                    foreach (var sub in children)
                    {
                        sub.Path = JoinPath(item.Path, sub.Path!.Substring(childrenPathSuffix.Length));
                    }

                    await _service.UpdateRange(children);
                }

                await trans.Commit();
            }

            reply.File = Converter(item);
            if (item.Type == (int)FileType.Folder)
            {
                await ClearFolderVersionsCache();
            }

            return reply;
        }

        public override async Task<FileReply> Move(MoveRequest request, ServerCallContext context)
        {
            var reply = new FileReply();
            var user = await _userService.GetUser(context.GetHttpContext());
            if (user == null)
            {
                reply.Error = Error.NeedLogin;
                return reply;
            }

            if (!user.HasWritePermission())
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            if (!Guid.TryParse(request.Id, out var id) || !Guid.TryParse(request.ParentId, out var parentId))
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

            var parent = await _service.All().Where(i => i.Id == parentId && i.Type == (int)FileType.Folder)
                .FirstOrDefaultAsync();
            if (parent == null)
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }

            using (var trans = _service.Context.BeginTransaction())
            {
                if (file.Type == (int)FileType.Normal && file.Parent != null &&
                    file.Parent.Type == (int)FileType.Folder)
                {
                    file.Parent.NormalFilesCount = Math.Max(0, (file.Parent.NormalFilesCount ?? 0) - 1);
                    await _service.Update(file.Parent);
                    await ClearFolderVersionsCache();
                }
                else if (file.Type == (int)FileType.Folder)
                {
                    await ClearFolderVersionsCache();
                }

                var childrenPathSuffix = file.Path + PathSep;
                file.ParentId = parent.Id;
                file.Parent = parent;
                file.Path = JoinPath(parent.Path, file.Name);
                file = await _service.Update(file);
                var children = _service.All()
                    .Where(n => n.Path!.StartsWith(childrenPathSuffix));
                if (children.Any())
                {
                    foreach (var sub in children)
                    {
                        sub.Path = JoinPath(file.Path, sub.Path!.Substring(childrenPathSuffix.Length));
                    }

                    await _service.UpdateRange(children);
                }

                if (file.Type == (int)FileType.Normal && file.Parent != null &&
                    file.Parent.Type == (int)FileType.Folder)
                {
                    file.Parent.NormalFilesCount = Math.Max(0, (file.Parent.NormalFilesCount ?? 0) + 1);
                    await _service.Update(file.Parent);
                }

                await trans.Commit();
            }

            reply.File = Converter(file);
            return reply;
        }

        public override async Task<Reply> UpdateContent(UpdateContentRequest request, ServerCallContext context)
        {
            var reply = new Reply();
            var user = await _userService.GetUser(context.GetHttpContext());
            if (user == null)
            {
                reply.Error = Error.NeedLogin;
                return reply;
            }

            if (!user.HasWritePermission())
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            if (!Guid.TryParse(request.Id, out var id))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var item = await _service.All().Where(i => i.Id == id && i.Type != (int)FileType.Folder)
                .FirstOrDefaultAsync();
            if (item == null)
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }

            var originContent = item.Content;
            item.Content = await _contentService.Add(_resourcesGroup, request.Content);
            var resourceIds = new HashSet<Guid>();
            foreach(var idStr in request.ResourceIds){
                if (Guid.TryParse(idStr,out var resourceId)){
                    resourceIds.Add(resourceId);
                }
            }
            var resources = await _service.All().Where(i => i.ParentId == id && i.Type == (int)FileType.Resource).ToArrayAsync();
            var resourceContentToDelete = resources.Where(r => !resourceIds.Contains(r.Id)).ToArray();
            await _service.Update(item);
            if (!string.IsNullOrWhiteSpace(originContent))
            {
                await _contentService.Delete(originContent);
            }
            foreach (var tobedeleted in resourceContentToDelete)
            {
                try
                {
                    await _contentService.Delete(tobedeleted.Content);
                }
                catch (Exception)
                {
                    //ignore
                }
            }

            return reply;
        }


        public override async Task<Reply> UpdateComment(UpdateCommentRequest request, ServerCallContext context)
        {
            var reply = new Reply();
            var user = await _userService.GetUser(context.GetHttpContext());
            if (user == null)
            {
                reply.Error = Error.NeedLogin;
                return reply;
            }

            if (!user.HasWritePermission())
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            if (!Guid.TryParse(request.Id, out var id))
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

        public override async Task<Reply> UpdateAdditionalType(UpdateAdditionalTypeRequest request,
            ServerCallContext context)
        {
            var reply = new Reply();
            var user = await _userService.GetUser(context.GetHttpContext());
            if (user == null)
            {
                reply.Error = Error.NeedLogin;
                return reply;
            }

            if (!user.HasWritePermission())
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            if (!Guid.TryParse(request.Id, out var id))
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

            item.AdditionalType = request.AdditionalType;
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

        public override async Task<ResourceReply> AddResource(AddResourceRequest request, ServerCallContext context)
        {
            var reply = new ResourceReply();
            var type = GetContentType(request.Type);
            var user = await _userService.GetUser(context.GetHttpContext());
            if (user == null)
            {
                reply.Error = Error.NeedLogin;
                return reply;
            }

            if (!user.HasWritePermission())
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            if (!Guid.TryParse(request.ParentId, out var id))
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

            var file = new File
            {
                Type = (int)FileType.Resource,
                Name = Guid.NewGuid().ToString(),
                Parent = parent,
                Created = DateTime.Now,
                Modified = DateTime.Now,
                Published = DateTime.Now,
                Private = request.Private ? 1ul : 0
            };
            file.Path = JoinPath(parent.Path, file.Name);
            if (!string.IsNullOrWhiteSpace(request.TextContent))
            {
                file.Content = await _contentService.Add(_resourcesGroup, request.TextContent);
            }
            else
            {
                file.Content = await _contentService.Add(_resourcesGroup, stream =>
                {
                    request.Content.WriteTo(stream);
                    return Task.FromResult(true);
                }, string.IsNullOrWhiteSpace(type) ? null : type);
            }

            file = await _service.Add(file);
            reply.Id = file.Id.ToString();
            reply.ContentId = file.Content;
            return reply;
        }

        public override async Task<Reply> Delete(StringId request, ServerCallContext context)
        {
            var reply = new Reply();
            var user = await _userService.GetUser(context.GetHttpContext());
            if (user == null)
            {
                reply.Error = Error.NeedLogin;
                return reply;
            }

            if (!user.HasWritePermission())
            {
                reply.Error = Error.NoPermission;
                return reply;
            }

            if (Guid.TryParse(request.Id, out var id))
            {
                var file = await _service.All().Where(k => k.Id == id).Include(k => k.Parent).FirstOrDefaultAsync();
                if (file != null)
                {
                    using var trans = _service.Context.BeginTransaction();
                    var childrenPathSuffix = file.Path + PathSep;
                    var children = _service.All()
                        .Where(n => n.Path!.StartsWith(childrenPathSuffix));
                    var resourceContentToDelete = new List<string>();
                    if (children.Any())
                    {
                        foreach (var sub in children)
                        {
                            if(sub.Type == (int)FileType.Resource){
                                resourceContentToDelete.Add(sub.Content);
                            }
                        }
                    }

                    await _service.Delete(file);
                    await _service.DeleteRange(children);
                    foreach (var tobedeleted in resourceContentToDelete)
                    {
                        try
                        {
                            await _contentService.Delete(tobedeleted);
                        }
                        catch (Exception)
                        {
                            //ignore
                        }
                    }
                    if (file.Type == (int)FileType.Normal && file.Parent != null &&
                        file.Parent.Type == (int)FileType.Folder)
                    {
                        await ClearFolderVersionsCache();
                        file.Parent.NormalFilesCount = Math.Max(0, (file.Parent.NormalFilesCount ?? 0) - 1);
                        await _service.Update(file.Parent);
                    }
                    else if (file.Type == (int)FileType.Folder)
                    {
                        await ClearFolderVersionsCache();
                    }

                    await trans.Commit();
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


        private async Task<Reply> IncreaseOrDecreaseTag(IncDecTagRequest request, int inc)
        {
            var reply = new Reply();
            if (!Guid.TryParse(request.TagId, out var tagId) || !Guid.TryParse(request.FileId, out var fileId))
            {
                reply.Error = Error.InvalidArguments;
                return reply;
            }

            var tag = await _tagsService.All().FirstOrDefaultAsync(t => t.Id == tagId);
            if (tag == null)
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }

            var file = await _service.All().Include(f => f.FileTags).FirstOrDefaultAsync(f => f.Id == fileId);
            if (file == null)
            {
                reply.Error = Error.NoSuchEntity;
                return reply;
            }

            var editableTags = await _keyValueService.All()
                .FirstOrDefaultAsync(kv => kv.Id == ServerKeys.IncreaseTags.Key);
            if (editableTags == null || string.IsNullOrWhiteSpace(editableTags.Value))
            {
                reply.Error = Error.InvalidOperation;
                return reply;
            }

            var canEdit = editableTags.Value.Split(' ').Any(s => s.Trim() == tag.Name);
            if (!canEdit)
            {
                reply.Error = Error.InvalidOperation;
                return reply;
            }

            file.FileTags ??= new List<Domain.Models.FileTag>();

            var fileTag = file.FileTags.FirstOrDefault(t => t.TagId == tagId);
            if (fileTag == null)
            {
                fileTag = new Domain.Models.FileTag
                {
                    TagId = tagId,
                    FileId = fileId,
                    Value = Math.Max(inc, 0).ToString()
                };
                file.FileTags.Add(fileTag);
            }
            else
            {
                if (!int.TryParse(fileTag.Value, out var cur))
                {
                    cur = 0;
                }

                fileTag.Value = Math.Max(cur + inc, 0).ToString();
            }

            await _service.Update(file);
            return reply;
        }

        public override Task<Reply> IncreaseTag(IncDecTagRequest request, ServerCallContext context)
        {
            return IncreaseOrDecreaseTag(request, 1);
        }

        // public override Task<Reply> DecreaseTag(IncDecTagRequest request, ServerCallContext context)
        // {
        //     return IncreaseOrDecreaseTag(request, context, -1);
        // }
    }
}