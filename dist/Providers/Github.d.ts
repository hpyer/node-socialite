import { AxiosRequestHeaders } from "axios";
import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
/**
 * @see [授权 OAuth 应用程序](https://docs.github.com/cn/developers/apps/building-oauth-apps/authorizing-oauth-apps)
 */
export default class Github extends ProviderInterface {
    static NAME: string;
    protected _scopes: string[];
    protected getAuthUrl(): string;
    protected getTokenUrl(): string;
    protected getUserByToken(token: string): Promise<object>;
    protected mapUserToObject(user: object): User;
    protected createAuthorizationHeaders(token: string): AxiosRequestHeaders;
    protected getEmailByToken(token: string): Promise<string>;
}
