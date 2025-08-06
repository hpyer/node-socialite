'use strict';

import { BaseProvider } from "../Core/BaseProvider";
import { User } from "../Core/User";
import { buildQueryString, formatTime, generateHash, merge } from "../Core/Utils";

/**
 * @see [Taobao - 用户授权介绍](https://open.taobao.com/doc.htm?docId=102635&docType=1&source=search)
 */
export default class Taobao extends BaseProvider
{
  public static NAME: string = 'taobao';
  protected _baseUrl: string = 'https://oauth.taobao.com';
  protected _gatewayUrl: string = 'https://eco.taobao.com/router/rest';
  protected _scopes: string[] = ['user_info'];
  protected _view: string = 'web';

  protected withView(view: string): this
  {
    this._view = view;
    return this;
  }

  getAuthUrl(): string
  {
    return this.buildAuthUrlFromBase(`${this._baseUrl}/authorize`);
  }

  protected getCodeFields(): Record<string, any>
  {
    return {
      client_id: this.getClientId(),
      redirect_uri: this._redirectUrl,
      view: this._view,
      response_type: 'code',
    };
  }

  getTokenUrl(): string
  {
    return `${this._baseUrl}/token`;
  }

  protected getTokenFields(code: string): Record<string, any>
  {
    let fields = super.getTokenFields(code);
    fields['grant_type'] = 'authorization_code';
    fields['view'] = this._view;
    return fields;
  }

  async tokenFromCode(code: string): Promise<Record<string, any>>
  {
    let params = this.getTokenFields(code);
    let response = await this.doRequest({
      url: this.getTokenUrl(),
      method: 'post',
      params: params,
      responseType: 'json',
    });

    return this.normalizeAccessTokenResponse(response);
  }

  protected generateSign(params: Record<string, any>) {
    let keys = Object.keys(params);
    keys.sort();

    let str = this.getClientSecret();
    for (let key of keys) {
      if (typeof params[key] === 'object' || (params[key] + '').startsWith('@')) continue;
      str += `${key}${params[key]}`;
    }
    str += this.getClientSecret();

    return generateHash(str, 'md5').toUpperCase();
  }

  protected getPublicFields(token: string, apiFields: Record<string, any> = {}) {
    let fields = {
      app_key: this.getClientId(),
      sign_method: 'md5',
      session: token,
      timestamp: formatTime('YYYY-MM-dd HH:mm:ss'),
      v: '2.0',
      format: 'json',
    };
    fields = merge(fields, apiFields);
    fields['sign'] = this.generateSign(fields);

    return fields;
  }

  protected getUserInfoUrl(url: string, token: string) {
    let apiFields = {
      method: 'taobao.miniapp.userInfo.get',
    };
    let query = buildQueryString(this.getPublicFields(token, apiFields));
    return `${url}?${query}`
  }

  async getUserByToken(token: string): Promise<Record<string, any>>
  {
    let resp = await this.doRequest({
      url: this.getUserInfoUrl(this._gatewayUrl, token),
      method: 'post',
    });
    if (!resp || resp.status != 200 || !resp.data['miniapp_userInfo_get_response'] || !resp.data['miniapp_userInfo_get_response']['result']) {
      throw new Error('Fail to fetch openid.');
    }
    return resp.data['miniapp_userInfo_get_response']['result']['model'];
  }

  mapUserToObject(user: Record<string, any>): User
  {
    return new User({
      id: user['open_id'] || null,
      nickname: user['nick'] || null,
      name: user['nick'] || null,
      email: user['email'] || null,
      avatar: user['avatar'] || null,
    });
  }

}
