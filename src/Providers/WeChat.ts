'use strict';

import ProviderInterface from "../Core/ProviderInterface";
import User from "../Core/User";
import { inArray, buildQueryString, merge } from "../Core/Utils";
import { WechatComponent, WechatComponentConfig } from "../Types/global";

/**
 * @see [公众号 - 网页授权](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)
 * @see [开放平台 - 网站应用微信登录开发指南](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1419316505&token=&lang=zh_CN)
 */
export default class WeChat extends ProviderInterface
{
  public static NAME: string = 'wechat';
  protected _scopes: string[] = ['snsapi_login'];
  protected _baseUrl: string = 'https://api.weixin.qq.com/sns';
  protected _withCountryCode: boolean = false;
  protected _component: WechatComponent = null;
  protected _openid: string = '';


  constructor(config)
  {
    super(config);

    if (this.getConfig().has('component')) {
      this._scopes = ['snsapi_base'];
      this.prepareForComponent(this.getConfig().get('component') as WechatComponentConfig);
    }
  }

  protected prepareForComponent(componentConfig: WechatComponentConfig): void
  {
    let config: WechatComponent = {
      id: undefined,
      token: undefined,
    };
    for (let key in componentConfig) {
      switch(key) {
        case 'id':
        case 'app_id':
        case 'component_app_id':
          config.id = componentConfig[key];
          break;
        case 'token':
        case 'app_token':
        case 'access_token':
        case 'component_access_token':
          config.token = componentConfig[key];
          break;
      }
    }
    if (config.id == undefined || config.token == undefined) {
      throw new Error('Please check your config arguments is available.');
    }

    this._component = config;
  }

  public withOpenid(openid: string): this
  {
    this._openid = openid;
    return this;
  }

  public withCountryCode(): this
  {
    this._withCountryCode = true;
    return this;
  }

  public withComponent(componentConfig: WechatComponentConfig): this
  {
    this.prepareForComponent(componentConfig);
    return this;
  }

  public getComponent(): WechatComponent
  {
    return this._component;
  }

  async tokenFromCode(code: string): Promise<object>
  {
    let response = await this.getTokenFromCode(code);

    return this.normalizeAccessTokenResponse(response);
  }

  protected getTokenFromCode(code: string)
  {
    return this.doRequest({
      url: this.getTokenUrl(),
      method: 'get',
      params: this.getTokenFields(code),
      responseType: 'json',
      headers: {
        'Accept': 'application/json',
      },
    });
  }

  protected getTokenFields(code: string): object
  {
    if (this._component) {
      return {
        appid: this.getClientId(),
        component_appid: this._component.id,
        component_access_token: this._component.token,
        code,
        grant_type: 'authorization_code',
      };
    }

    return {
      appid: this.getClientId(),
      secret: this.getClientSecret(),
      code,
      grant_type: 'authorization_code',
    };
  }

  protected getAuthUrl(): string
  {
    let path = 'oauth2/authorize';
    if (inArray('snsapi_login', this._scopes)) {
      path = 'qrconnect';
    }
    return this.buildAuthUrlFromBase(`https://open.weixin.qq.com/connect/${path}`);
  }

  protected buildAuthUrlFromBase(url: string): string
  {
    let query = this.getCodeFields();
    return url + '?' + buildQueryString(query) + '#wechat_redirect';
  }

  protected getCodeFields(): object
  {
    if (this._component) {
      this.with(merge(this._parameters, {
        component_appid: this._component.id,
      }));
    }
    let fields = merge({
      appid: this.getClientId(),
      redirect_uri: this._redirectUrl,
      scope: this.formatScopes(this._scopes, this._scopeSeparator),
      response_type: 'code',
      connect_redirect: 1,
    }, this._parameters);
    if (this._state) {
      fields['state'] = this._state;
    }
    return fields;
  }

  protected getTokenUrl(): string
  {
    if (this._component) {
      return this._baseUrl + '/oauth2/component/access_token';
    }
    return this._baseUrl + '/oauth2/access_token';
  }

  async userFromCode(code: string): Promise<User>
  {
    if (inArray('snsapi_base', this._scopes)) {
      return this.mapUserToObject(await this.getTokenFromCode(code) || {});
    }

    let tokenResponse = await this.tokenFromCode(code);
    this.withOpenid(tokenResponse['openid']);

    let user = await this.userFromToken(tokenResponse[this._accessTokenKey]);
    return user
      .setRefreshToken(tokenResponse[this._refreshTokenKey])
      .setExpiresIn(tokenResponse[this._expiresInKey])
  }

  protected async getUserByToken(token: string): Promise<object>
  {
    let language = this._withCountryCode ? null : (
      typeof this._parameters['lang'] != 'undefined' ? this._parameters['lang'] : 'zh_CN'
    );
    let response = await this.doRequest({
      url: this._baseUrl + '/userinfo',
      method: 'get',
      params: {
        access_token: token,
        openid: this._openid,
        lang: language,
      }
    });
    return response.data;
  }

  protected mapUserToObject(user: object): User
  {
    return new User({
      id: user['openid'] || null,
      nickname: user['nickname'] || null,
      name: user['nickname'] || null,
      email: null,
      avatar: user['headimgurl'] || null,
    });
  }

}
