'use strict';

import { BaseProvider } from "../Core/BaseProvider";
import { User } from "../Core/User";
import { inArray } from "../Core/Utils";

/**
 * @see [授权 OAuth 应用程序](https://docs.github.com/cn/developers/apps/building-oauth-apps/authorizing-oauth-apps)
 */
export default class Github extends BaseProvider
{
  public static NAME: string = 'github';
  protected _scopes: string[] = ['read:user'];


  getAuthUrl(): string
  {
    return this.buildAuthUrlFromBase('https://github.com/login/oauth/authorize');
  }

  getTokenUrl(): string
  {
    return 'https://github.com/login/oauth/access_token';
  }

  async getUserByToken(token: string): Promise<Record<string, any>>
  {
    let response = await this.doRequest({
      url: 'https://api.github.com/user',
      method: 'get',
      headers: this.createAuthorizationHeaders(token),
    });
    let data = response.data;
    if (inArray('user:email', this._scopes)) {
      data['email'] = await this.getEmailByToken(token);
    }

    return data;
  }

  mapUserToObject(user: Record<string, any>): User
  {
    return new User({
      id: user['id'] || null,
      nickname: user['login'] || null,
      name: user['name'] || null,
      email: user['email'] || null,
      avatar: user['avatar_url'] || null,
    });
  }

  protected createAuthorizationHeaders(token: string)
  {
    return {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${token}`,
    }
  }

  protected async getEmailByToken(token: string): Promise<string>
  {
    try {
      let response = await this.doRequest({
        url: 'https://api.github.com/user/emails',
        method: 'get',
        headers: this.createAuthorizationHeaders(token),
      });
      for (let k in response.data) {
        let email = response.data[k];
        if (email['primary'] && email['verified']) {
          return email['email'];
        }
      }
    }
    catch (e) {
    }
    return '';
  }

}
