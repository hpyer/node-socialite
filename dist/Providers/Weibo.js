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
/**
 * @see [授权机制说明](https://open.weibo.com/wiki/%E6%8E%88%E6%9D%83%E6%9C%BA%E5%88%B6%E8%AF%B4%E6%98%8E)
 */
class Weibo extends ProviderInterface_1.default {
    constructor() {
        super(...arguments);
        this._baseUrl = 'https://api.weibo.com';
        this._scopes = ['email'];
    }
    getAuthUrl() {
        return this.buildAuthUrlFromBase(`${this._baseUrl}/oauth2/authorize`);
    }
    getTokenUrl() {
        return `${this._baseUrl}/2/oauth2/access_token`;
    }
    getTokenFields(code) {
        let fields = super.getTokenFields(code);
        fields['grant_type'] = 'authorization_code';
        return fields;
    }
    getUserByToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            let uid = yield this.getTokenPayload(token);
            if (!uid) {
                throw new Error(`Invalid token. ${token}`);
            }
            let response = yield this.doRequest({
                url: `${this._baseUrl}/2/users/show.json`,
                method: 'get',
                params: {
                    uid,
                    access_token: token,
                },
                headers: {
                    Accept: 'application/json',
                },
            });
            return response.data;
        });
    }
    getTokenPayload(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield this.doRequest({
                    url: `${this._baseUrl}/oauth2/get_token_info`,
                    method: 'post',
                    params: {
                        access_token: token,
                    },
                    headers: {
                        Accept: 'application/json',
                    },
                });
                let data = response.data;
                if (!data || typeof data['uid'] == 'undefined') {
                    throw new Error(`Invalid token. ${token}`);
                }
                return data['uid'];
            }
            catch (e) {
                return '';
            }
        });
    }
    mapUserToObject(user) {
        return new User_1.default({
            id: user['id'] || null,
            nickname: user['screen_name'] || null,
            name: user['name'] || null,
            email: user['email'] || null,
            avatar: user['avatar_large'] || null,
        });
    }
}
exports.default = Weibo;
Weibo.NAME = 'weibo';
