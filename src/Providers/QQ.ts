'use strict';

import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
import { merge } from "../Core/Utils";

/**
 * @see [OAuth2.0简介](https://wiki.connect.qq.com/oauth2-0%E7%AE%80%E4%BB%8B)
 */
export default class QQ extends ProviderInterface
{
  public static NAME: string = 'qq';
  protected _baseUrl: string = 'https://graph.qq.com';
  protected _scopes: string[] = ['get_user_info'];
  protected _withUnionId: boolean = false;

  protected withUnionId(): this
  {
    this._withUnionId = true;
    return this;
  }

  protected getAuthUrl(): string
  {
    return this.buildAuthUrlFromBase(`${this._baseUrl}/oauth2.0/authorize`);
  }

  protected getTokenUrl(): string
  {
    return `${this._baseUrl}/oauth2.0/token`;
  }

  protected getTokenFields(code: string): object
  {
    let fields = super.getTokenFields(code);
    fields['grant_type'] = 'authorization_code';
    return fields;
  }

  async tokenFromCode(code: string): Promise<object>
  {
    let params = this.getTokenFields(code);
    params['fmt'] = 'json';
    let response = await this.doRequest({
      url: this.getTokenUrl(),
      method: 'get',
      params: params,
      responseType: 'json',
    });

    return this.normalizeAccessTokenResponse(response);
  }

  protected async getUserByToken(token: string): Promise<object>
  {
    let params = {
      fmt: 'json',
      access_token: token,
    };
    if (this._withUnionId) {
      params['unionid'] = 1;
    }
    let resp = await this.doRequest({
      url: `${this._baseUrl}/oauth2.0/me`,
      method: 'get',
      params,
    });
    if (!resp || resp.status != 200 || typeof resp.data['openid'] == 'undefined') {
      throw new Error('Fail to fetch openid.');
    }
    let openid = resp.data['openid'] || '';
    let unionid = resp.data['unionid'] || '';

    let response = await this.doRequest({
      url: `${this._baseUrl}/user/get_user_info`,
      method: 'get',
      params: {
        fmt: 'json',
        access_token: token,
        openid,
        oauth_consumer_key: this.getClientId(),
      },
    });
    return merge(response.data, {
      openid,
      unionid,
    });
  }

  protected mapUserToObject(user: object): User
  {
    return new User({
      id: user['openid'] || null,
      nickname: user['nickname'] || null,
      name: user['nickname'] || null,
      email: user['email'] || null,
      avatar: user['figureurl_qq_2'] || null,
    });
  }

}
