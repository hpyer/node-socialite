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
 * @see [授权 OAuth 应用程序](https://docs.github.com/cn/developers/apps/building-oauth-apps/authorizing-oauth-apps)
 */
class Github extends ProviderInterface_1.default {
    constructor() {
        super(...arguments);
        this._scopes = ['read:user'];
    }
    getAuthUrl() {
        return this.buildAuthUrlFromBase('https://github.com/login/oauth/authorize');
    }
    getTokenUrl() {
        return 'https://github.com/login/oauth/access_token';
    }
    getUserByToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield this.doRequest({
                url: 'https://api.github.com/user',
                method: 'get',
                headers: this.createAuthorizationHeaders(token),
            });
            let data = response.data;
            if ((0, Utils_1.inArray)('user:email', this._scopes)) {
                data['email'] = yield this.getEmailByToken(token);
            }
            return data;
        });
    }
    mapUserToObject(user) {
        return new User_1.default({
            id: user['id'] || null,
            nickname: user['login'] || null,
            name: user['name'] || null,
            email: user['email'] || null,
            avatar: user['avatar_url'] || null,
        });
    }
    createAuthorizationHeaders(token) {
        return {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${token}`,
        };
    }
    getEmailByToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield this.doRequest({
                    url: 'https://api.github.com/user/emails',
                    method: 'get',
                    headers: this.createAuthorizationHeaders(token),
                });
                for (let k in response.data) {
                    let email = response.data[k];
                    if (email['primary'] && email['verified']) {
                        return email['email'];
                    }
                }
            }
            catch (e) {
            }
            return '';
        });
    }
}
exports.default = Github;
Github.NAME = 'github';
