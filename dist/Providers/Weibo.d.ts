import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
export default class Weibo extends ProviderInterface {
    static NAME: string;
    protected _baseUrl: string;
    protected _scopes: string[];
    protected getAuthUrl(): string;
    protected getTokenUrl(): string;
    protected getTokenFields(code: string): object;
    protected getUserByToken(token: string): Promise<object>;
    protected getTokenPayload(token: string): Promise<string>;
    protected mapUserToObject(user: object): User;
}
