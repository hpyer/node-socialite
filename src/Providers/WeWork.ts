'use strict';

import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
import { buildQueryString } from "../Core/Utils";
import { ProviderConfig } from "../Types/global";

/**
 * @see [网页授权登录](https://developer.work.weixin.qq.com/document/path/91335)
 */
export default class WeWork extends ProviderInterface
{
  public static NAME: string = 'wework';
  protected _detailed: boolean = false;
  protected _agentId: number = null;
  protected _apiAccessToken: string = '';
  protected _baseUrl: string = 'https://qyapi.weixin.qq.com';

  constructor(config: ProviderConfig)
  {
    super(config);

    if (!this._config.has('base_url')) {
      this._baseUrl = this._config.get('base_url');
    }
  }

  getBaseUrl()
  {
    return this._baseUrl;
  }

  setAgentId(agentId: number): this
  {
    this._agentId = agentId;
    return this;
  }

  detailed(): this
  {
    this._detailed = true;
    return this;
  }

  withApiAccessToken(apiAccessToken: string): this
  {
    this._apiAccessToken = apiAccessToken;
    return this;
  }

  async userFromCode(code: string): Promise<User>
  {
    let token = await this.getApiAccessToken();
    let user = await this.getUser(token, code);
    if (this._detailed) {
      user = await this.getUserById(user['UserId']);
    }
    return this.mapUserToObject(user)
      .setProvider(WeWork.NAME)
      .setRaw(user);
  }

  protected async getApiAccessToken(): Promise<string>
  {
    if (!this._apiAccessToken) {
      this._apiAccessToken = await this.createApiAccessToken();
    }
    return this._apiAccessToken;
  }

  protected async createApiAccessToken(): Promise<string>
  {
    let response = await this.doRequest({
      url: this._baseUrl + '/cgi-bin/gettoken',
      method: 'get',
      params: {
        corpid: this._config.get('corp_id') || this._config.get('corpid'),
        corpsecret: this._config.get('corp_secret') || this._config.get('corpsecret'),
      }
    });
    let data = response.data;
    if (!data || data['errcode']) {
      throw new Error(`Failed to get api access_token: ${data['errmsg'] || 'Unknown'}`)
    }
    return data['access_token'];
  }

  protected async getUser(token: string, code: string): Promise<object>
  {
    let response = await this.doRequest({
      url: this._baseUrl + '/cgi-bin/user/getuserinfo',
      method: 'get',
      params: {
        access_token: token,
        code,
      }
    });
    let data = response.data;
    if (!data || data['errcode'] || (!data['UserId'] && !data['OpenId'])) {
      throw new Error(`Failed to get user openid: ${data['errmsg'] || 'Unknown'}`)
    }
    else if (!data['UserId']) {
      this._detailed = false;
    }
    return data;
  }

  protected async getUserById(userId: string): Promise<object>
  {
    let response = await this.doRequest({
      url: this._baseUrl + '/cgi-bin/user/get',
      method: 'get',
      params: {
        access_token: this.getApiAccessToken(),
        userid: userId,
      }
    });
    let data = response.data;
    if (!data || data['errcode'] || !data['userid']) {
      throw new Error(`Failed to get user: ${data['errmsg'] || 'Unknown'}`)
    }
    return data;
  }

  protected getAuthUrl(): string
  {
    let query = {
      appid: this.getClientId(),
      redirect_uri: this._redirectUrl,
      response_type: 'code',
      scope: this.formatScopes(this._scopes, this._scopeSeparator),
    };
    if (this._state) {
      query['state'] = this._state;
    }
    return 'https://open.weixin.qq.com/connect/oauth2/authorize?' + buildQueryString(query) + '#wechat_redirect';
  }

  protected getTokenUrl(): string
  {
    return '';
  }

  protected async getUserByToken(token: string): Promise<object>
  {
    throw new Error(`WeWork doesn't support access_token mode.`);
  }

  protected mapUserToObject(user: object): User
  {
    if (this._detailed) {
      return new User({
        id: user['userid'] || null,
        name: user['name'] || null,
        email: user['email'] || null,
        avatar: user['avatar'] || null,
      });
    }

    return new User({
      id: user['UserId'] || user['OpenId'] || null,
    });
  }

}
