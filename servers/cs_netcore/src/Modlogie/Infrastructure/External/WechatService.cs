using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.IO;
using System.Net.Http.Headers;
using Modlogie.Domain;
using Microsoft.Extensions.Configuration;

namespace ModothStudy.Service.CommonServices
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
        static readonly string CONFIG_WX_APP_ID = nameof(CONFIG_WX_APP_ID);
        static readonly string CONFIG_WX_APP_SECRET = nameof(CONFIG_WX_APP_SECRET);
        static readonly string CONFIG_WX_API_URL_TOKEN = $"https://api.weixin.qq.com/cgi-bin/tokengrant_type=client_credential&appid=${nameof(CONFIG_WX_APP_ID)}&secret=${nameof(CONFIG_WX_APP_SECRET)}";

        static readonly string CONFIG_WX_API_URL_MENU = "https://api.weixin.qq.com/cgi-bin/menu/createaccess_token=$ACCESS_TOKEN";
        static readonly string CONFIG_WX_API_URL_UPLOAD_NEWS = "https://api.weixin.qq.com/cgi-bin/media/uploadnewsaccess_token=$ACCESS_TOKEN";
        static readonly string CONFIG_WX_API_URL_SENDALL = "https://api.weixin.qq.com/cgi-bin/message/mass/sendallaccess_token=$ACCESS_TOKEN";
        static readonly string CONFIG_WX_API_URL_PREVIEW = "https://api.weixin.qq.com/cgi-bin/message/mass/previewaccess_token=$ACCESS_TOKEN";
        static readonly string CONFIG_WX_API_URL_UPLOAD = "https://api.weixin.qq.com/cgi-bin/media/uploadaccess_token=$ACCESS_TOKEN&type=$TYPE";
        static readonly string CONFIG_WX_API_URL_UPLOAD_IMG = "https://api.weixin.qq.com/cgi-bin/media/uploadimgaccess_token=$ACCESS_TOKEN";
        static readonly string CONFIG_WX_API_URL_DELETE_MSG = "https://api.weixin.qq.com/cgi-bin/message/mass/deleteaccess_token=$ACCESS_TOKEN";

        private class TokenData
        {
            [JsonProperty("access_token")]
            public string AccessToken { get; set; }

            [JsonProperty("expires_in")]
            public int? ExpiresIn { get; set; }
        }
        private readonly Lazy<IKeyValuesEntityService> m_KeyValuesService;

        private readonly Lazy<IFilesEntityService> m_FilesService;

        private readonly Lazy<IFileContentService> m_FileContentService;

        private readonly string _resourcesGroup;


        private static string m_Token = "";

        private static DateTime m_TokenExpriedTime = DateTime.MinValue;

        private static object m_TokenLock = new Object();

        private async Task<TokenData> GetTokenFromServer()
        {
            var urlTemplate = CONFIG_WX_API_URL_TOKEN;
            var appid = await m_KeyValuesService.Value.GetValue(ServerKeys.WechatAppId.Key);
            var appSecret = await m_KeyValuesService.Value.GetValue(ServerKeys.WechatAppIdSecret.Key);
            if (string.IsNullOrWhiteSpace(urlTemplate) || string.IsNullOrWhiteSpace(appid) || string.IsNullOrWhiteSpace(appSecret))
            {
                throw new Exception();
            }
            var url = urlTemplate!.Replace(CONFIG_WX_APP_ID, appid)
            .Replace(CONFIG_WX_APP_SECRET, appSecret);
            var client = new HttpClient();
            var res = await client.GetStringAsync(url);
            var data = JsonConvert.DeserializeObject<TokenData>(res);
            if (string.IsNullOrWhiteSpace(data.AccessToken) || data.ExpiresIn <= 0)
            {
                throw new Exception();
            }
            return data;
        }

        private static Task<TokenData> m_GettingToken;

        private async Task<string> GetToken()
        {
            if (!string.IsNullOrWhiteSpace(m_Token) && m_TokenExpriedTime < DateTime.Now)
            {
                return m_Token;
            }
            if (m_GettingToken == null)
            {
                m_GettingToken = GetTokenFromServer();
            }
            var data = await m_GettingToken;
            m_GettingToken = null;
            m_Token = data.AccessToken;
            m_TokenExpriedTime = DateTime.Now.AddSeconds(data.ExpiresIn!.Value);
            return m_Token;
        }

        public WxService(IConfiguration configuration,
        Lazy<IKeyValuesEntityService> keyValuesService,
        Lazy<IFilesEntityService> filesService,
        Lazy<IFileContentService> fileContentService)
        {
            _resourcesGroup = configuration.GetValue<string>("File:Resources");
            m_KeyValuesService = keyValuesService;
            m_FilesService = filesService;
            m_FileContentService = fileContentService;
        }

        private async Task<string> BuildNews(PublishArticle article)
        {
            var param = new WxUploadNewsParas();
            var wxArticle = new WxUploadNewsArticle
            {
                Author = String.Empty,
                Title = article.Title,
                ContentSourceUrl = article.Url,
            };
            param.Articles = new[] { wxArticle };
            var sb = new StringBuilder();
            var thumbUploaded = false;
            foreach (var slice in article.Slices)
            {
                if (slice.Type == PublishArticleSliceType.STRING)
                {
                    sb.Append(slice.Value);
                    continue;
                }
                if (slice.Type == PublishArticleSliceType.IMAGE)
                {
                    if (!thumbUploaded)
                    {
                        using (var file = await m_FileContentService.Value.Open(_resourcesGroup, slice.Value))
                        {
                            wxArticle.ThumbMediaId = (await Upload(Path.GetFileName(slice.Value), file, WxUploadTypes.Thumb));
                        }
                        thumbUploaded = true;
                    }
                    using (var file = await m_FileContentService.Value.Open(_resourcesGroup, slice.Value))
                    {
                        sb.Append(await UploadImg(Path.GetFileName(slice.Value), file));
                    }

                }
            }
            if (!thumbUploaded)
            {
                throw new Exception();
            }
            wxArticle.Content = sb.ToString();
            return JsonConvert.SerializeObject(param);
        }

        public async Task<string> Publish(PublishArticle article)
        {
            var urlTemplate = CONFIG_WX_API_URL_UPLOAD_NEWS;
            var newsContent = await BuildNews(article);
            var client = new HttpClient();
            var token = await GetToken();
            var url = urlTemplate!.Replace("$ACCESS_TOKEN", token);
            var ret = await client.PostAsync<WxUploadNewsRes>(url, new StringContent(newsContent, Encoding.UTF8, "application/json"));
            if (string.IsNullOrWhiteSpace(ret.MediaId))
            {
                throw new Exception();
            }
            return ret.MediaId;
        }

        public async Task Delete(string msgId)
        {
            var msgStr = JsonConvert.SerializeObject(new WxDeleteMsgParas
            {
                MsgId = msgId
            });
            var client = new HttpClient();
            var urlTemplate = CONFIG_WX_API_URL_DELETE_MSG;
            var token = await GetToken();
            var url = urlTemplate!.Replace("$ACCESS_TOKEN", token);
            var res = await client.PostAsync<WxRes>(url, new StringContent(msgStr, Encoding.UTF8, "application/json"));
            if (!res.HasError())
            {
                throw new Exception();
            }
        }

        public async Task<string> Send(string mediaId)
        {
            var perviewUserId = await m_KeyValuesService.Value.GetValue(ServerKeys.WechatPreviewUserId.Key);
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
                urlConfigName = CONFIG_WX_API_URL_SENDALL;
            }
            else
            {
                msg.ToUser = perviewUserId;
                urlConfigName = CONFIG_WX_API_URL_PREVIEW;
            }
            var msgStr = JsonConvert.SerializeObject(msg);
            var client = new HttpClient();
            var urlTemplate = await m_KeyValuesService.Value.GetValue(urlConfigName);
            if (string.IsNullOrWhiteSpace(urlTemplate))
            {
                throw new Exception();
            }
            var token = await GetToken();
            var url = urlTemplate!.Replace("$ACCESS_TOKEN", token);
            var res = await client.PostAsync<WxSendRes>(url, new StringContent(msgStr, Encoding.UTF8, "application/json"));
            if (res.HasError())
            {
                throw new Exception();
            }
            return res.MsgId;
        }

        private async Task<T> UploadFile<T>(string fileName, System.IO.Stream file, string type = null)
        where T : WxRes
        {
            using (var fs = file)
            {
                var urlTemplate = CONFIG_WX_API_URL_UPLOAD;
                if (string.IsNullOrWhiteSpace(urlTemplate))
                {
                    throw new Exception();
                }
                var msgStr = string.Empty;
                var token = await GetToken();
                var url = urlTemplate!.Replace("$ACCESS_TOKEN", token);
                if (!string.IsNullOrWhiteSpace(type))
                {
                    url = url.Replace("$TYPE", type);
                }
                var client = new HttpClient();
                var multiContent = BuildContent(fileName, fs);
                var res = await client.PostAsync<T>(url, multiContent);
                if (res.HasError())
                {
                    throw new Exception();
                }
                return res;
            }
        }

        public async Task<string> Upload(string fileName, System.IO.Stream file, string type)
        {
            var urlConfig = CONFIG_WX_API_URL_UPLOAD;
            var res = await UploadFile<WxUploadRes>(fileName, file, type);
            if (res == null)
            {
                return null;
            }
            if (type == WxUploadTypes.Thumb)
            {
                return res.ThumbMediaId;
            }
            return res.MediaId;
        }

        public async Task<string> UploadImg(string fileName, System.IO.Stream file)
        {
            var urlConfig = CONFIG_WX_API_URL_UPLOAD_IMG;
            var res = await UploadFile<WxUploadImgRes>(fileName, file, urlConfig);
            if (res == null)
            {
                return null;
            }
            return res.Url;
        }


        private HttpContent BuildContent(string fileName, Stream file)
        {
            string boundary = "----" + DateTime.Now.Ticks.ToString("x");
            var content = new MultipartFormDataContent(boundary);
            var fileContent = new StreamContent(file);
            fileContent.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
            {
                Name = "\"media\"",
                FileName = "\"" + fileName + "\""
            };
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            content.Add(fileContent, "\"media\"", fileName);
            content.Headers.ContentType = MediaTypeHeaderValue.Parse(string.Format("multipart/form-data; boundary={0}", boundary));
            return content;
        }
    }

    public class WxDeleteMsgParas
    {
        [JsonProperty("msg_id")]
        public string MsgId { get; set; }
    }

    public class WxSendParas
    {
        [JsonProperty("filter")]
        public WxSendFilter Filter { get; set; }

        [JsonProperty("touser")]
        public string ToUser { get; set; }

        [JsonProperty("mpnews")]
        public WxSendMpNews MpNews { get; set; }

        [JsonProperty("msgtype")]
        public string MsgType { get; set; } = "mpnews";

        [JsonProperty("send_ignore_reprint")]
        public int SendIgnoreReprint { get; set; } = 0;
    }

    public class WxSendMpNews
    {
        [JsonProperty("media_id")]
        public string MediaId { get; set; }

    }

    public class WxSendFilter
    {
        [JsonProperty("is_to_all")]
        public bool IsToAll { get; set; } = true;

    }


    public class WxUploadNewsArticle
    {

        [JsonProperty("thumb_media_id")]
        public string ThumbMediaId { get; set; }

        [JsonProperty("author")]
        public string Author { get; set; }

        [JsonProperty("title")]
        public string Title { get; set; }

        [JsonProperty("content_source_url")]
        public string ContentSourceUrl { get; set; }

        [JsonProperty("content")]
        public string Content { get; set; }

        [JsonProperty("digest")]
        public string Digest { get; set; }

        [JsonProperty("show_cover_pic")]
        public int ShowCoverPic { get; set; } = 0;

        [JsonProperty("need_open_comment")]
        public int NeedOpenComment { get; set; } = 0;

        [JsonProperty("only_fans_can_comment")]
        public int OnlyFansCanComment { get; set; } = 0;
    }

    public class WxUploadNewsParas
    {
        [JsonProperty("articles")]
        public WxUploadNewsArticle[] Articles { get; set; }
    }

    public class WxSendRes : WxRes
    {

        [JsonProperty("msg_id")]
        public string MsgId { get; set; }
    }

    public class WxRes
    {
        public bool HasError()
        {
            return ErrorCode != null && ErrorCode.Value != 0;
        }

        [JsonProperty("errcode")]
        public int? ErrorCode { get; set; }

        [JsonProperty("errmsg")]
        public string ErrorMessage { get; set; }
    }

    public class WxUploadImgRes : WxRes
    {
        [JsonProperty("url")]
        public string Url { get; set; }
    }

    public class WxUploadRes : WxRes
    {
        [JsonProperty("thumb_media_id")]
        public string ThumbMediaId { get; set; }

        [JsonProperty("media_id")]
        public string MediaId { get; set; }
    }

    public class WxUploadNewsRes : WxRes
    {
        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("media_id")]
        public string MediaId { get; set; }

        [JsonProperty("created_at")]
        public long CreatedAt { get; set; }
    }
}