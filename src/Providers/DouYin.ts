'use strict';

import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
import { merge } from "../Core/Utils";

export default class DouYin extends ProviderInterface
{
  public static NAME: string = 'douyin';
  protected _baseUrl: string = 'https://open.douyin.com';
  protected _scopes: string[] = ['user_info'];
  protected _openId: string = '';

  protected withOpenId(openId: string): this
  {
    this._openId = openId;
    return this;
  }

  protected getAuthUrl(): string
  {
    return this.buildAuthUrlFromBase(`${this._baseUrl}/platform/oauth/connect/`);
  }

  protected getCodeFields(): object
  {
    let fields = merge({
      client_key: this.getClientId(),
      redirect_uri: this._redirectUrl,
      scope: this.formatScopes(this._scopes, this._scopeSeparator),
      response_type: 'code',
    }, this._parameters);
    if (this._state) {
      fields['state'] = this._state;
    }
    return fields;
  }

  protected getTokenUrl(): string
  {
    return `${this._baseUrl}/oauth/access_token/`;
  }

  protected getTokenFields(code: string): object
  {
    return {
      client_key: this.getClientId(),
      client_secret: this.getClientSecret(),
      code,
      redirect_uri: this._redirectUrl,
    };
  }

  async tokenFromCode(code: string): Promise<object>
  {
    let params = this.getTokenFields(code);
    let response = await this.doRequest({
      url: this.getTokenUrl(),
      method: 'get',
      params: params,
      responseType: 'json',
    });

    if (!response.data.data || response.data.data.error_code != 0) {
      throw new Error('Invalid token response: ' + JSON.stringify(response.data));
    }

    this.withOpenId(response.data.data.open_id);

    return this.normalizeAccessTokenResponse(response.data.data);
  }

  protected async getUserByToken(token: string): Promise<object>
  {
    if (!this._openId) {
      throw new Error('Please set open_id before your query.');
    }

    let response = await this.doRequest({
      url: `${this._baseUrl}/oauth/userinfo/`,
      method: 'get',
      params: {
        open_id: this._openId,
        access_token: token,
      }
    });
    return response.data.data || {};
  }

  protected mapUserToObject(user: object): User
  {
    return new User({
      id: user['open_id'] || null,
      nickname: user['nickname'] || null,
      name: user['nickname'] || null,
      email: null,
      avatar: user['avatar'] || null,
    });
  }

}
