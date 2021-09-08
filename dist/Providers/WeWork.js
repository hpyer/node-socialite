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
 * @see [网页授权登录](https://work.weixin.qq.com/api/doc/90000/90135/91020)
 */
class WeWork extends ProviderInterface_1.default {
    constructor() {
        super(...arguments);
        this._detailed = false;
        this._agentId = null;
        this._apiAccessToken = '';
    }
    setAgentId(agentId) {
        this._agentId = agentId;
        return this;
    }
    detailed() {
        this._detailed = true;
        return this;
    }
    withApiAccessToken(apiAccessToken) {
        this._apiAccessToken = apiAccessToken;
        return this;
    }
    userFromCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            let token = yield this.getApiAccessToken();
            let user = yield this.getUserId(token, code);
            if (this._detailed) {
                user = yield this.getUserById(user['UserId']);
            }
            return this.mapUserToObject(user)
                .setProvider(WeWork.NAME)
                .setRaw(user);
        });
    }
    getApiAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._apiAccessToken) {
                this._apiAccessToken = yield this.createApiAccessToken();
            }
            return this._apiAccessToken;
        });
    }
    createApiAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield this.doRequest({
                url: 'https://qyapi.weixin.qq.com/cgi-bin/gettoken',
                method: 'get',
                params: {
                    corpid: this._config.get('corp_id') || this._config.get('corpid'),
                    corpsecret: this._config.get('corp_secret') || this._config.get('corpsecret'),
                }
            });
            let data = response.data;
            if (!data || data['errcode']) {
                throw new Error(`Failed to get api access_token: ${data['errmsg'] || 'Unknown'}`);
            }
            return data['access_token'];
        });
    }
    getUserId(token, code) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield this.doRequest({
                url: 'https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo',
                method: 'get',
                params: {
                    access_token: token,
                    code,
                }
            });
            let data = response.data;
            if (!data || data['errcode'] || (!data['UserId'] && !data['OpenId'])) {
                throw new Error(`Failed to get user openid: ${data['errmsg'] || 'Unknown'}`);
            }
            else if (!data['UserId']) {
                this._detailed = false;
            }
            return data;
        });
    }
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield this.doRequest({
                url: 'https://qyapi.weixin.qq.com/cgi-bin/user/get',
                method: 'get',
                params: {
                    access_token: this.getApiAccessToken(),
                    userid: userId,
                }
            });
            let data = response.data;
            if (!data || data['errcode'] || !data['userid']) {
                throw new Error(`Failed to get user: ${data['errmsg'] || 'Unknown'}`);
            }
            return data;
        });
    }
    getAuthUrl() {
        if (this._scopes && this._scopes.length > 0) {
            return this.getOAuthUrl();
        }
        return this.getQrConnectUrl();
    }
    getOAuthUrl() {
        let query = {
            appid: this.getClientId(),
            redirect_uri: this._redirectUrl,
            response_type: 'code',
            scope: this.formatScopes(this._scopes, this._scopeSeparator),
        };
        if (this._state) {
            query['state'] = this._state;
        }
        return 'https://open.weixin.qq.com/connect/oauth2/authorize?' + Utils_1.buildQueryString(query) + '#wechat_redirect';
    }
    getQrConnectUrl() {
        let query = {
            appid: this.getClientId(),
            agentid: this._agentId || this._config.get('agentid'),
            redirect_uri: this._redirectUrl,
            response_type: 'code',
        };
        if (this._state) {
            query['state'] = this._state;
        }
        if (!query['agentid']) {
            throw new Error('You must config the `agentid` in configuration or using `setAgentid(agentId)`.');
        }
        return 'https://open.work.weixin.qq.com/wwopen/sso/qrConnect?' + Utils_1.buildQueryString(query) + '#wechat_redirect';
    }
    getTokenUrl() {
        return '';
    }
    getUserByToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error(`WeWork doesn't support access_token mode.`);
        });
    }
    mapUserToObject(user) {
        if (this._detailed) {
            return new User_1.default({
                id: user['userid'] || null,
                name: user['name'] || null,
                email: user['email'] || null,
                avatar: user['avatar'] || null,
            });
        }
        return new User_1.default({
            id: user['UserId'] || user['OpenId'] || null,
        });
    }
}
exports.default = WeWork;
WeWork.NAME = 'wework';
