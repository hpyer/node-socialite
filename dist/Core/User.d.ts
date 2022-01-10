/**
 * OAuth授权后的用户对象
 */
export default class User {
    /**
     * 供应商标识
     */
    provider: string;
    /**
     * openid
     */
    id: string;
    /**
     * 昵称
     */
    nickname: string;
    /**
     * 昵称
     */
    name: string;
    /**
     * 头像
     */
    avatar: string;
    /**
     * E-mail
     */
    email: string;
    /**
     * 原始数据
     */
    raw: object;
    /**
     * AccessToken
     */
    access_token: string;
    /**
     * RefreshToken
     */
    refresh_token: string;
    /**
     * ExpiresIn
     */
    expires_in: number;
    constructor(data: Partial<Record<keyof User, any>>);
    /**
     * 获取 openid
     */
    getId(): string;
    /**
     * 获取昵称
     */
    getNickname(): string;
    /**
     * 获取姓名
     */
    getName(): string;
    /**
     * 获取头像
     */
    getAvatar(): string;
    /**
     * 获取E-mail
     */
    getEmail(): string;
    /**
     * 获取原始数据
     */
    getRaw(): object;
    /**
     * 设置原始数据
     */
    setRaw(raw: object): this;
    /**
     * 获取AccessToken
     */
    getAccessToken(): string;
    /**
     * 设置AccessToken
     */
    setAccessToken(token: string): this;
    /**
     * 获取RefreshToken
     */
    getRefreshToken(): string;
    /**
     * 设置RefreshToken
     */
    setRefreshToken(refresh_token: string): this;
    /**
     * 获取ExpiresIn
     */
    getExpiresIn(): number;
    /**
     * 设置ExpiresIn
     */
    setExpiresIn(expires_in: number): this;
    /**
     * 设置Provider
     */
    setProvider(provider: string): this;
    /**
     * 获取Provider
     */
    getProvider(): string;
    merge(attrs: Partial<Record<keyof User, any>>): this;
}
