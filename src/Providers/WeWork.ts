'use strict';

import { ProviderConfig } from "../../types/global";
import { BaseProvider } from "../Core/BaseProvider";
import { User } from "../Core/User";
import { buildQueryString } from "../Core/Utils";

/**
 * @see [网页授权登录](https://developer.work.weixin.qq.com/document/path/91335)
 */
export class WeWork extends BaseProvider
{
  public static NAME: string = 'wework';
  protected _detailed: boolean = false;
  protected _asQrcode: boolean = false;
  protected _agentId: number = null;
  protected _apiAccessToken: string = '';
  protected _baseUrl: string = 'https://qyapi.weixin.qq.com';

  constructor(config: ProviderConfig)
  {
    super(config);

    if (!this._config.has('base_url')) {
      this._baseUrl = this._config.get('base_url');
    }
    if (!this._config.has('agent_id')) {
      this._baseUrl = this._config.get('agent_id');
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

  withAgentId(agentId: number): this
  {
    return this.setAgentId(agentId);
  }

  detailed(): this
  {
    this._detailed = true;
    return this;
  }

  asQrcode(): this
  {
    this._asQrcode = true;
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
        corpid: this._config.get('corp_id') || this._config.get('corpid') || this.getClientId(),
        corpsecret: this._config.get('corp_secret') || this._config.get('corpsecret') || this.getClientSecret(),
      }
    });
    let data = response.data;
    if (!data || data['errcode']) {
      throw new Error(`Failed to get api access_token: ${data['errmsg'] || 'Unknown'}`)
    }
    return data['access_token'];
  }

  protected async getUser(token: string, code: string): Promise<Record<string, any>>
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

  protected async getUserById(userId: string): Promise<Record<string, any>>
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

  getAuthUrl(): string
  {
    let query = {
      appid: this.getClientId(),
      redirect_uri: this._redirectUrl,
      response_type: 'code',
      scope: this.formatScopes(this._scopes, this._scopeSeparator),
    };
    if (this._agentId) {
      query['agentid'] = this._agentId;
    }
    if (this._state) {
      query['state'] = this._state;
    }
    if (!this._agentId && (query.scope.indexOf('snsapi_privateinfo') > -1 || this._asQrcode)) {
      throw new Error(`'agent_id' is require when qrcode mode or scopes is 'snsapi_privateinfo'`);
    }
    if (this._asQrcode) {
      delete query.scope;
      return `https://open.work.weixin.qq.com/wwopen/sso/qrConnect?` + buildQueryString(query);
    }
    return 'https://open.weixin.qq.com/connect/oauth2/authorize?' + buildQueryString(query) + '#wechat_redirect';
  }

  getTokenUrl(): string
  {
    return '';
  }

  async getUserByToken(token: string): Promise<Record<string, any>>
  {
    throw new Error(`WeWork doesn't support access_token mode.`);
  }

  mapUserToObject(user: Record<string, any>): User
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
