'use strict';

/**
 * OAuth授权后的用户对象
 */
export default class User
{
  /**
   * 供应商标识
   */
  provider: string = '';
  /**
   * openid
   */
  id: string = '';
  /**
   * 昵称
   */
  nickname: string = '';
  /**
   * 昵称
   */
  name: string = '';
  /**
   * 头像
   */
  avatar: string = '';
  /**
   * E-mail
   */
  email: string = '';
  /**
   * 原始数据
   */
  raw: object = null;
  /**
   * AccessToken
   */
  access_token: string = null;
  /**
   * RefreshToken
   */
  refresh_token: string = null;
  /**
   * ExpiresIn
   */
  expires_in: number = null;

  constructor(data: Partial<Record<string, any>>)
  {
    this.merge(data);
  }

  /**
   * 获取 openid
   */
  getId(): string
  {
    return this.id || this.getEmail();
  }

  /**
   * 获取昵称
   */
  getNickname(): string
  {
    return this.nickname || this.getName();
  }

  /**
   * 获取姓名
   */
  getName(): string
  {
    return this.name;
  }

  /**
   * 获取头像
   */
  getAvatar(): string
  {
    return this.avatar;
  }

  /**
   * 获取E-mail
   */
  getEmail(): string
  {
    return this.email;
  }

  /**
   * 获取原始数据
   */
  getRaw(): object
  {
    return this.raw;
  }

  /**
   * 设置原始数据
   */
  setRaw(raw: object): this
  {
    this.raw = raw;
    return this;
  }

  /**
   * 获取AccessToken
   */
  getAccessToken(): string
  {
    return this.access_token;
  }

  /**
   * 设置AccessToken
   */
  setAccessToken(token: string): this
  {
    this.access_token = token;
    return this;
  }

  /**
   * 获取RefreshToken
   */
  getRefreshToken(): string
  {
    return this.refresh_token;
  }

  /**
   * 设置RefreshToken
   */
  setRefreshToken(refresh_token: string): this
  {
    this.refresh_token = refresh_token;
    return this;
  }

  /**
   * 获取ExpiresIn
   */
  getExpiresIn(): number
  {
    return this.expires_in;
  }

  /**
   * 设置ExpiresIn
   */
  setExpiresIn(expires_in: number): this
  {
    this.expires_in = expires_in;
    return this;
  }

  /**
   * 设置Provider
   */
  setProvider(provider: string): this
  {
    this.provider = provider;
    return this;
  }

  /**
   * 获取Provider
   */
  getProvider(): string
  {
    return this.provider;
  }

  merge(attrs: Partial<Record<string, any>>): this
  {
    for (let k in attrs) {
      this[k] = attrs[k];
    }
    return this;
  }

};
