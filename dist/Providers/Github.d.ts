import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
export default class Github extends ProviderInterface {
    static NAME: string;
    protected _scopes: string[];
    protected getAuthUrl(): string;
    protected getTokenUrl(): string;
    protected getUserByToken(token: string): Promise<object>;
    protected mapUserToObject(user: object): User;
    protected createAuthorizationHeaders(token: string): object;
    protected getEmailByToken(token: string): Promise<string>;
}
