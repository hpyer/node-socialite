import { SupportProviders, ProviderConstructable, ProviderConfig, SocialiteConfig, ResolvedProviders, CustomProviderCreators, ProviderCreator } from "../Types/global";
import Config from "./Config";
import ProviderInterface from "./ProviderInterface";
export default class SocialiteManager {
    protected config: Config;
    protected resolved: ResolvedProviders;
    protected customCreators: CustomProviderCreators;
    protected providers: SupportProviders;
    constructor(config: SocialiteConfig);
    setConfig(config: SocialiteConfig): void;
    create(name: string): ProviderInterface;
    createProvider(name: string): ProviderInterface;
    buildProvider(provider: ProviderConstructable, config: ProviderConfig): ProviderInterface;
    callCustomCreator(provider: string, config: ProviderConfig): ProviderInterface;
    isValidProvider(provider: string | ProviderInterface): boolean;
    getResolvedProviders(): object;
    extend(name: string, func: ProviderCreator): this;
}
