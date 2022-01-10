import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
import { ProviderConfig } from "../Types/global";
/**
 * @see [网页授权登录](https://developer.work.weixin.qq.com/document/path/91119)
 */
export default class OpenWeWork extends ProviderInterface {
    static NAME: string;
    protected _detailed: boolean;
    protected _suiteTicket: string;
    protected _agentId: number;
    protected _suiteAccessToken: string;
    protected _baseUrl: string;
    constructor(config: ProviderConfig);
    getBaseUrl(): string;
    setAgentId(agentId: number): this;
    detailed(): this;
    withSuiteTicket(suiteTicket: string): this;
    withSuiteAccessToken(suiteAccessToken: string): this;
    userFromCode(code: string): Promise<User>;
    protected getSuiteAccessToken(): Promise<string>;
    protected createSuiteAccessToken(): Promise<string>;
    protected getUser(token: string, code: string): Promise<object>;
    protected getUserByTicket(userTicket: string): Promise<object>;
    getAuthUrl(): string;
    protected getTokenUrl(): string;
    protected getUserByToken(token: string): Promise<object>;
    protected mapUserToObject(user: object): User;
}
