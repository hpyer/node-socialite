import { SupportProviders, ProviderConstructable, ProviderConfig, SocialiteConfig, ResolvedProviders, CustomProviderCreators, ProviderCreator } from "../Types/global";
import Config from "./Config";
import ProviderInterface from "./ProviderInterface";
import Github from "../Providers/Github";
import WeChat from "../Providers/WeChat";
import WeWork from "../Providers/WeWork";
import Weibo from "../Providers/Weibo";
import QQ from "../Providers/QQ";
import DouYin from "../Providers/DouYin";
export default class SocialiteManager {
    protected config: Config;
    protected resolved: ResolvedProviders;
    protected customCreators: CustomProviderCreators;
    protected providers: SupportProviders;
    constructor(config: SocialiteConfig);
    setConfig(config: SocialiteConfig): void;
    create(name: 'github'): Github;
    create(name: 'wechat'): WeChat;
    create(name: 'wework'): WeWork;
    create(name: 'weibo'): Weibo;
    create(name: 'qq'): QQ;
    create(name: 'douyin'): DouYin;
    createProvider(name: string): ProviderInterface;
    buildProvider(provider: ProviderConstructable, config: ProviderConfig): ProviderInterface;
    callCustomCreator(provider: string, config: ProviderConfig): ProviderInterface;
    isValidProvider(provider: string | ProviderInterface): boolean;
    getResolvedProviders(): object;
    extend(name: string, func: ProviderCreator): this;
}
