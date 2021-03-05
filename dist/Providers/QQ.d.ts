import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
export default class QQ extends ProviderInterface {
    static NAME: string;
    protected _baseUrl: string;
    protected _scopes: string[];
    protected _withUnionId: boolean;
    protected withUnionId(): this;
    protected getAuthUrl(): string;
    protected getTokenUrl(): string;
    protected getTokenFields(code: string): object;
    tokenFromCode(code: string): Promise<object>;
    protected getUserByToken(token: string): Promise<object>;
    protected mapUserToObject(user: object): User;
}
