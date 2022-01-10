import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
import { ProviderConfig } from "../Types/global";
/**
 * @see [网页授权登录](https://developer.work.weixin.qq.com/document/path/91335)
 */
export default class WeWork extends ProviderInterface {
    static NAME: string;
    protected _detailed: boolean;
    protected _agentId: number;
    protected _apiAccessToken: string;
    protected _baseUrl: string;
    constructor(config: ProviderConfig);
    getBaseUrl(): string;
    setAgentId(agentId: number): this;
    detailed(): this;
    withApiAccessToken(apiAccessToken: string): this;
    userFromCode(code: string): Promise<User>;
    protected getApiAccessToken(): Promise<string>;
    protected createApiAccessToken(): Promise<string>;
    protected getUser(token: string, code: string): Promise<object>;
    protected getUserById(userId: string): Promise<object>;
    protected getAuthUrl(): string;
    protected getTokenUrl(): string;
    protected getUserByToken(token: string): Promise<object>;
    protected mapUserToObject(user: object): User;
}
