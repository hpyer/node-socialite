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
class DouYin extends ProviderInterface_1.default {
    constructor() {
        super(...arguments);
        this._baseUrl = 'https://open.douyin.com';
        this._scopes = ['user_info'];
        this._openId = '';
    }
    withOpenId(openId) {
        this._openId = openId;
        return this;
    }
    getAuthUrl() {
        return this.buildAuthUrlFromBase(`${this._baseUrl}/platform/oauth/connect/`);
    }
    getCodeFields() {
        let fields = Utils_1.merge({
            client_key: this.getClientId(),
            redirect_uri: this._redirectUrl,
            scope: this.formatScopes(this._scopes, this._scopeSeparator),
            response_type: 'code',
        }, this._parameters);
        if (this._state) {
            fields['state'] = this._state;
        }
        return fields;
    }
    getTokenUrl() {
        return `${this._baseUrl}/oauth/access_token/`;
    }
    getTokenFields(code) {
        return {
            client_key: this.getClientId(),
            client_secret: this.getClientSecret(),
            code,
            redirect_uri: this._redirectUrl,
        };
    }
    tokenFromCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = this.getTokenFields(code);
            let response = yield this.doRequest({
                url: this.getTokenUrl(),
                method: 'get',
                params: params,
                responseType: 'json',
            });
            this.withOpenId(response.data.openid);
            return this.normalizeAccessTokenResponse(response);
        });
    }
    getUserByToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._openId) {
                throw new Error('Please set open_id before your query.');
            }
            let response = yield this.doRequest({
                url: `${this._baseUrl}/oauth/userinfo/`,
                method: 'get',
                params: {
                    open_id: this._openId,
                    access_token: token,
                }
            });
            return response.data || {};
        });
    }
    mapUserToObject(user) {
        return new User_1.default({
            id: user['open_id'] || null,
            nickname: user['nickname'] || null,
            name: user['nickname'] || null,
            email: user['email'] || null,
            avatar: user['avatar'] || null,
        });
    }
}
exports.default = DouYin;
DouYin.NAME = 'douyin';
