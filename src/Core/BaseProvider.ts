'use strict';

import '../../types/global.d.ts';
import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Config } from "./Config";
import { User } from "./User";
import { buildQueryString, merge } from "./Utils";

export abstract class BaseProvider implements ProviderInterface
{
  /**
   * 供应商标识
   */
  public static NAME: string = '';

  protected _config: Config = null;
  protected _state: string = '';
  protected _redirectUrl: string = '';
  protected _parameters: Record<string, any> = {};
  protected _scopes: string[] = [];
  protected _scopeSeparator: string = ',';
  protected _httpOptions: AxiosRequestConfig = {};
  protected _expiresInKey: string = 'expires_in';
  protected _accessTokenKey: string = 'access_token';
  protected _refreshTokenKey: string = 'refresh_token';

  constructor(config: ProviderConfig)
  {
    this._config = new Config(config);
    this._scopes = config['scopes'] || this._scopes || [];

    if (!this._config.has('client_id')) {
      let id = this._config.get('app_id');
      if (id != null) {
        this._config.set('client_id', id);
      }
    }

    if (!this._config.has('client_secret')) {
      let secret = this._config.get('app_secret');
      if (secret != null) {
        this._config.set('client_secret', secret);
      }
    }

    if (!this._config.has('redirect_url')) {
      this._config.set('redirect_url', this._config.get('redirect'));
    }
    this._redirectUrl = this._config.get('redirect_url');
  }

  /**
   * 返回生成的授权地址
   */
  abstract getAuthUrl(): string;

  /**
   * 返回获取token的接口地址
   */
  abstract getTokenUrl(): string;

  /**
   * 根据token获取用户信息
   * @param token tokenFromCode() 方法获取到的 token
   */
  abstract getUserByToken(token: string): Promise<Record<string, any>>;

  /**
   * 将用户信息映射为用户对象
   * @param data getUserByToken() 方法获取到的用户信息
   */
  abstract mapUserToObject(data: Record<string, any>): User;

  /**
   * 获取授权URL
   * @param redirectUrl 授权后的跳转地址
   */
  redirect(redirectUrl: string = null): string
  {
    if (redirectUrl) {
      this.withRedirectUrl(redirectUrl);
    }

    return this.getAuthUrl();
  }

  withRedirectUrl(redirectUrl: string): this
  {
    this._redirectUrl = redirectUrl;
    return this;
  }

  withState(state: string): this
  {
    this._state = state;
    return this;
  }

  scopes(scopes: string[] | string): this
  {
    if (typeof scopes == 'object' && scopes.length != undefined) {
      this._scopes = scopes;
    }
    else {
      this._scopes = ['' + scopes];
    }
    return this;
  }

  withScopes(scopes: string[] | string): this
  {
    return this.scopes(scopes);
  }

  withScopeSeparator(scopeSeparator: string): this
  {
    this._scopeSeparator = scopeSeparator;
    return this;
  }

  with(parameters: Record<string, any>): this
  {
    this._parameters = parameters;
    return this;
  }

  getConfig(): Config
  {
    return this._config;
  }

  getClientId(): string
  {
    return this._config.get('client_id');
  }

  getClientSecret(): string
  {
    return this._config.get('client_secret');
  }

  doRequest(options: AxiosRequestConfig = {}): Promise<AxiosResponse<any>>
  {
    let opts = merge(merge({}, this._httpOptions), options) as AxiosRequestConfig;
    return Axios.request(opts).then().catch(e => {
      return e.response;
    });
  }

  setHttpOptions(options: AxiosRequestConfig): this
  {
    this._httpOptions = options;
    return this;
  }

  getHttpOptions(): AxiosRequestConfig
  {
    return this._httpOptions;
  }

  protected formatScopes(scopes: string[], scopeSeparator: string): string
  {
    return scopes.join(scopeSeparator);
  }

  protected getTokenFields(code: string): Record<string, any>
  {
    return {
      client_id: this.getClientId(),
      client_secret: this.getClientSecret(),
      code,
      redirect_uri: this._redirectUrl,
    };
  }

  protected buildAuthUrlFromBase(url: string): string
  {
    let query = this.getCodeFields();
    return url + '?' + buildQueryString(query);
  }

  protected getCodeFields(): Record<string, any>
  {
    let fields = merge({
      client_id: this.getClientId(),
      redirect_uri: this._redirectUrl,
      scope: this.formatScopes(this._scopes, this._scopeSeparator),
      response_type: 'code',
    }, this._parameters);
    if (this._state) {
      fields['state'] = this._state;
    }
    return fields;
  }

  /**
   * 根据授权后的code获取用户信息
   * @param code 授权后的code
   */
  async userFromCode(code: string): Promise<User>
  {
    let tokenResponse = await this.tokenFromCode(code);
    let user = await this.userFromToken(tokenResponse[this._accessTokenKey]);
    return user
      .setRefreshToken(tokenResponse[this._refreshTokenKey])
      .setExpiresIn(tokenResponse[this._expiresInKey])
  }

  /**
   * 根据授权后的code获取token
   * @param code 授权后的code
   */
  async tokenFromCode(code: string): Promise<Record<string, any>>
  {
    let response = await this.doRequest({
      url: this.getTokenUrl(),
      method: 'post',
      data: this.getTokenFields(code),
      responseType: 'json',
      headers: {
        'Accept': 'application/json',
      },
    });

    return this.normalizeAccessTokenResponse(response);
  }

  /**
   * 根据授权后的token获取用户信息
   * @param token 授权后的code
   */
  async userFromToken(token: string): Promise<User>
  {
    let user = await this.getUserByToken(token);

    return this.mapUserToObject(user)
      .setProvider((this.constructor as typeof BaseProvider).NAME)
      .setRaw(user)
      .setAccessToken(token);
  }

  /**
   * 判断是否 AxiosResponse
   * @param response
   */
  protected isAxiosResponse(response: any): response is AxiosResponse {
    return typeof (response as AxiosResponse).status != 'undefined'
      && typeof (response as AxiosResponse).data != 'undefined'
      && typeof (response as AxiosResponse).headers != 'undefined'
  }

  /**
   * 格式化 AccessToken 对象，确保可以通过 access_token, refresh_token, expires_in 三个属性访问
   * @param response
   */
  protected normalizeAccessTokenResponse(response: AxiosResponse | Record<string, any> | string): Record<string, any>
  {
    let data: Record<string, any> = null;

    if (this.isAxiosResponse(response)) {
      if (response.status != 200) {
        throw new Error('Remote server responsed with wrong code: ' + response.status);
      }
      data = response.data;
    }
    else if (typeof response == 'string') {
      try {
        data = JSON.parse(response);
      }
      catch (e) {}
    }
    else if (typeof response == 'object') {
      data = response;
    }

    if (!data || !data[this._accessTokenKey]) {
      throw new Error('Authorize Failed: ' + JSON.stringify(data));
    }

    return merge(data, {
      access_token: data[this._accessTokenKey],
      refresh_token: data[this._refreshTokenKey] || null,
      expires_in: parseInt(data[this._expiresInKey] || 0),
    });
  }

}
