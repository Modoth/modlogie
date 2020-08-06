import { LangKeysInterface } from "../domain/ILangsService";
import { Error as ErrorMessage } from "../apis/messages_pb";
import { ConfigKeysInterface } from "../app/ConfigKeys";

interface IKeyValue {
  [key: string]: string;
}

class LangKeysClass implements LangKeysInterface, IKeyValue, ConfigKeysInterface<string> {
  constructor() {
    this[ErrorMessage.ENTITY_CONFLICT] = "数据冲突";
    this[ErrorMessage.INVALID_ARGUMENTS] = "客户端错误";
    this[ErrorMessage.INVALID_USER_OR_PWD] = "用户名或密码错误";
    this[ErrorMessage.NEED_LOGIN] = "未登录";
    this[ErrorMessage.NO_PERMISSION] = "没有权限";
    this[ErrorMessage.NO_SUCH_ENTITY] = "无此数据";
  }
  ALLOW_LOGIN = '允许登陆';
  ALLOW_LIKES = '允许点赞';
  ALLOW_PRINT = '允许打印';
  ARTICLE_SECTIONS = '文章段';
  ARTICLE_TAGS = '文章标签';
  IMPORT_SUBJECTS_AUTOFIX = '导入目录时自动修复';
  MAX_PRINT_COUNT = '最大打印文章数';
  MAX_FAVORITES_PER_TYPE = "每种文章最大收藏数";
  PLUGINS = '插件';
  SHADOW_SECTION_PRIVATE = '保存隐藏段为私有';
  SUB_TYPE_TAG = '文章子类标签';
  WEB_SITE_AVATAR = '站长头像';
  WEB_SITE_DESCRIPTION = '网站描述';
  WEB_SITE_FOOTER = '网站脚注';
  WEB_SITE_LOGO = '网站Logo';
  WEB_SITE_LOGO_TITLE = '网站标题Logo';
  WEB_SITE_NAME = '网站名';
  //
  STRING = '字符串';
  ENUM = '枚举';
  [key: string]: string;
  AddToArticleList = '添加';
  AdmLogin = '管理员登陆';
  AlreadyLiked = '已经点过了';
  All = '全部';
  AuthorisedUser = 'VIP';
  BeyondMaxFavorites = '超出最大收藏';
  Cancle = '取消';
  CancleAutoLogin = '自动登录';
  ChangeName = '修改名称';
  ChangePassword = '修改密码';
  Comment = '备注';
  Configs = '配置';
  Create = '创建';
  DefaultValue = '默认值';
  Delete = '删除';
  Detail = '详情';
  Dislike = '踩';
  Edit = '编辑';
  Email = '邮箱';
  EnableAutoLogin = '自动登陆';
  Enabled = '激活';
  EnumValue = '枚举值';
  Favorite = '收藏';
  Home = '首页';
  Import = '导入';
  Latest = '最近更新';
  Like = '赞';
  Login = '登陆';
  Logout = "注销";
  Manage = '管理';
  Modify = '修改';
  MSG_ERROR_NETWORK = '网络错误';
  MSG_ERROR_SITE_CONFIG = '配置错误';
  MSG_ERROR_USER_OR_PWD = '用户名或密码错误';
  Name = '名称';
  NewName = '新名称';
  NewPassword = '新密码';
  Ok = '确定';
  Order = '顺序';
  Password = '密码';
  RemoveFromArticleList = '移除';
  Reset = '重置';
  Search = '搜索';
  Share = '分享';
  Subject = '主题';
  Tags = '标签';
  Type = '类型';
  UnknownError = '失败了';
  User = '用户';
  UserName = '用户名';
  Value = '值';
  Welcome = '感谢使用';
}

const Langs = new LangKeysClass();
export default Langs 