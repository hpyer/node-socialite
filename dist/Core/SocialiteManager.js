'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = __importDefault(require("./Config"));
const ProviderInterface_1 = __importDefault(require("./ProviderInterface"));
const Github_1 = __importDefault(require("../Providers/Github"));
const WeChat_1 = __importDefault(require("../Providers/WeChat"));
const WeWork_1 = __importDefault(require("../Providers/WeWork"));
const Weibo_1 = __importDefault(require("../Providers/Weibo"));
const QQ_1 = __importDefault(require("../Providers/QQ"));
const DouYin_1 = __importDefault(require("../Providers/DouYin"));
class SocialiteManager {
    constructor(config) {
        this.config = null;
        this.resolved = {};
        this.customCreators = {};
        this.providers = {
            [Github_1.default.NAME]: Github_1.default,
            [WeChat_1.default.NAME]: WeChat_1.default,
            [WeWork_1.default.NAME]: WeWork_1.default,
            [Weibo_1.default.NAME]: Weibo_1.default,
            [QQ_1.default.NAME]: QQ_1.default,
            [DouYin_1.default.NAME]: DouYin_1.default,
        };
        this.config = new Config_1.default(config);
    }
    setConfig(config) {
        this.config = new Config_1.default(config);
    }
    create(name) {
        name = name.toLowerCase();
        if (!this.resolved[name]) {
            this.resolved[name] = this.createProvider(name);
        }
        return this.resolved[name];
    }
    createProvider(name) {
        let config = this.config.get(name, {});
        if (typeof config.provider == 'undefined') {
            config.provider = name;
        }
        if (typeof config.provider == 'string') {
            let provider = config.provider;
            if (typeof this.customCreators[provider] != 'undefined') {
                return this.callCustomCreator(provider, config);
            }
            if (typeof this.providers[provider] == 'undefined') {
                throw new Error('Invalid provider: ' + provider);
            }
            return this.buildProvider(this.providers[provider], config);
        }
        return this.buildProvider(config.provider, config);
    }
    buildProvider(provider, config) {
        return new provider(config);
    }
    callCustomCreator(provider, config) {
        return this.customCreators[provider](config);
    }
    isValidProvider(provider) {
        return (typeof provider == 'string' && typeof this.providers[provider] != 'undefined') || provider instanceof ProviderInterface_1.default;
    }
    getResolvedProviders() {
        return this.resolved;
    }
    extend(name, func) {
        this.customCreators[name.toLowerCase()] = func;
        return this;
    }
}
exports.default = SocialiteManager;
