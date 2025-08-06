'use strict';

import { BaseProvider } from "../Core/BaseProvider";
import { User } from "../Core/User";

/**
 * @see [OAuth文档](https://gitee.com/api/v5/oauth_doc)
 */
export default class Gitee extends BaseProvider
{
  public static NAME: string = 'gitee';
  protected _scopes: string[] = ['user_info'];


  getAuthUrl(): string
  {
    return this.buildAuthUrlFromBase('https://gitee.com/oauth/authorize');
  }

  getTokenUrl(): string
  {
    return 'https://gitee.com/oauth/token';
  }

  async getUserByToken(token: string): Promise<Record<string, any>>
  {
    let response = await this.doRequest({
      url: 'https://gitee.com/api/v5/user',
      method: 'get',
      params: {
        'access_token': token,
      },
    });
    let data = response.data;

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

  protected getTokenFields(code: string): Record<string, any>
  {
    return {
      client_id: this.getClientId(),
      client_secret: this.getClientSecret(),
      code,
      redirect_uri: this._redirectUrl,
      grant_type: 'authorization_code',
    };
  }

}
