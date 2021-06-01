'use strict';

import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";

/**
 * @see [授权机制说明](https://open.weibo.com/wiki/%E6%8E%88%E6%9D%83%E6%9C%BA%E5%88%B6%E8%AF%B4%E6%98%8E)
 */
export default class Weibo extends ProviderInterface
{
  public static NAME: string = 'weibo';
  protected _baseUrl: string = 'https://api.weibo.com';
  protected _scopes: string[] = ['email'];

  protected getAuthUrl(): string
  {
    return this.buildAuthUrlFromBase(`${this._baseUrl}/oauth2/authorize`);
  }

  protected getTokenUrl(): string
  {
    return `${this._baseUrl}/2/oauth2/access_token`;
  }

  protected getTokenFields(code: string): object
  {
    let fields = super.getTokenFields(code);
    fields['grant_type'] = 'authorization_code';
    return fields;
  }

  protected async getUserByToken(token: string): Promise<object>
  {
    let uid = await this.getTokenPayload(token);
    if (!uid) {
      throw new Error(`Invalid token. ${token}`);
    }

    let response = await this.doRequest({
      url: `${this._baseUrl}/2/users/show.json`,
      method: 'get',
      params: {
        uid,
        access_token: token,
      },
      headers: {
        Accept: 'application/json',
      },
    });
    return response.data;
  }

  protected async getTokenPayload(token: string): Promise<string>
  {
    try {
      let response = await this.doRequest({
        url: `${this._baseUrl}/oauth2/get_token_info`,
        method: 'post',
        params: {
          access_token: token,
        },
        headers: {
          Accept: 'application/json',
        },
      });
      let data = response.data;
      if (!data || typeof data['uid'] == 'undefined') {
        throw new Error(`Invalid token. ${token}`);
      }
      return data['uid'];
    }
    catch (e) {
      return '';
    }
  }

  protected mapUserToObject(user: object): User
  {
    return new User({
      id: user['id'] || null,
      nickname: user['screen_name'] || null,
      name: user['name'] || null,
      email: user['email'] || null,
      avatar: user['avatar_large'] || null,
    });
  }

}
