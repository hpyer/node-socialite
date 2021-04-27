import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
import { WechatComponent, WechatComponentConfig } from "../Types/global";
export default class WeChat extends ProviderInterface {
    static NAME: string;
    protected _scopes: string[];
    protected _baseUrl: string;
    protected _withCountryCode: boolean;
    protected _component: WechatComponent;
    protected _openid: string;
    constructor(config: any);
    protected prepareForComponent(componentConfig: WechatComponentConfig): void;
    withOpenid(openid: string): this;
    withCountryCode(): this;
    withComponent(componentConfig: WechatComponentConfig): this;
    getComponent(): WechatComponent;
    tokenFromCode(code: string): Promise<object>;
    protected getTokenFromCode(code: string): Promise<import("axios").AxiosResponse<any>>;
    protected getTokenFields(code: string): object;
    protected getAuthUrl(): string;
    protected buildAuthUrlFromBase(url: string): string;
    protected getCodeFields(): object;
    protected getTokenUrl(): string;
    userFromCode(code: string): Promise<User>;
    protected getUserByToken(token: string): Promise<object>;
    protected mapUserToObject(user: object): User;
}
