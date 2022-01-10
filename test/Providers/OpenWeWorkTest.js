
const BaseProviderTest = require('../BaseProviderTest');
const { default: OpenWeWork } = require('../../dist/Providers/OpenWeWork');

class TestUnit extends BaseProviderTest {

  test() {
    it('Should the same redirect url with custom data', () => {
      let wework = new OpenWeWork({
        client_id: 'fake-suite-id',
        client_secret: 'fake-suite-secret',
        redirect: 'http://example.com/socialite/open-wework-callback',
      });

      let url = wework.scopes('snsapi_base').withState('test_state').redirect('http://test.com/socialite/callback');
      this.assert.strictEqual(url, 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=fake-suite-id&redirect_uri=http%3A%2F%2Ftest.com%2Fsocialite%2Fcallback&response_type=code&scope=snsapi_base&state=test_state#wechat_redirect');
    });

    it(`Should throw error about unset suiteTicket`, async () => {
      let wework = new OpenWeWork({
        client_id: 'fake-suite-id',
        client_secret: 'fake-suite-secret',
        redirect: 'http://example.com/socialite/open-wework-callback',
      });

      try {
        let user = await wework.userFromCode('fake-code');
      }
      catch (e) {
        this.assert.strictEqual(e.message, 'Please set `suiteTicket` first.');
      }
    });

    it(`Should fetch user from code`, async () => {
      this.mockResponseMulti([
        {
          errcode: 0,
          errmsg: 'ok',
          suite_access_token: 'fake-access-token',
          expires_in: 7200,
        },
        {
          errcode: 0,
          errmsg: 'ok',
          CorpId: 'fake-corp-id',
          UserId: 'fake-user-id',
          DeviceId: 'fake-device-id',
          user_ticket: 'fake-user-ticket',
          expires_in: 7200,
          open_userid: 'fake-open-userid',
        },
      ]);

      let wework = new OpenWeWork({
        client_id: 'fake-suite-id',
        client_secret: 'fake-suite-secret',
        redirect: 'http://example.com/socialite/open-wework-callback',
      });

      wework.withSuiteTicket('fake-suite-ticket');
      let user = await wework.userFromCode('fake-code');

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
          errmsg: 'ok',
          suite_access_token: 'fake-access-token',
          expires_in: 7200,
        },
        {
          errcode: 0,
          errmsg: 'ok',
          CorpId: 'fake-corp-id',
          UserId: 'fake-user-id',
          DeviceId: 'fake-device-id',
          user_ticket: 'fake-user-ticket',
          expires_in: 7200,
          open_userid: 'fake-open-userid',
        },
        {
          errcode: 0,
          errmsg: 'ok',
          corpid: 'fake2-corpid',
          userid: 'fake2-userid',
          name: 'fake2-name',
          gender: 'fake2-gender',
          avatar: 'fake2-avatar',
          qr_code: 'fake2-qrcode',
        },
      ]);

      let wework = new OpenWeWork({
        client_id: 'fake-suite-id',
        client_secret: 'fake-suite-secret',
        redirect: 'http://example.com/socialite/open-wework-callback',
      });

      wework.withSuiteTicket('fake-suite-ticket');
      let user = await wework.detailed().userFromCode('123456');

      this.assert.strictEqual(user.id, 'fake2-userid');
      this.assert.strictEqual(user.nickname, '');
      this.assert.strictEqual(user.name, 'fake2-name');
      this.assert.strictEqual(user.email, '');
      this.assert.strictEqual(user.avatar, 'fake2-avatar');
    });
  }

}

new TestUnit('open-wework');
