export class LangKeysInterface {
  AddToArticleList = 'AddToArticleList';
  AdmLogin = 'AdmLogin';
  All = 'All';
  AlreadyLiked = 'AlreadyLiked';
  AuthorisedUser = 'AuthorisedUser';
  BeyondMaxFavorites = 'BeyondMaxFavorites';
  Cancle = 'Cancle';
  CancleAutoLogin = 'CancleAutoLogin';
  CancleRecommend = 'CancleRecommend';
  CaptureWord = 'CaptureWord';
  NotFount = 'NotFount';
  ChangeName = 'ChangeName';
  ChangePassword = 'ChangePassword';
  ComfireJump = 'ComfireJump';
  Comment = 'Comment';
  Configs = 'Configs';
  Create = 'Create';
  DefaultValue = 'DefaultValue';
  Delete = 'Delete';
  Description = 'Description';
  Detail = 'Detail';
  Dislike = 'Dislike';
  Edit = 'Edit';
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
  Modify = 'Modify';
  MSG_ERROR_NETWORK = 'MSG_ERROR_NETWORK';
  MSG_ERROR_INVALID_FILE = 'MSG_ERROR_INVALID_FILE';
  MSG_ERROR_SITE_CONFIG = 'MSG_ERROR_SITE_CONFIG';
  MSG_ERROR_USER_OR_PWD = 'MSG_ERROR_USER_OR_PWD';
  Name = 'Name';
  NewName = 'NewName';
  NewPassword = 'NewPassword';
  Ok = 'Ok';
  Order = 'Order';
  Paging = 'Paging';
  Password = 'Password';
  Preview = 'Preview';
  Recommend = 'Recommend';
  RemoveFromArticleList = 'RemoveFromArticleList';
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
  Type = 'Type';
  UnknownError = 'UnknownError';
  Url = 'Url';
  User = 'User';
  UserName = 'UserName';
  Value = 'Value';
  Welcome = 'Welcome';
}

export const LangKeys = new LangKeysInterface();

export default class ILangsService {
  public async load(...langs: { [key: string]: string }[]) {
    throw new Error()
  }

  public get(name: string): string {
    throw new Error()
  }

  public getConfig(name: string): string {
    throw new Error()
  }
}
