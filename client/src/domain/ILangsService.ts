export class LangKeysInterface {
  AddToArticleList = 'AddToArticleList';
  AdmLogin = 'AdmLogin';
  All = 'All';
  Cancle = 'Cancle';
  Configs = 'Configs';
  Create = 'Create';
  DefaultValue = 'DefaultValue';
  Delete = 'Delete';
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
  Name = 'Name';
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
