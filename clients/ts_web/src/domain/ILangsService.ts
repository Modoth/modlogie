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
  ChangeName = 'ChangeName';
  ChangePassword = 'ChangePassword';
  ComfireJump = 'ComfireJump';
  Comment = 'Comment';
  Configs = 'Configs';
  Create = 'Create';
  DefaultValue = 'DefaultValue';
  Delete = 'Delete';
  Detail = '详情';
  Dislike = 'Dislike';
  Edit = 'Edit';
  Email = 'Email';
  EnableAutoLogin = 'EnableAutoLogin';
  Enabled = 'Enabled';
  EnumValue = 'EnumValue';
  Favorite = 'Favorite';
  Home = 'Home';
  Import = 'Import';
  Latest = 'Latest';
  Like = 'Like';
  Login = 'Login';
  Logout = 'Logout';
  Manage = 'Manage';
  Modify = 'Modify';
  MSG_ERROR_NETWORK = 'MSG_ERROR_NETWORK';
  MSG_ERROR_SITE_CONFIG = 'MSG_ERROR_SITE_CONFIG';
  MSG_ERROR_USER_OR_PWD = 'MSG_ERROR_USER_OR_PWD';
  Name = 'Name';
  NewName = 'NewName';
  NewPassword = 'NewPassword';
  Ok = 'Ok';
  Order = 'Order';
  Password = 'Password';
  Recommend = 'Recommend';
  RemoveFromArticleList = 'RemoveFromArticleList';
  Reset = 'Reset';
  ScreenShot = 'ScreenShot';
  Search = 'Search';
  Sections = 'Sections';
  Share = 'Share';
  ShowMore = 'ShowMore';
  Subject = 'Subject';
  Tags = 'Tags';
  Type = 'Type';
  UnknownError = 'UnknownError';
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
