import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
/**
 * @see [授权机制说明](https://open.weibo.com/wiki/%E6%8E%88%E6%9D%83%E6%9C%BA%E5%88%B6%E8%AF%B4%E6%98%8E)
 */
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
