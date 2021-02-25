'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * OAuth授权后的用户对象
 */
class User {
    constructor(data) {
        /**
         * 供应商标识
         */
        this.provider = '';
        /**
         * openid
         */
        this.id = '';
        /**
         * 昵称
         */
        this.nickname = '';
        /**
         * 昵称
         */
        this.name = '';
        /**
         * 头像
         */
        this.avatar = '';
        /**
         * E-mail
         */
        this.email = '';
        /**
         * 原始数据
         */
        this.raw = null;
        /**
         * AccessToken
         */
        this.access_token = null;
        /**
         * RefreshToken
         */
        this.refresh_token = null;
        /**
         * ExpiresIn
         */
        this.expires_in = null;
        this.merge(data);
    }
    /**
     * 获取 openid
     */
    getId() {
        return this.id || this.getEmail();
    }
    /**
     * 获取昵称
     */
    getNickname() {
        return this.nickname || this.getName();
    }
    /**
     * 获取姓名
     */
    getName() {
        return this.name;
    }
    /**
     * 获取头像
     */
    getAvatar() {
        return this.avatar;
    }
    /**
     * 获取E-mail
     */
    getEmail() {
        return this.email;
    }
    /**
     * 获取原始数据
     */
    getRaw() {
        return this.raw;
    }
    /**
     * 设置原始数据
     */
    setRaw(raw) {
        this.raw = raw;
        return this;
    }
    /**
     * 获取AccessToken
     */
    getAccessToken() {
        return this.access_token;
    }
    /**
     * 设置AccessToken
     */
    setAccessToken(token) {
        this.access_token = token;
        return this;
    }
    /**
     * 获取RefreshToken
     */
    getRefreshToken() {
        return this.refresh_token;
    }
    /**
     * 设置RefreshToken
     */
    setRefreshToken(refresh_token) {
        this.refresh_token = refresh_token;
        return this;
    }
    /**
     * 获取ExpiresIn
     */
    getExpiresIn() {
        return this.expires_in;
    }
    /**
     * 设置ExpiresIn
     */
    setExpiresIn(expires_in) {
        this.expires_in = expires_in;
        return this;
    }
    /**
     * 设置Provider
     */
    setProvider(provider) {
        this.provider = provider;
        return this;
    }
    /**
     * 获取Provider
     */
    getProvider() {
        return this.provider;
    }
    merge(attrs) {
        for (let k in attrs) {
            this[k] = attrs[k];
        }
        return this;
    }
}
exports.default = User;
;
