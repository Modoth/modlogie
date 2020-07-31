export class LangKeysInterface {
  AddToArticleList = 'AddToArticleList';
  AdmLogin = 'AdmLogin';
  All = 'All';
  AuthorisedUser = 'AuthorisedUser';
  Cancle = 'Cancle';
  ChangeName = 'ChangeName';
  ChangePassword = 'ChangePassword';
  Comment = 'Comment';
  Configs = 'Configs';
  Create = 'Create';
  DefaultValue = 'DefaultValue';
  Delete = 'Delete';
  Email = 'Email';
  Enabled = 'Enabled';
  EnumValue = 'EnumValue';
  Home = 'Home';
  Import = 'Import';
  Latest = 'Latest';
  Login = 'Login';
  Logout = 'Logout';
  Manage = 'Manage';
  Modify = 'Modify';
  MSG_ERROR_NETWORK = 'MSG_ERROR_NETWORK';
  MSG_ERROR_USER_OR_PWD = 'MSG_ERROR_USER_OR_PWD';
  MSG_ERROR_SITE_CONFIG = 'MSG_ERROR_SITE_CONFIG';
  Name = 'Name';
  NewName = 'NewName';
  NewPassword = 'NewPassword';
  Ok = 'Ok';
  Order = 'Order';
  Password = 'Password';
  RemoveFromArticleList = 'RemoveFromArticleList';
  Reset = 'Reset';
  Search = 'Search';
  Share = 'Share';
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
}
