import { SocialiteConfig } from "../Types/global";
/**
 * 配置对象
 */
export default class Config {
    protected config: SocialiteConfig;
    constructor(config?: SocialiteConfig);
    get(key?: string, defaultValue?: any): any;
    set(key: string, value: any): object;
    has(key: string): boolean;
    offsetExists(key: string): boolean;
    offsetGet(key: string): any;
    offsetSet(key: string, value: any): void;
    offsetUnset(key: string): void;
    toString(): string;
}
