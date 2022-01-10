'use strict';

import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
import { buildQueryString, merge } from "../Core/Utils";
import { ProviderConfig } from "../Types/global";

/**
 * @see [网页授权登录](https://developer.work.weixin.qq.com/document/path/91119)
 */
export default class OpenWeWork extends ProviderInterface
{
  public static NAME: string = 'open-wework';
  protected _detailed: boolean = false;
  protected _suiteTicket: string = '';
  protected _agentId: number = null;
  protected _suiteAccessToken: string = '';
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

  withSuiteTicket(suiteTicket: string): this
  {
    this._suiteTicket = suiteTicket;
    return this;
  }

  withSuiteAccessToken(suiteAccessToken: string): this
  {
    this._suiteAccessToken = suiteAccessToken;
    return this;
  }

  async userFromCode(code: string): Promise<User>
  {
    let token = await this.getSuiteAccessToken();
    let user = await this.getUser(token, code);
    if (this._detailed) {
      user = merge(merge({}, user), await this.getUserByTicket(user['user_ticket']));
    }
    return this.mapUserToObject(user)
      .setProvider(OpenWeWork.NAME)
      .setRaw(user);
  }

  protected async getSuiteAccessToken(): Promise<string>
  {
    if (!this._suiteAccessToken) {
      this._suiteAccessToken = await this.createSuiteAccessToken();
    }
    return this._suiteAccessToken;
  }

  protected async createSuiteAccessToken(): Promise<string>
  {
    if (!this._suiteTicket) {
      throw new Error('Please set `suiteTicket` first.')
    }
    let response = await this.doRequest({
      url: this._baseUrl + '/cgi-bin/service/get_suite_token',
      method: 'post',
      data: {
        suite_id: this._config.get('suite_id') || this._config.get('client_id'),
        suite_secret: this._config.get('suite_secret') || this._config.get('client_secret'),
        suite_ticket: this._suiteTicket,
      }
    });
    let data = response.data;
    if (!data || data['errcode']) {
      throw new Error(`Failed to get api access_token: ${data['errmsg'] || 'Unknown'}`)
    }
    return data['suite_access_token'];
  }

  protected async getUser(token: string, code: string): Promise<object>
  {
    let response = await this.doRequest({
      url: this._baseUrl + '/cgi-bin/service/getuserinfo3rd',
      method: 'get',
      params: {
        suite_access_token: token,
        code,
      }
    });
    let data = response.data;
    if (!data || data['errcode'] || (!data['UserId'] && !data['OpenId'])) {
      throw new Error(`Failed to get user openid: ${data['errmsg'] || 'Unknown'}`)
    }
    return data;
  }

  protected async getUserByTicket(userTicket: string): Promise<object>
  {
    let response = await this.doRequest({
      url: this._baseUrl + '/cgi-bin/service/getuserdetail3rd',
      method: 'post',
      params: {
        suite_access_token: this.getSuiteAccessToken(),
      },
      data: {
        user_ticket: userTicket,
      }
    });
    let data = response.data;
    if (!data || data['errcode'] || !data['userid']) {
      throw new Error(`Failed to get user: ${data['errmsg'] || 'Unknown'}`)
    }
    return data;
  }

  public getAuthUrl(): string
  {
    let query = {
      appid: this.getClientId(),
      redirect_uri: this._redirectUrl,
      response_type: 'code',
      scope: this.formatScopes(this._scopes, this._scopeSeparator),
    };
    let agentId = this._agentId || this._config.get('agentid');
    if (agentId) {
      query['agentid'] = agentId;
    }
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
        email: '',
        avatar: user['avatar'] || null,
      });
    }

    return new User({
      id: user['UserId'] || user['OpenId'] || null,
    });
  }

}
