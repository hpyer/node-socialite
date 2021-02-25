'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const SocialiteManager_1 = __importDefault(require("./Core/SocialiteManager"));
const ProviderInterface_1 = __importDefault(require("./Core/ProviderInterface"));
const User_1 = __importDefault(require("./Core/User"));
const Config_1 = __importDefault(require("./Core/Config"));
module.exports = {
    SocialiteManager: SocialiteManager_1.default,
    ProviderInterface: ProviderInterface_1.default,
    User: User_1.default,
    Config: Config_1.default,
};
