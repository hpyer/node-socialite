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
 * @see [OAuth2.0简介](https://wiki.connect.qq.com/oauth2-0%E7%AE%80%E4%BB%8B)
 */
class QQ extends ProviderInterface_1.default {
    constructor() {
        super(...arguments);
        this._baseUrl = 'https://graph.qq.com';
        this._scopes = ['get_user_info'];
        this._withUnionId = false;
    }
    withUnionId() {
        this._withUnionId = true;
        return this;
    }
    getAuthUrl() {
        return this.buildAuthUrlFromBase(`${this._baseUrl}/oauth2.0/authorize`);
    }
    getTokenUrl() {
        return `${this._baseUrl}/oauth2.0/token`;
    }
    getTokenFields(code) {
        let fields = super.getTokenFields(code);
        fields['grant_type'] = 'authorization_code';
        return fields;
    }
    tokenFromCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = this.getTokenFields(code);
            params['fmt'] = 'json';
            let response = yield this.doRequest({
                url: this.getTokenUrl(),
                method: 'get',
                params: params,
                responseType: 'json',
            });
            return this.normalizeAccessTokenResponse(response);
        });
    }
    getUserByToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = {
                fmt: 'json',
                access_token: token,
            };
            if (this._withUnionId) {
                params['unionid'] = 1;
            }
            let resp = yield this.doRequest({
                url: `${this._baseUrl}/oauth2.0/me`,
                method: 'get',
                params,
            });
            if (!resp || resp.status != 200 || typeof resp.data['openid'] == 'undefined') {
                throw new Error('Fail to fetch openid.');
            }
            let openid = resp.data['openid'] || '';
            let unionid = resp.data['unionid'] || '';
            let response = yield this.doRequest({
                url: `${this._baseUrl}/user/get_user_info`,
                method: 'get',
                params: {
                    fmt: 'json',
                    access_token: token,
                    openid,
                    oauth_consumer_key: this.getClientId(),
                },
            });
            return (0, Utils_1.merge)(response.data, {
                openid,
                unionid,
            });
        });
    }
    mapUserToObject(user) {
        return new User_1.default({
            id: user['openid'] || null,
            nickname: user['nickname'] || null,
            name: user['nickname'] || null,
            email: user['email'] || null,
            avatar: user['figureurl_qq_2'] || null,
        });
    }
}
exports.default = QQ;
QQ.NAME = 'qq';
