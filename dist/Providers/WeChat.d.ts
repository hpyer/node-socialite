import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
import { WechatComponent, WechatComponentConfig } from "../Types/global";
/**
 * @see [公众号 - 网页授权](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)
 * @see [开放平台 - 网站应用微信登录开发指南](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1419316505&token=&lang=zh_CN)
 */
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
    protected getTokenFromCode(code: string): Promise<import("axios").AxiosResponse<any, any>>;
    protected getTokenFields(code: string): object;
    protected getAuthUrl(): string;
    protected buildAuthUrlFromBase(url: string): string;
    protected getCodeFields(): object;
    protected getTokenUrl(): string;
    userFromCode(code: string): Promise<User>;
    protected getUserByToken(token: string): Promise<object>;
    protected mapUserToObject(user: object): User;
}
