
import ProviderInterface from '../Core/ProviderInterface';

export declare interface ProviderConstructable {
  new(config: object): ProviderInterface;
}

/**
 * 本工具支持的服务商映射表，键名为服务商标识，键值为服务商类
 */
export declare interface SupportProviders {
  [key: string]: ProviderConstructable;
}

/**
 * 已解析的服务商映射表，键名为服务商标识，键值为服务商实例
 */
export declare interface ResolvedProviders {
  [key: string]: ProviderInterface;
}

export declare interface ProviderConfig {
  /**
   * 服务商，支持3种方法
   *
   * 1、本工具支持的，则填写对应服务商标识即可，如：'github', 'wechat'等；
   *
   * 2、自定义服务商，并且通过 SocialiteManager.extend() 方法扩展的，则填写自定义服务商标识，如：'myprovider'；
   *
   * 3、自定义服务商，则填写服务商标识类名，如：MyProvider；
   */
  provider?: string | ProviderConstructable;

  /**
   * 应用id，与 app_id 二者必须填写一个
   */
  client_id?: string;
  /**
   * 应用id，与 client_id 二者必须填写一个
   */
  app_id?: string;

  /**
   * 应用密钥，与 app_secret 二者必须填写一个
   */
  client_secret: string;
  /**
   * 应用密钥，与 client_secret 二者必须填写一个
   */
  app_secret?: string;

  /**
   * 应用回调地址，与 redirect 二者必须填写一个
   */
  redirect_url?: string;
  /**
   * 应用回调地址，与 redirect_url 二者必须填写一个
   */
  redirect?: string;

  [key: string]: any;
}

/**
 * 键名为服务商的标识，如果需要管理同一个服务商的不同应用，
 * 则键名可以用作别名，但同时配置中的 provider 属性必填
 */
export declare interface SocialiteConfig {
  [key: string]: ProviderConfig;
}

/**
 * 自定义服务商创建方法映射表，键名为服务商标识，键值为对应的创建方法
 */
export declare interface CustomProviderCreators {
  [key: string]: ProviderCreator;
}

/**
 * 服务商创建方法
 */
export declare type ProviderCreator = (ProviderConfig) => ProviderInterface;

/**
 * 微信组件配置
 */
export declare interface WechatComponent {
  id: string;
  token: string;
}

/**
 * 微信组件配置选项
 */
export declare interface WechatComponentConfig {
  id?: string;
  app_id?: string;
  component_app_id?: string;

  token?: string;
  app_token?: string;
  access_token?: string;
  component_access_token?: string;
}
