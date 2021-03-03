import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
export default class WeChat extends ProviderInterface {
    static NAME: string;
    protected _scopes: string[];
    protected _baseUrl: string;
    protected _withCountryCode: boolean;
    protected _component: object;
    protected _openid: string;
    constructor(config: any);
    protected prepareForComponent(): void;
    protected withOpenid(openid: string): this;
    protected withCountryCode(): this;
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
