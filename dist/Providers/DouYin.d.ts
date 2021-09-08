import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
/**
 * @see [WEB 授权说明](https://open.douyin.com/platform/doc/6852243568711583752)
 */
export default class DouYin extends ProviderInterface {
    static NAME: string;
    protected _baseUrl: string;
    protected _scopes: string[];
    protected _openId: string;
    protected withOpenId(openId: string): this;
    protected getAuthUrl(): string;
    protected getCodeFields(): object;
    protected getTokenUrl(): string;
    protected getTokenFields(code: string): object;
    tokenFromCode(code: string): Promise<object>;
    protected getUserByToken(token: string): Promise<object>;
    protected mapUserToObject(user: object): User;
}
