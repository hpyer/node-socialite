'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("./Utils");
/**
 * 配置对象
 */
class Config {
    constructor(config = null) {
        this.config = {};
        if (config) {
            this.config = config;
        }
    }
    get(key = null, defaultValue = null) {
        let config = (0, Utils_1.merge)({}, this.config);
        if (!key) {
            return config;
        }
        if (typeof config[key] != 'undefined') {
            return config[key];
        }
        if (key.indexOf('.') > -1) {
            let keys = key.split('.');
            for (let i = 0; i < keys.length; i++) {
                let k = keys[i];
                if (typeof config != 'object' || typeof config[k] == 'undefined') {
                    return defaultValue;
                }
                config = config[k];
            }
            return config;
        }
        else {
            return defaultValue;
        }
    }
    set(key, value) {
        if (!key) {
            throw new Error('Invalid config key.');
        }
        let keys = key.split('.');
        let config = this.config;
        while (keys.length > 1) {
            key = keys.shift();
            if (typeof config[key] == 'undefined' || typeof config[key] != 'object') {
                config[key] = {};
            }
            config = config[key];
        }
        config[keys.shift()] = value;
        return config;
    }
    has(key) {
        return !!this.get(key);
    }
    offsetExists(key) {
        return typeof this.config[key] == 'undefined';
    }
    offsetGet(key) {
        return this.get(key);
    }
    offsetSet(key, value) {
        this.set(key, value);
    }
    offsetUnset(key) {
        this.set(key, null);
    }
    toString() {
        return JSON.stringify(this);
    }
}
exports.default = Config;
;
