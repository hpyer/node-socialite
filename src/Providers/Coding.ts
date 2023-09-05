'use strict';

import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
import { ProviderConfig } from "../Types/global";

/**
 * @see [OAuth认证](https://coding.net/help/openapi)
 */
export default class Coding extends ProviderInterface
{
  public static NAME: string = 'coding';
  protected _scopes: string[] = ['user', 'user:email'];
  protected teamUrl: string = '';

  constructor(config: ProviderConfig) {
    super(config);

    let teamUrl = this._config.get('team_url');
    if (!teamUrl) {
      throw new Error('Missing required config [team_url]');
    }
    if (teamUrl.substring(0, 8) !== 'https://' && teamUrl.substring(0, 7) !== 'http://') {
      throw new Error('Invalid team_url');
    }
    this.teamUrl = teamUrl.replace(/\/+$/gm, '');
  }

  protected getAuthUrl(): string
  {
    return this.buildAuthUrlFromBase(`${this.teamUrl}/oauth_authorize.html`);
  }

  protected getTokenUrl(): string
  {
    return `${this.teamUrl}/api/oauth/access_token`;
  }

  protected async getUserByToken(token: string): Promise<object>
  {
    let response = await this.doRequest({
      url: `${this.teamUrl}/api/me`,
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
      nickname: user['name'] || null,
      name: user['name'] || null,
      email: user['email'] || null,
      avatar: user['avatar'] || null,
    });
  }

  protected getTokenFields(code: string): object
  {
    return {
      client_id: this.getClientId(),
      client_secret: this.getClientSecret(),
      code,
      grant_type: 'authorization_code',
    };
  }

}
