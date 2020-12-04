import { ConfigKeysInterface } from '../../domain/ServiceInterfaces/ConfigKeys'
import { LangKeysInterface } from '../../domain/ServiceInterfaces/ILangsService'
import IKeyValue from '../../infrac/Image/IKeyValue'

class LangKeysClass implements LangKeysInterface, IKeyValue, ConfigKeysInterface<string> {
  ADDITIONAL_STYLE = '附加样式目录';
  ALLOW_LIKES = '允许点赞';
  ALLOW_LOGIN = '允许登陆';
  ALLOW_PRINT = '允许打印';
  ARTICLE_PUBLISHERS = '发布模板';
  ARTICLE_SECTIONS = '文章段';
  ARTICLE_TAGS = '文章标签';
  DISPLAY_NAME = '显示名';
  EDITOR_TYPES = '编辑器类型';
  EDITORS_PATH = '编辑器路径';
  FRAMEWORKS_PATH = '框架路径';
  IMPORT_SUBJECTS_AUTOFIX = '导入目录时自动修复';
  KEYWORDS_QRERY_TEMPLAES = '关键字查询模板';
  LANGS_SERVER = '语言服务器';
  MAX_FAVORITES_PER_TYPE = '每种文章最大收藏数';
  MAX_PRINT_COUNT = '最大打印文章数';
  MAX_RECENT_FILE_SIZE = '临时文件大小限制';
  PLUGINS = '插件';
  RECOMMENT_COUNT = '推荐数量';
  RECOMMENT_TITLE = '推荐标题';
  ROOT_SUBJECT = '根目录';
  SHADOW_SECTION_PRIVATE = '保存隐藏段为私有';
  SUB_TYPE_TAG = '文章子类标签';
  VIEWER_PATH = '阅读器路径';
  VIEWER_TYPES = '阅读器类型';
  WEB_SITE_AVATAR = '站长头像';
  WEB_SITE_DESCRIPTION = '网站描述';
  WEB_SITE_FOOTER = '网站脚注';
  WEB_SITE_ICON = '网站图标';
  WEB_SITE_LOGO = '网站Logo';
  WEB_SITE_LOGO_TITLE = '网站标题Logo';
  WEB_SITE_NAME = '网站名';
  //
  STRING = '字符串';
  ENUM = '枚举';
  DATE = '日期';
  LINK = '链接';
  // Server Configs
  _WxAppId = '微信AppId';
  _WxAppSecret = '微信AppSecret';
  _WxPreviewUserId = '微信预览用户Id';
  _WxValidateToken = '微信接口配置Token';
  //
  [key: string]: string;
  About = '关于';
  AddedTime = '时间';
  AddToArticleList = '添加';
  AdmLogin = '管理员登陆';
  All = '全部';
  AlreadyLiked = '已经点过了';
  Anki = 'Anki';
  AuthorisedUser = 'VIP';
  BackgroundMusic = '背景音';
  BeyondMaxFavorites = '超出最大收藏';
  Cancle = '取消';
  CancleAutoLogin = '自动登录';
  CanclePublish = '取消发布';
  CancleRecommend = '取消推荐';
  CaptureWordDisable = '关闭取词';
  CaptureWordEnable = '开启取词';
  ChangeName = '修改名称';
  ChangePassword = '修改密码';
  ClearDict = '清空字典';
  ComfireJump = '点击确定继续:\t';
  Comment = '备注';
  Configs = '配置';
  ContentTemplate = '内容模板';
  ContentTemplateListPrefix = '列表前';
  ContentTemplateListSurfix = '列表后';
  ContentTemplateArticlePrefix = '文章前';
  ContentTemplateArticleSurfix='文章后';
  Countdown = '倒计时';
  Create = '创建';
  Csv = 'csv';
  DefaultValue = '默认值';
  Delete = '删除';
  DeleteAll = '全部删除';
  Description = '描述';
  Detail = '详情';
  Dict = '字典';
  Dislike = '踩';
  Download = '下载';
  Edit = '编辑';
  Editors = '编辑器';
  Email = '邮箱';
  EnableAutoLogin = '自动登陆';
  Enabled = '激活';
  EnumValue = '枚举值';
  Example = '原文';
  Explain = '释义';
  Export = '导出';
  ExportComplete = '导出完成、确定保存';
  Favorite = '收藏';
  FavoriteWords = '生词本';
  FreeDraw = '记号笔';
  History = '历史';
  Home = '首页';
  Import = '导入';
  ItemsCount = '总词条数:';
  Keyword = '关键字';
  Latest = '最近更新';
  LatestDay = '今天';
  LatestMonth = '本周';
  LatestWeek = '本月';
  Like = '赞';
  LocalFile = '本地文件';
  Login = '登陆';
  Logout = '注销';
  Manage = '管理';
  ManageDict = '管理字典';
  Menu = '目录';
  Modify = '修改';
  MSG_ERROR_ENTITY_CONFLICT = '数据冲突';
  MSG_ERROR_INVALID_ARGUMENTS = '客户端错误';
  MSG_ERROR_INVALID_FILE = '无效文件';
  MSG_ERROR_INVALID_OPERATION = '客户端错误';
  MSG_ERROR_INVALID_USER_OR_PWD = '用户名或密码错误';
  MSG_ERROR_NEED_LOGIN = '未登录';
  MSG_ERROR_NETWORK = '网络错误';
  MSG_ERROR_NO_PERMISSION = '没有权限';
  MSG_ERROR_NO_SUCH_ENTITY = '无此数据';
  MSG_ERROR_SITE_CONFIG = '配置错误';
  MSG_ERROR_USER_OR_PWD = '用户名或密码错误';
  Name = '名称';
  NewName = '新名称';
  NewPassword = '新密码';
  No = '否';
  NotFount = '未找到';
  Ok = '确定';
  Open = '打开';
  Order = '顺序';
  Paging = '分页(Beta)';
  Password = '密码';
  Preview = '预览';
  Publish = '发布';
  PUBLISH_NONE = '所有';
  PUBLISH_WX = '微信';
  PUBLISH_CONTENT = '静态';
  QrCode = '网址';
  Recommend = '推荐';
  Refresh = '刷新页面';
  RemoveFromArticleList = '移除';
  Rename = '重命名';
  Reset = '重置';
  Save = '保存';
  ScreenShot = '截图';
  Scroll = '滚动';
  Search = '搜索';
  Sections = '章节';
  Share = '分享';
  ShowMore = '更多...'
  Subject = '主题';
  Tags = '标签';
  Themes = '主题(Beta)';
  Time = '时间';
  Tools = '工具';
  Top = '回到顶部';
  Type = '类型';
  UnknownError = '失败了';
  Url = 'Url';
  User = '用户';
  UserName = '用户名';
  Value = '值';
  Viewers = '阅读器';
  Welcome = '感谢使用';
  Word = '单词';
  Yes = '是';
}

const Langs = new LangKeysClass()
export default Langs
