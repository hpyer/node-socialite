'use strict';

import { SupportProviders, ProviderConstructable, ProviderConfig, SocialiteConfig, ResolvedProviders, CustomProviderCreators, ProviderCreator } from "../Types/global";
import Config from "./Config";
import ProviderInterface from "./ProviderInterface";
import Github from "../Providers/Github";
import WeChat from "../Providers/WeChat";
import WeWork from "../Providers/WeWork";
import Weibo from "../Providers/Weibo";

export default class SocialiteManager
{
  protected config: Config = null;
  protected resolved: ResolvedProviders = {};
  protected customCreators: CustomProviderCreators = {};
  protected providers: SupportProviders = {
    [Github.NAME]: Github,
    [WeChat.NAME]: WeChat,
    [WeWork.NAME]: WeWork,
    [Weibo.NAME]: Weibo,
  };

  constructor(config: SocialiteConfig)
  {
    this.config = new Config(config);
  }

  setConfig(config: SocialiteConfig)
  {
    this.config = new Config(config);
  }

  create(name: 'github'): Github;
  create(name: 'wechat'): WeChat;
  create(name: 'wework'): WeWork;
  create(name: 'weibo'): Weibo;
  create(name: string): ProviderInterface
  {
    name = name.toLowerCase();

    if (!this.resolved[name]) {
      this.resolved[name] = this.createProvider(name);
    }

    return this.resolved[name];
  }

  createProvider(name: string): ProviderInterface
  {
    let config: ProviderConfig = this.config.get(name, {});

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

  buildProvider(provider: ProviderConstructable, config: ProviderConfig): ProviderInterface
  {
    return new provider(config);
  }

  callCustomCreator(provider: string, config: ProviderConfig): ProviderInterface
  {
    return this.customCreators[provider](config);
  }

  isValidProvider(provider: string | ProviderInterface): boolean
  {
    return (typeof provider == 'string' && typeof this.providers[provider] != 'undefined') || provider instanceof ProviderInterface;
  }

  getResolvedProviders(): object
  {
    return this.resolved;
  }

  extend(name: string, func: ProviderCreator): this
  {
    this.customCreators[name.toLowerCase()] = func;

    return this;
  }

}
