export class LangKeysInterface {
  AddToArticleList = 'AddToArticleList';
  Configs = 'Configs';
  Create = 'Create';
  DefaultValue = 'DefaultValue';
  Home = 'Home';
  Latest = 'Latest';
  Login = 'Login';
  Logout = 'Logout';
  Manage = 'Manage';
  Modify = 'Modify';
  MSG_ERROR_NETWORK = 'MSG_ERROR_NETWORK';
  MSG_ERROR_USER_OR_PWD = 'MSG_ERROR_USER_OR_PWD';
  Password = 'Password';
  RemoveFromArticleList = 'RemoveFromArticleList';
  Reset = 'Reset';
  Subject = 'Subject';
  Tags = 'Tags';
  UserName = 'UserName';
  Value = 'Value';
  EnumValue = 'EnumValue';
  Delete = 'Delete';
  Type = 'Type';
  Name = 'Name';
  Cancle = 'Cancle';
  Ok = 'Ok';
  Import = 'Import';
  Welcome = 'Welcome';
  AdmLogin = 'AdmLogin';
  Order = 'Order';
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
