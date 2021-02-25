
const BaseProviderTest = require('../BaseProviderTest');
const { default: WeWork } = require('../../dist/Providers/WeWork');

class TestUnit extends BaseProviderTest {

  test() {
    it('Should the same qrConnect redirect url', () => {
      let wework = new WeWork({
        client_id: 'wework-corp-id',
        client_secret: 'wework-corp-secret',
        redirect: 'http://example.com/socialite/wework-callback',
      });

      let url = wework.setAgentId(10000).redirect();
      this.assert.strictEqual(url, 'https://open.work.weixin.qq.com/wwopen/sso/qrConnect?appid=wework-corp-id&agentid=10000&redirect_uri=http%3A%2F%2Fexample.com%2Fsocialite%2Fwework-callback&response_type=code#wechat_redirect');
    });

    it('Should throw error while get qrConnect redirect url without agentId', () => {
      let wework = new WeWork({
        client_id: 'wework-corp-id',
        client_secret: 'wework-corp-secret',
        redirect: 'http://example.com/socialite/wework-callback',
      });

      try {
        let url = wework.redirect();
      }
      catch (e) {
        this.assert.strictEqual(e.message, 'You must config the `agentid` in configuration or using `setAgentid(agentId)`.');
      }
    });

    it('Should the same redirect url with custom data', () => {
      let wework = new WeWork({
        client_id: 'wework-corp-id',
        client_secret: 'wework-corp-secret',
        redirect: 'http://example.com/socialite/wework-callback',
      });

      let url = wework.scopes('snsapi_base').withState('test_state').redirect('http://test.com/socialite/callback');
      this.assert.strictEqual(url, 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wework-corp-id&redirect_uri=http%3A%2F%2Ftest.com%2Fsocialite%2Fcallback&response_type=code&scope=snsapi_base&state=test_state#wechat_redirect');
    });

    it(`Should fetch user from code`, async () => {
      this.mockResponseMulti([
        {
          errcode: 0,
          access_token: 'fake-access-token',
          expires_in: 7200,
        },
        {
          errcode: 0,
          UserId: 'fake-user-id',
          DeviceId: 'fake-device-id',
        },
      ]);

      let wework = new WeWork({
        client_id: 'wework-corp-id',
        client_secret: 'wework-corp-secret',
        redirect: 'http://example.com/socialite/wework-callback',
      });

      let user = await wework.userFromCode('123456');

      this.assert.strictEqual(user.id, 'fake-user-id');
      this.assert.strictEqual(user.nickname, '');
      this.assert.strictEqual(user.name, '');
      this.assert.strictEqual(user.email, '');
      this.assert.strictEqual(user.avatar, '');
      this.assert.strictEqual(user.access_token, null);
      this.assert.strictEqual(user.refresh_token, null);
    });

    it(`Should fetch user from code (with detailed)`, async () => {
      this.mockRest();

      this.mockResponseMulti([
        {
          errcode: 0,
          access_token: 'fake-access-token',
          expires_in: 7200,
        },
        {
          errcode: 0,
          UserId: 'fake-user-id',
          DeviceId: 'fake-device-id',
        },
        {
          errcode: 0,
          userid: 'fake-user-id',
          name: 'fake-name',
          email: 'fake-email',
          avatar: 'fake-avatar',
        },
      ]);

      let wework = new WeWork({
        client_id: 'wework-corp-id',
        client_secret: 'wework-corp-secret',
        redirect: 'http://example.com/socialite/wework-callback',
      });

      let user = await wework.detailed().userFromCode('123456');

      this.assert.strictEqual(user.id, 'fake-user-id');
      this.assert.strictEqual(user.nickname, '');
      this.assert.strictEqual(user.name, 'fake-name');
      this.assert.strictEqual(user.email, 'fake-email');
      this.assert.strictEqual(user.avatar, 'fake-avatar');
    });
  }

}

new TestUnit('wework');
