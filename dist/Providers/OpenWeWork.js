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
 * @see [网页授权登录](https://developer.work.weixin.qq.com/document/path/91119)
 */
class OpenWeWork extends ProviderInterface_1.default {
    constructor(config) {
        super(config);
        this._detailed = false;
        this._suiteTicket = '';
        this._agentId = null;
        this._suiteAccessToken = '';
        this._baseUrl = 'https://qyapi.weixin.qq.com';
        if (!this._config.has('base_url')) {
            this._baseUrl = this._config.get('base_url');
        }
    }
    getBaseUrl() {
        return this._baseUrl;
    }
    setAgentId(agentId) {
        this._agentId = agentId;
        return this;
    }
    detailed() {
        this._detailed = true;
        return this;
    }
    withSuiteTicket(suiteTicket) {
        this._suiteTicket = suiteTicket;
        return this;
    }
    withSuiteAccessToken(suiteAccessToken) {
        this._suiteAccessToken = suiteAccessToken;
        return this;
    }
    userFromCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            let token = yield this.getSuiteAccessToken();
            let user = yield this.getUser(token, code);
            if (this._detailed) {
                user = (0, Utils_1.merge)((0, Utils_1.merge)({}, user), yield this.getUserByTicket(user['user_ticket']));
            }
            return this.mapUserToObject(user)
                .setProvider(OpenWeWork.NAME)
                .setRaw(user);
        });
    }
    getSuiteAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._suiteAccessToken) {
                this._suiteAccessToken = yield this.createSuiteAccessToken();
            }
            return this._suiteAccessToken;
        });
    }
    createSuiteAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._suiteTicket) {
                throw new Error('Please set `suiteTicket` first.');
            }
            let response = yield this.doRequest({
                url: this._baseUrl + '/cgi-bin/service/get_suite_token',
                method: 'post',
                data: {
                    suite_id: this._config.get('suite_id') || this._config.get('client_id'),
                    suite_secret: this._config.get('suite_secret') || this._config.get('client_secret'),
                    suite_ticket: this._suiteTicket,
                }
            });
            let data = response.data;
            if (!data || data['errcode']) {
                throw new Error(`Failed to get api access_token: ${data['errmsg'] || 'Unknown'}`);
            }
            return data['suite_access_token'];
        });
    }
    getUser(token, code) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield this.doRequest({
                url: this._baseUrl + '/cgi-bin/service/getuserinfo3rd',
                method: 'get',
                params: {
                    suite_access_token: token,
                    code,
                }
            });
            let data = response.data;
            if (!data || data['errcode'] || (!data['UserId'] && !data['OpenId'])) {
                throw new Error(`Failed to get user openid: ${data['errmsg'] || 'Unknown'}`);
            }
            return data;
        });
    }
    getUserByTicket(userTicket) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield this.doRequest({
                url: this._baseUrl + '/cgi-bin/service/getuserdetail3rd',
                method: 'post',
                params: {
                    suite_access_token: this.getSuiteAccessToken(),
                },
                data: {
                    user_ticket: userTicket,
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
        let query = {
            appid: this.getClientId(),
            redirect_uri: this._redirectUrl,
            response_type: 'code',
            scope: this.formatScopes(this._scopes, this._scopeSeparator),
        };
        let agentId = this._agentId || this._config.get('agentid');
        if (agentId) {
            query['agentid'] = agentId;
        }
        if (this._state) {
            query['state'] = this._state;
        }
        return 'https://open.weixin.qq.com/connect/oauth2/authorize?' + (0, Utils_1.buildQueryString)(query) + '#wechat_redirect';
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
                email: '',
                avatar: user['avatar'] || null,
            });
        }
        return new User_1.default({
            id: user['UserId'] || user['OpenId'] || null,
        });
    }
}
exports.default = OpenWeWork;
OpenWeWork.NAME = 'open-wework';
