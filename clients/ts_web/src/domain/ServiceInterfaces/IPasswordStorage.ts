export default class IPasswordStorage {
    autoLogin: boolean;
    name: string | null;
    password: string | null;
    clear (): void {
      throw new Error('Method not implemented.')
    }
}
