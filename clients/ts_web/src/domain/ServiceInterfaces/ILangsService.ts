export class LangKeysInterface {
  About = 'About';
  AddToArticleList = 'AddToArticleList';
  AdmLogin = 'AdmLogin';
  All = 'All';
  AlreadyLiked = 'AlreadyLiked';
  AuthorisedUser = 'AuthorisedUser';
  BeyondMaxFavorites = 'BeyondMaxFavorites';
  Cancle = 'Cancle';
  CancleAutoLogin = 'CancleAutoLogin';
  CancleRecommend = 'CancleRecommend';
  CaptureWordDisable = 'CaptureWordDisable';
  CaptureWordEnable = 'CaptureWordEnable';
  ChangeName = 'ChangeName';
  ChangePassword = 'ChangePassword';
  ClearDict = 'ClearDict';
  ComfireJump = 'ComfireJump';
  Comment = 'Comment';
  Configs = 'Configs';
  Create = 'Create';
  DefaultValue = 'DefaultValue';
  Delete = 'Delete';
  Description = 'Description';
  Detail = 'Detail';
  Dict = 'Dict';
  Dislike = 'Dislike';
  Download = 'Download';
  Edit = 'Edit';
  Editors = 'Editors';
  Email = 'Email';
  EnableAutoLogin = 'EnableAutoLogin';
  Enabled = 'Enabled';
  EnumValue = 'EnumValue';
  Favorite = 'Favorite';
  FreeDraw = 'FreeDraw';
  Home = 'Home';
  Import = 'Import';
  Keyword = 'Keyword';
  Latest = 'Latest';
  Like = 'Like';
  Login = 'Login';
  Logout = 'Logout';
  Manage = 'Manage';
  Menu = 'Menu';
  Modify = 'Modify';
  MSG_ERROR_ENTITY_CONFLICT = 'MSG_ERROR_ENTITY_CONFLICT';
  MSG_ERROR_INVALID_ARGUMENTS = 'MSG_ERROR_INVALID_ARGUMENTS';
  MSG_ERROR_INVALID_FILE = 'MSG_ERROR_INVALID_FILE';
  MSG_ERROR_INVALID_OPERATION = 'MSG_ERROR_INVALID_OPERATION';
  MSG_ERROR_INVALID_USER_OR_PWD = 'MSG_ERROR_INVALID_USER_OR_PWD';
  MSG_ERROR_NEED_LOGIN = 'MSG_ERROR_NEED_LOGIN';
  MSG_ERROR_NETWORK = 'MSG_ERROR_NETWORK';
  MSG_ERROR_NO_PERMISSION = 'MSG_ERROR_NO_PERMISSION';
  MSG_ERROR_NO_SUCH_ENTITY = 'MSG_ERROR_NO_SUCH_ENTITY';
  MSG_ERROR_SITE_CONFIG = 'MSG_ERROR_SITE_CONFIG';
  MSG_ERROR_USER_OR_PWD = 'MSG_ERROR_USER_OR_PWD';
  Name = 'Name';
  NewName = 'NewName';
  NewPassword = 'NewPassword';
  NotFount = 'NotFount';
  Ok = 'Ok';
  Open = 'Open';
  Order = 'Order';
  Paging = 'Paging';
  Password = 'Password';
  Preview = 'Preview';
  QrCode = 'QrCode';
  Recommend = 'Recommend';
  RemoveFromArticleList = 'RemoveFromArticleList';
  Rename = 'Rename';
  Reset = 'Reset';
  ScreenShot = 'ScreenShot';
  Scroll = 'Scroll';
  Search = 'Search';
  Sections = 'Sections';
  Share = 'Share';
  ShowMore = 'ShowMore';
  Subject = 'Subject';
  Tags = 'Tags';
  Themes = 'Themes';
  Tools = 'Tools';
  Type = 'Type';
  UnknownError = 'UnknownError';
  Url = 'Url';
  User = 'User';
  UserName = 'UserName';
  Value = 'Value';
  Viewers = 'Viewers';
  Welcome = 'Welcome';
}

export enum ErrorMessage {
  MSG_ERROR_NONE = 0,
  MSG_ERROR_NEED_LOGIN = 1,
  MSG_ERROR_NO_PERMISSION = 2,
  MSG_ERROR_INVALID_USER_OR_PWD = 3,
  MSG_ERROR_NO_SUCH_ENTITY = 4,
  MSG_ERROR_ENTITY_CONFLICT = 5,
  MSG_ERROR_INVALID_ARGUMENTS = 6,
  MSG_ERROR_INVALID_OPERATION = 7,
}

export const LangKeys = new LangKeysInterface()

export default class ILangsService {
  async load (...langs: { [key: string]: string }[]) {
    throw new Error()
  }

  get (name: string): string {
    throw new Error()
  }

  getConfig (name: string): string {
    throw new Error()
  }
}
