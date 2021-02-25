
const BaseProviderTest = require('../BaseProviderTest');
const { default: WeChat } = require('../../dist/Providers/WeChat');

class TestUnit extends BaseProviderTest {

  test() {
    this.testNormal();
    this.testComponent();
  }

  testNormal() {
    let wechat = new WeChat({
      client_id: 'wechat-app-id',
      client_secret: 'wechat-app-secret',
      redirect: 'http://example.com/socialite/wechat-callback',
    });

    it('Should the same redirect url', () => {
      let url = wechat.redirect();
      this.assert.strictEqual(url, 'https://open.weixin.qq.com/connect/qrconnect?appid=wechat-app-id&redirect_uri=http%3A%2F%2Fexample.com%2Fsocialite%2Fwechat-callback&scope=snsapi_login&response_type=code&connect_redirect=1#wechat_redirect');
    });

    it('Should the same redirect url with custom data', () => {
      let url = wechat.scopes('snsapi_userinfo').withState('test_state').redirect('http://test.com/socialite/callback');
      this.assert.strictEqual(url, 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wechat-app-id&redirect_uri=http%3A%2F%2Ftest.com%2Fsocialite%2Fcallback&scope=snsapi_userinfo&response_type=code&connect_redirect=1&state=test_state#wechat_redirect');
    });

    it(`Should fetch token from code`, async () => {
      this.mockResponse({
        openid: 'fake-openid',
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        expires_in: 7200,
      });
      let access_token = await wechat.tokenFromCode('123456');

      this.assert.strictEqual(access_token.openid, 'fake-openid');
      this.assert.strictEqual(access_token.access_token, 'fake-access-token');
      this.assert.strictEqual(access_token.refresh_token, 'fake-refresh-token');
      this.assert.strictEqual(access_token.expires_in, 7200);
    });

    it(`Should fetch user from token`, async () => {
      this.mockResponse({
        openid: 'fake-openid',
        nickname: 'fake-nickname',
        headimgurl: 'fake-avatar',
      });
      let user = await wechat.userFromToken('fack-token');

      this.assert.strictEqual(user.provider, 'wechat');
      this.assert.strictEqual(user.id, 'fake-openid');
      this.assert.strictEqual(user.nickname, 'fake-nickname');
      this.assert.strictEqual(user.name, 'fake-nickname');
      this.assert.strictEqual(user.email, null);
      this.assert.strictEqual(user.avatar, 'fake-avatar');
    });

    it(`Should fetch user from code`, async () => {

      this.mockRest();

      this.mockResponseMulti([
        {
          openid: 'fake-openid',
          access_token: 'fake-access-token',
          refresh_token: 'fake-refresh-token',
          expires_in: 7200,
        },
        {
          openid: 'fake-openid',
          nickname: 'fake-nickname',
          headimgurl: 'fake-avatar',
        },
      ]);
      let user = await wechat.userFromCode('123456');

      this.assert.strictEqual(user.id, 'fake-openid');
      this.assert.strictEqual(user.nickname, 'fake-nickname');
      this.assert.strictEqual(user.name, 'fake-nickname');
      this.assert.strictEqual(user.avatar, 'fake-avatar');
      this.assert.strictEqual(user.access_token, 'fake-access-token');
      this.assert.strictEqual(user.refresh_token, 'fake-refresh-token');
    });
  }

  testComponent() {

    let wechat = new WeChat({
      client_id: 'wechat-app-id',
      client_secret: 'wechat-app-secret',
      redirect: 'http://example.com/socialite/wechat-callback',
      component: {
        id: 'component-app-id',
        token: 'component-token',
      }
    });

    it('Should the same redirect url (with component)', () => {
      let url = wechat.redirect();
      this.assert.strictEqual(url, 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wechat-app-id&redirect_uri=http%3A%2F%2Fexample.com%2Fsocialite%2Fwechat-callback&scope=snsapi_base&response_type=code&connect_redirect=1&component_appid=component-app-id#wechat_redirect');
    });

    it('Should the same redirect url with custom data (with component)', () => {
      let url = wechat.scopes('snsapi_userinfo').withState('test_state').redirect('http://test.com/socialite/callback');
      this.assert.strictEqual(url, 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wechat-app-id&redirect_uri=http%3A%2F%2Ftest.com%2Fsocialite%2Fcallback&scope=snsapi_userinfo&response_type=code&connect_redirect=1&component_appid=component-app-id&state=test_state#wechat_redirect');
    });

    it(`Should fetch token from code (with component)`, async () => {
      this.mockResponse({
        openid: 'fake-openid',
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        expires_in: 7200,
      });
      let access_token = await wechat.tokenFromCode('123456');

      this.assert.strictEqual(access_token.openid, 'fake-openid');
      this.assert.strictEqual(access_token.access_token, 'fake-access-token');
      this.assert.strictEqual(access_token.refresh_token, 'fake-refresh-token');
      this.assert.strictEqual(access_token.expires_in, 7200);
    });

    it(`Should fetch user from token (with component)`, async () => {
      this.mockResponse({
        openid: 'fake-id',
        nickname: 'fake-nickname',
        headimgurl: 'fake-avatar',
      });
      let user = await wechat.userFromToken('fack-token');

      this.assert.strictEqual(user.provider, 'wechat');
      this.assert.strictEqual(user.id, 'fake-id');
      this.assert.strictEqual(user.nickname, 'fake-nickname');
      this.assert.strictEqual(user.name, 'fake-nickname');
      this.assert.strictEqual(user.email, null);
      this.assert.strictEqual(user.avatar, 'fake-avatar');
    });

    it(`Should fetch user from code (with component)`, async () => {

      this.mockRest();

      this.mockResponse({
        openid: 'fake-openid',
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        expires_in: 7200,
      });
      let user = await wechat.userFromCode('123456');

      this.assert.strictEqual(user.id, 'fake-openid');
      this.assert.strictEqual(user.nickname, null);
      this.assert.strictEqual(user.name, null);
      this.assert.strictEqual(user.avatar, null);
      this.assert.strictEqual(user.email, null);
      this.assert.strictEqual(user.access_token, 'fake-access-token');
      this.assert.strictEqual(user.refresh_token, 'fake-refresh-token');
    });

  }
}

new TestUnit('wechat');
