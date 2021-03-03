import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
export default class WeWork extends ProviderInterface {
    static NAME: string;
    protected _detailed: boolean;
    protected _agentId: number;
    protected _apiAccessToken: string;
    setAgentId(agentId: number): this;
    detailed(): this;
    withApiAccessToken(apiAccessToken: string): this;
    userFromCode(code: string): Promise<User>;
    protected getApiAccessToken(): Promise<string>;
    protected createApiAccessToken(): Promise<string>;
    protected getUserId(token: string, code: string): Promise<object>;
    protected getUserById(userId: string): Promise<object>;
    protected getAuthUrl(): string;
    protected getOAuthUrl(): string;
    protected getQrConnectUrl(): string;
    protected getTokenUrl(): string;
    protected getUserByToken(token: string): Promise<object>;
    protected mapUserToObject(user: object): User;
}
