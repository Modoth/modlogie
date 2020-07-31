export class User {
    constructor(public id: string, public email: string, public enabled: boolean, public authorised: boolean, public authorisedExpired: Date, public comment: string) { }
}

export default class IUsersService {

    all(filter?: string, skip?: number, take?: number): Promise<[number, User[]]> {
        throw new Error("Method not implemented.")
    }

    add(name: string, email: string, password: string): Promise<User> {
        throw new Error("Method not implemented.")
    }

    delete(name: string): Promise<void> {
        throw new Error("Method not implemented.")
    }

    updateStatue(name: string, enable: boolean): Promise<void> {
        throw new Error("Method not implemented.")
    }

    updateType(name: string, authorised: boolean): Promise<void> {
        throw new Error("Method not implemented.")
    }

    updateComment(name: string, comment: string): Promise<void> {
        throw new Error("Method not implemented.")
    }

    updateAuthorisionExpired(name: string, expired: Date): Promise<void> {
        throw new Error("Method not implemented.")
    }
}