'use strict';

import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
import { inArray } from "../Core/Utils";

export default class Github extends ProviderInterface
{
  public static NAME: string = 'github';
  protected _scopes: string[] = ['read:user'];


  protected getAuthUrl(): string
  {
    return this.buildAuthUrlFromBase('https://github.com/login/oauth/authorize');
  }

  protected getTokenUrl(): string
  {
    return 'https://github.com/login/oauth/access_token';
  }

  protected async getUserByToken(token: string): Promise<object>
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

  protected mapUserToObject(user: object): User
  {
    return new User({
      id: user['id'] || null,
      nickname: user['login'] || null,
      name: user['name'] || null,
      email: user['email'] || null,
      avatar: user['avatar_url'] || null,
    });
  }

  protected createAuthorizationHeaders(token: string): object
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
