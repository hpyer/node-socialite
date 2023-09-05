
## Socialite is an OAuth2 authentication tool for Node.js

![Build](https://github.com/hpyer/node-socialite/actions/workflows/build.yml/badge.svg) [![npm](https://img.shields.io/npm/v/node-socialite.svg)](https://www.npmjs.com/package/node-socialite) [![License](https://img.shields.io/npm/l/node-socialite.svg)](LICENSE)

[Socialite](https://github.com/overtrue/socialite) 是一个由 `安正超` 大神用 PHP 开发的开源的 Oauth2 认证工具包。本项目是 Socialite 包在 Node.js 上的实现，并且基本还原了PHP版的配置项以及接口的调用方式。

> 注：虽然也使用了 Socialite 这个名称，但是 `安正超` 大神并未参与开发，请各位开发者不要因使用本包产生的疑惑而去打扰大神，如有疑问请在本项目中提 issue，谢谢~


### 安装

`npm install -S node-socialite`

### 使用说明

基本可以根据 [Socialite 的文档](https://github.com/overtrue/socialite/blob/master/README.md) 来使用（[中文版](https://github.com/overtrue/socialite/blob/master/README_CN.md)）。如果仍有疑问，请提issue，谢谢～

`authorize.js`

```js
const { SocialiteManager } = require('node-socialite');

let manager = new SocialiteManager({
  github: {
    client_id: 'your-app-id',
    client_secret: 'your-app-secret',
    redirect: 'http://example.com/socialite/callback',
  },
});

let url = manager.create('github').redirect();

// 调用 web 服务的页面跳转，如：koa2
// ctx.redirect(url);
```

`callback.js`

```js
const { SocialiteManager } = require('node-socialite');

let manager = new SocialiteManager({
  github: {
    client_id: 'your-app-id',
    client_secret: 'your-app-secret',
    redirect: 'http://example.com/socialite/callback',
  },
});

// 通过 web 服务获取回调页面 querystring 中的 code
// 如：ctx.request.query.code
let code = 'xxxx';

let user = await manager.create('github').userFromCode(code);

user.id;        // 123456
user.nickname;  // hpyer
user.name;      // Hpyer
user.email;     // test@exmaple.com
user.avatar;    // https://exmpale.com/avatar.jpg

// 也可以通过 .raw 获取接口返回的原始用户信息
user.raw;
```

### 配置

#### 支持的服务商

`github`、`wechat`（微信）、`wework`（企业微信）、`weibo`（新浪微博）、`qq`（QQ）、`douyin`（抖音）、`open-wework`（企业微信开放平台）、`taobao`（淘宝）、`gitee`、`coding`

每个服务商只需配置 `client_id`, `client_secret`, `redirect` 三个通用参数即可使用（个别服务商需要额外的配置）。如：

```js
let config = {
  github: {
    client_id: 'your-app-id',
    client_secret: 'your-app-secret',
    redirect: 'http://example.com/socialite/callback',
  },
  wechat: {
    client_id: 'your-app-id',
    client_secret: 'your-app-secret',
    redirect: 'http://example.com/socialite/callback',
  },
}
```

#### 有特殊配置项的服务商

`coding` [官方文档](https://coding.net/help/openapi)

```js
{
  client_id: 'your-app-id',
  client_secret: 'your-app-secret',
  redirect: 'http://example.com/socialite/callback',
  // 团队地址，末尾不要加“/”
  team_url: 'https://example.coding.net',
}
```

#### 自定义应用名

如果您需要管理同一个服务商的不同应用，可以将配置对的键名设置为任意名称，如：`foo`。但是在使用别名后，您必须在配置中增加一个 `provider` 参数，以告诉工具包该配置使用的是哪个服务商。

```js
let config = {
  // 别名为 foo 的 github 应用
  foo: {
    // 服务商为 github
    provider: 'github',
    client_id: 'foo-app-id',
    client_secret: 'foo-app-secret',
    redirect: 'http://example.com/socialite/foo-callback',
  },
  // 另一个别名为 bar 的 github 应用
  bar: {
    provider: 'github',
    client_id: 'bar-app-id',
    client_secret: 'bar-app-secret',
    redirect: 'http://example.com/socialite/bar-callback',
  },
}

const { SocialiteManager } = require('node-socialite');
let manager = new SocialiteManager(config);

let appFoo = manager.create('foo');
let appBar = manager.create('bar');
```

#### 添加自定义服务商

如果本工具包中没有您需要服务商，您可以继承 `ProviderInterface` 这个抽象类，实现其中的 `getAuthUrl`、`getTokenUrl`、`getUserByToken`、`mapUserToObject` 四个方法，然后将您的服务商类添加到工具包中即可。

```js
const { SocialiteManager, ProviderInterface, User } = require('node-socialite');

class MyProvider extends ProviderInterface {
  /**
   * 返回生成的授权地址
   * @return {string}
   */
  getAuthUrl() {
    return '';
  }

  /**
   * 返回获取token的接口地址
   * @return {string}
   */
  getTokenUrl() {
    return '';
  }

  /**
   * 根据token获取用户信息
   * @param {string} token tokenFromCode() 方法获取到的 token
   * @return {Promise<object>}
   */
  getUserByToken(token) {
    return {};
  }

  /**
   * 将用户信息映射为用户对象
   * @param {object} data getUserByToken() 方法获取到的用户信息
   * @return {User}
   */
  mapUserToObject(data) {
    return new User({});
  }
}

// 方法一：使用 extend 方法
let config = {
  foo: {
    // 自定义服务商标识
    provider: 'myprovider',
    client_id: 'foo-app-id',
    client_secret: 'foo-app-secret',
    redirect: 'http://example.com/socialite/foo-callback',
  },
}
let manager = new SocialiteManager(config);

// 参数1: 自定义服务商标识
// 参数2: 生成并返回 MyProvider 实例回调函数。需接收一个该服务商对应配置的参数，即 config.foo 的值
manager.extend('myprovider', function (cfg) {
  return new MyProvider(cfg);
});

// 获取服务商实例
let myprovider = manager.create('foo');


// 方法二：直接用类名做为 provider 参数
let config = {
  bar: {
    provider: MyProvider,
    client_id: 'foo-app-id',
    client_secret: 'foo-app-secret',
    redirect: 'http://example.com/socialite/foo-callback',
  },
}
let manager = new SocialiteManager(config);

// 获取服务商实例
let myprovider = manager.create('bar');
```
