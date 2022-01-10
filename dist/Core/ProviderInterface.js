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
const axios_1 = __importDefault(require("axios"));
const Config_1 = __importDefault(require("../Core/Config"));
const Utils_1 = require("../Core/Utils");
class ProviderInterface {
    constructor(config) {
        this._config = null;
        this._state = '';
        this._redirectUrl = '';
        this._parameters = {};
        this._scopes = [];
        this._scopeSeparator = ',';
        this._httpOptions = {};
        this._expiresInKey = 'expires_in';
        this._accessTokenKey = 'access_token';
        this._refreshTokenKey = 'refresh_token';
        this._config = new Config_1.default(config);
        this._scopes = config['scopes'] || this._scopes || [];
        if (!this._config.has('client_id')) {
            let id = this._config.get('app_id');
            if (id != null) {
                this._config.set('client_id', id);
            }
        }
        if (!this._config.has('client_secret')) {
            let secret = this._config.get('app_secret');
            if (secret != null) {
                this._config.set('client_secret', secret);
            }
        }
        if (!this._config.has('redirect_url')) {
            this._config.set('redirect_url', this._config.get('redirect'));
        }
        this._redirectUrl = this._config.get('redirect_url');
    }
    /**
     * 获取授权URL
     * @param redirectUrl 授权后的跳转地址
     */
    redirect(redirectUrl = null) {
        if (redirectUrl) {
            this.withRedirectUrl(redirectUrl);
        }
        return this.getAuthUrl();
    }
    withRedirectUrl(redirectUrl) {
        this._redirectUrl = redirectUrl;
        return this;
    }
    withState(state) {
        this._state = state;
        return this;
    }
    scopes(scopes) {
        if (typeof scopes == 'object' && scopes.length != undefined) {
            this._scopes = scopes;
        }
        else {
            this._scopes = ['' + scopes];
        }
        return this;
    }
    withScopes(scopes) {
        return this.scopes(scopes);
    }
    withScopeSeparator(scopeSeparator) {
        this._scopeSeparator = scopeSeparator;
        return this;
    }
    with(parameters) {
        this._parameters = parameters;
        return this;
    }
    getConfig() {
        return this._config;
    }
    getClientId() {
        return this._config.get('client_id');
    }
    getClientSecret() {
        return this._config.get('client_secret');
    }
    doRequest(options = {}) {
        let opts = (0, Utils_1.merge)((0, Utils_1.merge)({}, this._httpOptions), options);
        return axios_1.default.request(opts);
    }
    setHttpOptions(options) {
        this._httpOptions = options;
        return this;
    }
    getHttpOptions() {
        return this._httpOptions;
    }
    formatScopes(scopes, scopeSeparator) {
        return scopes.join(scopeSeparator);
    }
    getTokenFields(code) {
        return {
            client_id: this.getClientId(),
            client_secret: this.getClientSecret(),
            code,
            redirect_uri: this._redirectUrl,
        };
    }
    buildAuthUrlFromBase(url) {
        let query = this.getCodeFields();
        return url + '?' + (0, Utils_1.buildQueryString)(query);
    }
    getCodeFields() {
        let fields = (0, Utils_1.merge)({
            client_id: this.getClientId(),
            redirect_uri: this._redirectUrl,
            scope: this.formatScopes(this._scopes, this._scopeSeparator),
            response_type: 'code',
        }, this._parameters);
        if (this._state) {
            fields['state'] = this._state;
        }
        return fields;
    }
    /**
     * 根据授权后的code获取用户信息
     * @param code 授权后的code
     */
    userFromCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokenResponse = yield this.tokenFromCode(code);
            let user = yield this.userFromToken(tokenResponse[this._accessTokenKey]);
            return user
                .setRefreshToken(tokenResponse[this._refreshTokenKey])
                .setExpiresIn(tokenResponse[this._expiresInKey]);
        });
    }
    /**
     * 根据授权后的code获取token
     * @param code 授权后的code
     */
    tokenFromCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield this.doRequest({
                url: this.getTokenUrl(),
                method: 'post',
                data: this.getTokenFields(code),
                responseType: 'json',
                headers: {
                    'Accept': 'application/json',
                },
            });
            return this.normalizeAccessTokenResponse(response);
        });
    }
    /**
     * 根据授权后的token获取用户信息
     * @param token 授权后的code
     */
    userFromToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.getUserByToken(token);
            return this.mapUserToObject(user)
                .setProvider(this.constructor.NAME)
                .setRaw(user)
                .setAccessToken(token);
        });
    }
    /**
     * 判断是否 AxiosResponse
     * @param response
     */
    isAxiosResponse(response) {
        return typeof response.status != 'undefined'
            && typeof response.data != 'undefined'
            && typeof response.headers != 'undefined';
    }
    /**
     * 格式化 AccessToken 对象，确保可以通过 access_token, refresh_token, expires_in 三个属性访问
     * @param response
     */
    normalizeAccessTokenResponse(response) {
        let data = null;
        if (this.isAxiosResponse(response)) {
            if (response.status != 200) {
                throw new Error('Remote server responsed with wrong code: ' + response.status);
            }
            data = response.data;
        }
        else if (typeof response == 'string') {
            try {
                data = JSON.parse(response);
            }
            catch (e) { }
        }
        else if (typeof response == 'object') {
            data = response;
        }
        if (!data || !data[this._accessTokenKey]) {
            throw new Error('Authorize Failed: ' + JSON.stringify(data));
        }
        return (0, Utils_1.merge)(data, {
            access_token: data[this._accessTokenKey],
            refresh_token: data[this._refreshTokenKey] || null,
            expires_in: parseInt(data[this._expiresInKey] || 0),
        });
    }
}
exports.default = ProviderInterface;
/**
 * 供应商标识
 */
ProviderInterface.NAME = '';
