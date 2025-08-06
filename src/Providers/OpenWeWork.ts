'use strict';

import { BaseProvider } from "../Core/BaseProvider";
import { User } from "../Core/User";
import { buildQueryString, merge } from "../Core/Utils";

/**
 * @see [网页授权登录](https://developer.work.weixin.qq.com/document/path/91119)
 */
export default class OpenWeWork extends BaseProvider
{
  public static NAME: string = 'open-wework';
  protected _detailed: boolean = false;
  protected _asQrcode: boolean = false;
  protected _userType: string = 'member';
  protected _lang: string = 'zh';
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

  withUserType(userType: string): this
  {
    this._userType = userType;
    return this;
  }

  withLang(lang: string): this
  {
    this._lang = lang;
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

  protected async getUser(token: string, code: string): Promise<Record<string, any>>
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
    if (!data || data['errcode'] || (!data['UserId'] && !data['openid'])) {
      throw new Error(`Failed to get user openid: ${data['errmsg'] || 'Unknown'}`)
    }
    else if (!data['user_ticket']) {
      this._detailed = false;
    }
    return data;
  }

  protected async getUserByTicket(userTicket: string): Promise<Record<string, any>>
  {
    let response = await this.doRequest({
      url: this._baseUrl + '/cgi-bin/service/getuserdetail3rd',
      method: 'post',
      params: {
        suite_access_token: await this.getSuiteAccessToken(),
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

  getAuthUrl(): string
  {
    if (this._asQrcode) {
      let query = {
        appid: this.getClientId(),
        redirect_uri: this._redirectUrl,
        usertype: this._userType,
        lang: this._lang,
      };
      if (this._state) {
        query['state'] = this._state;
      }

      return `https://open.work.weixin.qq.com/wwopen/sso/3rd_qrConnect?` + buildQueryString(query);
    }

    let query = {
      appid: this.getClientId(),
      redirect_uri: this._redirectUrl,
      response_type: 'code',
      scope: this.formatScopes(this._scopes, this._scopeSeparator),
    };
    if (this._state) {
      query['state'] = this._state;
    }
    let agentId = this._agentId || this._config.get('agentid');
    if (agentId) {
      query['agentid'] = agentId;
    }

    return 'https://open.weixin.qq.com/connect/oauth2/authorize?' + buildQueryString(query) + '#wechat_redirect';
  }

  getTokenUrl(): string
  {
    return '';
  }

  async getUserByToken(token: string): Promise<Record<string, any>>
  {
    throw new Error(`Open WeWork doesn't support access_token mode.`);
  }

  mapUserToObject(user: Record<string, any>): User
  {
    if (this._detailed) {
      return new User({
        id: user['userid'] || user['UserId'] || null,
        name: user['name'] || null,
        avatar: user['avatar'] || null,
        gender: user['gender'] || null,
        corpid: user['corpid'] || user['CorpId'] || null,
        open_userid: user['open_userid'] || null,
        qr_code: user['qr_code'] || null,
      });
    }

    return new User({
      id: user['UserId'] || user['UserId'] || user['OpenId'] || user['openid'] || null,
      corpid: user['corpid'] || user['CorpId'] || null,
      open_userid: user['open_userid'] || null,
    });
  }

}
