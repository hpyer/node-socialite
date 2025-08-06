'use strict';

import { ProviderConfig } from "../../types/global";
import { BaseProvider } from "../Core/BaseProvider";
import { User } from "../Core/User";

/**
 * @see [OAuth认证](https://coding.net/help/openapi)
 */
export class Coding extends BaseProvider
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

  getAuthUrl(): string
  {
    return this.buildAuthUrlFromBase(`${this.teamUrl}/oauth_authorize.html`);
  }

  getTokenUrl(): string
  {
    return `${this.teamUrl}/api/oauth/access_token`;
  }

  async getUserByToken(token: string): Promise<Record<string, any>>
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

  mapUserToObject(user: Record<string, any>): User
  {
    return new User({
      id: user['id'] || null,
      nickname: user['name'] || null,
      name: user['name'] || null,
      email: user['email'] || null,
      avatar: user['avatar'] || null,
    });
  }

  protected getTokenFields(code: string): Record<string, any>
  {
    return {
      client_id: this.getClientId(),
      client_secret: this.getClientSecret(),
      code,
      grant_type: 'authorization_code',
    };
  }

}
