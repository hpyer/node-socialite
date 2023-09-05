'use strict';

import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";

/**
 * @see [OAuth文档](https://gitee.com/api/v5/oauth_doc)
 */
export default class Gitee extends ProviderInterface
{
  public static NAME: string = 'gitee';
  protected _scopes: string[] = ['user_info'];


  protected getAuthUrl(): string
  {
    return this.buildAuthUrlFromBase('https://gitee.com/oauth/authorize');
  }

  protected getTokenUrl(): string
  {
    return 'https://gitee.com/oauth/token';
  }

  protected async getUserByToken(token: string): Promise<object>
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

  protected getTokenFields(code: string): object
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
