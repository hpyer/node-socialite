'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ProviderInterface_1 = __importDefault(require("../Core/ProviderInterface"));
const User_1 = __importDefault(require("../Core/User"));
const Utils_1 = require("../Core/Utils");
/**
 * @see [公众号 - 网页授权](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)
 * @see [开放平台 - 网站应用微信登录开发指南](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1419316505&token=&lang=zh_CN)
 */
class WeChat extends ProviderInterface_1.default {
    constructor(config) {
        super(config);
        this._scopes = ['snsapi_login'];
        this._baseUrl = 'https://api.weixin.qq.com/sns';
        this._withCountryCode = false;
        this._component = null;
        this._openid = '';
        if (this.getConfig().has('component')) {
            this._scopes = ['snsapi_base'];
            this.prepareForComponent(this.getConfig().get('component'));
        }
    }
    prepareForComponent(componentConfig) {
        let config = {
            id: undefined,
            token: undefined,
        };
        for (let key in componentConfig) {
            switch (key) {
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
    withOpenid(openid) {
        this._openid = openid;
        return this;
    }
    withCountryCode() {
        this._withCountryCode = true;
        return this;
    }
    withComponent(componentConfig) {
        this.prepareForComponent(componentConfig);
        return this;
    }
    getComponent() {
        return this._component;
    }
    tokenFromCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield this.getTokenFromCode(code);
            return this.normalizeAccessTokenResponse(response);
        });
    }
    getTokenFromCode(code) {
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
    getTokenFields(code) {
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
    getAuthUrl() {
        let path = 'oauth2/authorize';
        if ((0, Utils_1.inArray)('snsapi_login', this._scopes)) {
            path = 'qrconnect';
        }
        return this.buildAuthUrlFromBase(`https://open.weixin.qq.com/connect/${path}`);
    }
    buildAuthUrlFromBase(url) {
        let query = this.getCodeFields();
        return url + '?' + (0, Utils_1.buildQueryString)(query) + '#wechat_redirect';
    }
    getCodeFields() {
        if (this._component) {
            this.with((0, Utils_1.merge)(this._parameters, {
                component_appid: this._component.id,
            }));
        }
        let fields = (0, Utils_1.merge)({
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
    getTokenUrl() {
        if (this._component) {
            return this._baseUrl + '/oauth2/component/access_token';
        }
        return this._baseUrl + '/oauth2/access_token';
    }
    userFromCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, Utils_1.inArray)('snsapi_base', this._scopes)) {
                return this.mapUserToObject((yield this.getTokenFromCode(code)) || {});
            }
            let tokenResponse = yield this.tokenFromCode(code);
            this.withOpenid(tokenResponse['openid']);
            let user = yield this.userFromToken(tokenResponse[this._accessTokenKey]);
            return user
                .setRefreshToken(tokenResponse[this._refreshTokenKey])
                .setExpiresIn(tokenResponse[this._expiresInKey]);
        });
    }
    getUserByToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            let language = this._withCountryCode ? null : (typeof this._parameters['lang'] != 'undefined' ? this._parameters['lang'] : 'zh_CN');
            let response = yield this.doRequest({
                url: this._baseUrl + '/userinfo',
                method: 'get',
                params: {
                    access_token: token,
                    openid: this._openid,
                    lang: language,
                }
            });
            return response.data;
        });
    }
    mapUserToObject(user) {
        return new User_1.default({
            id: user['openid'] || null,
            nickname: user['nickname'] || null,
            name: user['nickname'] || null,
            email: null,
            avatar: user['headimgurl'] || null,
        });
    }
}
exports.default = WeChat;
WeChat.NAME = 'wechat';
