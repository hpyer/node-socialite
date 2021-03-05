import { AxiosRequestConfig, AxiosResponse } from "axios";
import Config from "../Core/Config";
import User from "../Core/User";
import { ProviderConfig } from "../Types/global";
export default abstract class ProviderInterface {
    /**
     * 供应商标识
     */
    static NAME: string;
    protected _config: Config;
    protected _state: string;
    protected _redirectUrl: string;
    protected _parameters: object;
    protected _scopes: string[];
    protected _scopeSeparator: string;
    protected _httpOptions: AxiosRequestConfig;
    protected _expiresInKey: string;
    protected _accessTokenKey: string;
    protected _refreshTokenKey: string;
    constructor(config: ProviderConfig);
    /**
     * 返回生成的授权地址
     */
    protected abstract getAuthUrl(): string;
    /**
     * 返回获取token的接口地址
     */
    protected abstract getTokenUrl(): string;
    /**
     * 根据token获取用户信息
     * @param token tokenFromCode() 方法获取到的 token
     */
    protected abstract getUserByToken(token: string): Promise<object>;
    /**
     * 将用户信息映射为用户对象
     * @param data getUserByToken() 方法获取到的用户信息
     */
    protected abstract mapUserToObject(data: object): User;
    /**
     * 获取授权URL
     * @param redirectUrl 授权后的跳转地址
     */
    redirect(redirectUrl?: string): string;
    withRedirectUrl(redirectUrl: string): this;
    withState(state: string): this;
    scopes(scopes: string[] | string): this;
    withScopes(scopes: string[] | string): this;
    withScopeSeparator(scopeSeparator: string): this;
    with(parameters: object): this;
    getConfig(): Config;
    getClientId(): string;
    getClientSecret(): string;
    doRequest(options?: AxiosRequestConfig): Promise<AxiosResponse<any>>;
    setHttpOptions(options: AxiosRequestConfig): this;
    getHttpOptions(): AxiosRequestConfig;
    protected formatScopes(scopes: string[], scopeSeparator: string): string;
    protected getTokenFields(code: string): object;
    protected buildAuthUrlFromBase(url: string): string;
    protected getCodeFields(): object;
    /**
     * 根据授权后的code获取用户信息
     * @param code 授权后的code
     */
    userFromCode(code: string): Promise<User>;
    /**
     * 根据授权后的code获取token
     * @param code 授权后的code
     */
    tokenFromCode(code: string): Promise<object>;
    /**
     * 根据授权后的token获取用户信息
     * @param token 授权后的code
     */
    userFromToken(token: string): Promise<User>;
    /**
     * 判断是否 AxiosResponse
     * @param response
     */
    protected isAxiosResponse(response: any): response is AxiosResponse;
    /**
     * 格式化 AccessToken 对象，确保可以通过 access_token, refresh_token, expires_in 三个属性访问
     * @param response
     */
    protected normalizeAccessTokenResponse(response: AxiosResponse | object | string): object;
}
