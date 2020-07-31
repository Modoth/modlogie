import { LangKeysInterface } from "../domain/ILangsService";
import { Error as ErrorMessage } from "../apis/messages_pb";

interface IKeyValue {
  [key: string]: string;
}

class LangKeysClass implements LangKeysInterface, IKeyValue {
  constructor() {
    this[ErrorMessage.INVALID_USER_OR_PWD] = "用户名或密码错误";
    this[ErrorMessage.INVALID_ARGUMENTS] = "客户端错误";
    this[ErrorMessage.NO_SUCH_ENTITY] = "无此数据";
    this[ErrorMessage.ENTITY_CONFLICT] = "数据冲突";
  }
  STRING = '字符串';
  ENUM = '枚举';
  [key: string]: string;
  AddToArticleList = '添加';
  AdmLogin = '管理员登陆';
  All = '全部';
  AuthorisedUser = 'VIP';
  Cancle = '取消';
  ChangeName = '修改名称';
  ChangePassword = '修改密码';
  Comment = '备注';
  Configs = '配置';
  Create = '创建';
  DefaultValue = '默认值';
  Delete = '删除';
  Email = '邮箱';
  Enabled = '激活';
  EnumValue = '枚举值';
  Home = '首页';
  Import = '导入';
  Latest = '最近更新';
  Login = '登陆';
  Logout = "注销";
  Manage = '管理';
  Modify = '修改';
  MSG_ERROR_NETWORK = '网络错误';
  MSG_ERROR_USER_OR_PWD = '用户名或密码错误';
  MSG_ERROR_SITE_CONFIG = '配置错误';
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