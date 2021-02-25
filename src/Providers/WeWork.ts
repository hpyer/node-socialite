'use strict';

import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
import { buildQueryString } from "../Core/Utils";

export default class WeWork extends ProviderInterface
{
  public NAME: string = 'wework';
  protected _detailed: boolean = false;
  protected _agentId: number = null;
  protected _apiAccessToken: string = '';

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
    let user = await this.getUserId(token, code);
    if (this._detailed) {
      user = await this.getUserById(user['UserId']);
    }
    return this.mapUserToObject(user)
      .setProvider(this.NAME)
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
      url: 'https://qyapi.weixin.qq.com/cgi-bin/gettoken',
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

  protected async getUserId(token: string, code: string): Promise<object>
  {
    let response = await this.doRequest({
      url: 'https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo',
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
      url: 'https://qyapi.weixin.qq.com/cgi-bin/user/get',
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
    if (this._scopes && this._scopes.length > 0) {
      return this.getOAuthUrl();
    }
    return this.getQrConnectUrl();
  }

  protected getOAuthUrl(): string
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

  protected getQrConnectUrl(): string
  {
    let query = {
      appid: this.getClientId(),
      agentid: this._agentId || this._config.get('agentid'),
      redirect_uri: this._redirectUrl,
      response_type: 'code',
    };
    if (this._state) {
      query['state'] = this._state;
    }
    if (!query['agentid']) {
      throw new Error('You must config the `agentid` in configuration or using `setAgentid(agentId)`.');
    }
    return 'https://open.work.weixin.qq.com/wwopen/sso/qrConnect?' + buildQueryString(query) + '#wechat_redirect';
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
