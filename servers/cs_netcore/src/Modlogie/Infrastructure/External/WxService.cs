using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Modlogie.Domain;
using Newtonsoft.Json;

namespace Modlogie.Infrastructure.External
{
    public static class HttpClientUtils
    {
        public static async Task<T> PostAsync<T>(this HttpClient client, string requestUri, HttpContent content)
            where T : class
        {
            var res = await client.PostAsync(requestUri, content);
            var str = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<T>(str);
        }
    }

    public class WxService : IWxService
    {
        private static readonly string WxAppId = nameof(WxAppId);
        private static readonly string WxAppSecret = nameof(WxAppSecret);

        private static readonly string WxApiUrlToken =
            $"https://api.weixin.qq.com/cgi-bin/tokengrant_type=client_credential&appid=${nameof(WxAppId)}&secret=${nameof(WxAppSecret)}";

        private static readonly string WxApiUrlUploadNews =
            "https://api.weixin.qq.com/cgi-bin/media/uploadnewsaccess_token=$ACCESS_TOKEN";

        private static readonly string WxApiUrlSendAll =
            "https://api.weixin.qq.com/cgi-bin/message/mass/sendallaccess_token=$ACCESS_TOKEN";

        private static readonly string WxApiUrlPreview =
            "https://api.weixin.qq.com/cgi-bin/message/mass/previewaccess_token=$ACCESS_TOKEN";

        private static readonly string WxApiUrlUpload =
            "https://api.weixin.qq.com/cgi-bin/media/uploadaccess_token=$ACCESS_TOKEN&type=$TYPE";

        private static readonly string WxApiUrlUploadImg =
            "https://api.weixin.qq.com/cgi-bin/media/uploadimgaccess_token=$ACCESS_TOKEN";

        private static readonly string WxApiUrlDeleteMsg =
            "https://api.weixin.qq.com/cgi-bin/message/mass/deleteaccess_token=$ACCESS_TOKEN";


        private static string _mToken = "";

        private static DateTime _mTokenExpiredTime = DateTime.MinValue;

        private static Task<TokenData> _mGettingToken;

        private readonly Lazy<IFileContentService> _mFileContentService;

        private readonly Lazy<IKeyValuesEntityService> _mKeyValuesService;

        private readonly string _resourcesGroup;

        public WxService(IConfiguration configuration,
            Lazy<IKeyValuesEntityService> keyValuesService,
            Lazy<IFileContentService> fileContentService)
        {
            _resourcesGroup = configuration.GetValue<string>("File:Resources");
            _mKeyValuesService = keyValuesService;
            _mFileContentService = fileContentService;
        }

        public async Task<string> Publish(PublishArticle article)
        {
            var urlTemplate = WxApiUrlUploadNews;
            var newsContent = await BuildNews(article);
            var client = new HttpClient();
            var token = await GetToken();
            var url = urlTemplate!.Replace("$ACCESS_TOKEN", token);
            var ret = await client.PostAsync<WxUploadNewsRes>(url,
                new StringContent(newsContent, Encoding.UTF8, "application/json"));
            if (string.IsNullOrWhiteSpace(ret.MediaId)) throw new Exception();
            return ret.MediaId;
        }

        public async Task Delete(string msgId)
        {
            var msgStr = JsonConvert.SerializeObject(new WxDeleteMsgParas
            {
                MsgId = msgId
            });
            var client = new HttpClient();
            var urlTemplate = WxApiUrlDeleteMsg;
            var token = await GetToken();
            var url = urlTemplate!.Replace("$ACCESS_TOKEN", token);
            var res = await client.PostAsync<WxRes>(url, new StringContent(msgStr, Encoding.UTF8, "application/json"));
            if (!res.HasError()) throw new Exception();
        }

        public async Task<string> Send(string mediaId)
        {
            var perviewUserId = await _mKeyValuesService.Value.GetValue(ServerKeys.WechatPreviewUserId.Key);
            var msg = new WxSendParas
            {
                MpNews = new WxSendMpNews
                {
                    MediaId = mediaId
                }
            };
            var urlConfigName = string.Empty;
            if (string.IsNullOrWhiteSpace(perviewUserId))
            {
                msg.Filter = new WxSendFilter
                {
                    IsToAll = true
                };
                urlConfigName = WxApiUrlSendAll;
            }
            else
            {
                msg.ToUser = perviewUserId;
                urlConfigName = WxApiUrlPreview;
            }

            var msgStr = JsonConvert.SerializeObject(msg);
            var client = new HttpClient();
            var urlTemplate = await _mKeyValuesService.Value.GetValue(urlConfigName);
            if (string.IsNullOrWhiteSpace(urlTemplate)) throw new Exception();
            var token = await GetToken();
            var url = urlTemplate!.Replace("$ACCESS_TOKEN", token);
            var res = await client.PostAsync<WxSendRes>(url,
                new StringContent(msgStr, Encoding.UTF8, "application/json"));
            if (res.HasError()) throw new Exception();
            return res.MsgId;
        }

        public async Task<string> Upload(string fileName, Stream file, string type)
        {
            var urlConfig = WxApiUrlUpload;
            var res = await UploadFile<WxUploadRes>(fileName, file, type);
            if (res == null) return null;
            if (type == WxUploadTypes.CONFIG_THUMB) return res.ThumbMediaId;
            return res.MediaId;
        }

        private async Task<TokenData> GetTokenFromServer()
        {
            var urlTemplate = WxApiUrlToken;
            var appid = await _mKeyValuesService.Value.GetValue(ServerKeys.WechatAppId.Key);
            var appSecret = await _mKeyValuesService.Value.GetValue(ServerKeys.WechatAppIdSecret.Key);
            if (string.IsNullOrWhiteSpace(urlTemplate) || string.IsNullOrWhiteSpace(appid) ||
                string.IsNullOrWhiteSpace(appSecret)) throw new Exception();
            var url = urlTemplate!.Replace(WxAppId, appid)
                .Replace(WxAppSecret, appSecret);
            var client = new HttpClient();
            var res = await client.GetStringAsync(url);
            var data = JsonConvert.DeserializeObject<TokenData>(res);
            if (string.IsNullOrWhiteSpace(data.AccessToken) || data.ExpiresIn <= 0) throw new Exception();
            return data;
        }

        private async Task<string> GetToken()
        {
            if (!string.IsNullOrWhiteSpace(_mToken) && _mTokenExpiredTime < DateTime.Now) return _mToken;
            if (_mGettingToken == null) _mGettingToken = GetTokenFromServer();
            var data = await _mGettingToken;
            _mGettingToken = null;
            _mToken = data.AccessToken;
            _mTokenExpiredTime = DateTime.Now.AddSeconds(data.ExpiresIn!.Value);
            return _mToken;
        }

        private async Task<string> BuildNews(PublishArticle article)
        {
            var param = new WxUploadNewsParas();
            var wxArticle = new WxUploadNewsArticle
            {
                Author = string.Empty,
                Title = article.Title,
                ContentSourceUrl = article.Url
            };
            param.Articles = new[] {wxArticle};
            var sb = new StringBuilder();
            var thumbUploaded = false;
            foreach (var slice in article.Slices)
            {
                if (slice.Type == PublishArticleSliceType.String)
                {
                    sb.Append(slice.Value);
                    continue;
                }

                if (slice.Type == PublishArticleSliceType.Image)
                {
                    if (!thumbUploaded)
                    {
                        using (var file = await _mFileContentService.Value.Open(_resourcesGroup, slice.Value))
                        {
                            wxArticle.ThumbMediaId = await Upload(Path.GetFileName(slice.Value), file,
                                WxUploadTypes.CONFIG_THUMB);
                        }

                        thumbUploaded = true;
                    }

                    using (var file = await _mFileContentService.Value.Open(_resourcesGroup, slice.Value))
                    {
                        sb.Append(await UploadImg(Path.GetFileName(slice.Value), file));
                    }
                }
            }

            if (!thumbUploaded) throw new Exception();
            wxArticle.Content = sb.ToString();
            return JsonConvert.SerializeObject(param);
        }

        private async Task<T> UploadFile<T>(string fileName, Stream file, string type = null)
            where T : WxRes
        {
            using (var fs = file)
            {
                var urlTemplate = WxApiUrlUpload;
                if (string.IsNullOrWhiteSpace(urlTemplate)) throw new Exception();
                var msgStr = string.Empty;
                var token = await GetToken();
                var url = urlTemplate!.Replace("$ACCESS_TOKEN", token);
                if (!string.IsNullOrWhiteSpace(type)) url = url.Replace("$TYPE", type);
                var client = new HttpClient();
                var multiContent = BuildContent(fileName, fs);
                var res = await client.PostAsync<T>(url, multiContent);
                if (res.HasError()) throw new Exception();
                return res;
            }
        }

        public async Task<string> UploadImg(string fileName, Stream file)
        {
            var urlConfig = WxApiUrlUploadImg;
            var res = await UploadFile<WxUploadImgRes>(fileName, file, urlConfig);
            if (res == null) return null;
            return res.Url;
        }


        private HttpContent BuildContent(string fileName, Stream file)
        {
            var boundary = "----" + DateTime.Now.Ticks.ToString("x");
            var content = new MultipartFormDataContent(boundary);
            var fileContent = new StreamContent(file);
            fileContent.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
            {
                Name = "\"media\"",
                FileName = "\"" + fileName + "\""
            };
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            content.Add(fileContent, "\"media\"", fileName);
            content.Headers.ContentType =
                MediaTypeHeaderValue.Parse(string.Format("multipart/form-data; boundary={0}", boundary));
            return content;
        }

        private class TokenData
        {
            [JsonProperty("access_token")] public string AccessToken { get; set; }

            [JsonProperty("expires_in")] public int? ExpiresIn { get; set; }
        }
    }

    public class WxDeleteMsgParas
    {
        [JsonProperty("msg_id")] public string MsgId { get; set; }
    }

    public class WxSendParas
    {
        [JsonProperty("filter")] public WxSendFilter Filter { get; set; }

        [JsonProperty("touser")] public string ToUser { get; set; }

        [JsonProperty("mpnews")] public WxSendMpNews MpNews { get; set; }

        [JsonProperty("msgtype")] public string MsgType { get; set; } = "mpnews";

        [JsonProperty("send_ignore_reprint")] public int SendIgnoreReprint { get; set; }
    }

    public class WxSendMpNews
    {
        [JsonProperty("media_id")] public string MediaId { get; set; }
    }

    public class WxSendFilter
    {
        [JsonProperty("is_to_all")] public bool IsToAll { get; set; } = true;
    }


    public class WxUploadNewsArticle
    {
        [JsonProperty("thumb_media_id")] public string ThumbMediaId { get; set; }

        [JsonProperty("author")] public string Author { get; set; }

        [JsonProperty("title")] public string Title { get; set; }

        [JsonProperty("content_source_url")] public string ContentSourceUrl { get; set; }

        [JsonProperty("content")] public string Content { get; set; }

        [JsonProperty("digest")] public string Digest { get; set; }

        [JsonProperty("show_cover_pic")] public int ShowCoverPic { get; set; }

        [JsonProperty("need_open_comment")] public int NeedOpenComment { get; set; }

        [JsonProperty("only_fans_can_comment")]
        public int OnlyFansCanComment { get; set; }
    }

    public class WxUploadNewsParas
    {
        [JsonProperty("articles")] public WxUploadNewsArticle[] Articles { get; set; }
    }

    public class WxSendRes : WxRes
    {
        [JsonProperty("msg_id")] public string MsgId { get; set; }
    }

    public class WxRes
    {
        [JsonProperty("errcode")] public int? ErrorCode { get; set; }

        [JsonProperty("errmsg")] public string ErrorMessage { get; set; }

        public bool HasError()
        {
            return ErrorCode != null && ErrorCode.Value != 0;
        }
    }

    public class WxUploadImgRes : WxRes
    {
        [JsonProperty("url")] public string Url { get; set; }
    }

    public class WxUploadRes : WxRes
    {
        [JsonProperty("thumb_media_id")] public string ThumbMediaId { get; set; }

        [JsonProperty("media_id")] public string MediaId { get; set; }
    }

    public class WxUploadNewsRes : WxRes
    {
        [JsonProperty("type")] public string Type { get; set; }

        [JsonProperty("media_id")] public string MediaId { get; set; }

        [JsonProperty("created_at")] public long CreatedAt { get; set; }
    }
}