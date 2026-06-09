
const BaseProviderTest = require('../BaseProviderTest');
const { WeWork } = require('../../dist/Providers/WeWork');

class TestUnit extends BaseProviderTest {

  test() {
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
          "errcode": 0,
          "errmsg": "ok",
          "access_token": "fake-access-token",
          "expires_in": 7200,
        },
        {
          "errcode": 0,
          "errmsg": "ok",
          "userid": "fake-userid",
          "user_ticket": "fake-user-ticket",
          "user_doc_ticket": "fake-user-doc-ticket"
        },
      ]);

      let wework = new WeWork({
        client_id: 'wework-corp-id',
        client_secret: 'wework-corp-secret',
        redirect: 'http://example.com/socialite/wework-callback',
      });

      let user = await wework.userFromCode('123456');

      this.assert.strictEqual(user.id, 'fake-userid');
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
          "errcode": 0,
          "errmsg": "ok",
          "access_token": "fake-access-token",
          "expires_in": 7200,
        },
        {
          "errcode": 0,
          "errmsg": "ok",
          "userid": "fake-userid",
          "user_ticket": "fake-user-ticket",
          "user_doc_ticket": "fake-user-doc-ticket"
        },
        {
          "errcode": 0,
          "errmsg": "ok",
          "userid": "fake-userid",
          "name": "fake-name",
          "department": [1, 2],
          "order": [1, 2],
          "position": "后台工程师",
          "is_leader_in_dept": [1, 0],
          "direct_leader":["lisi"],
          "alias": "fake-alias",
          "open_userid": "xxxxxx",
          "main_department": 1,
          "status": 1,
          "external_position": "产品经理"
        },
        {
          "errcode": 0,
          "errmsg": "ok",
          "userid": "fake-userid",
          "gender": "1",
          "avatar": "fake-avatar",
          "mobile": "13800000000",
          "email": "fake-email",
        },
      ]);

      let wework = new WeWork({
        client_id: 'wework-corp-id',
        client_secret: 'wework-corp-secret',
        redirect: 'http://example.com/socialite/wework-callback',
      });

      let user = await wework.detailed().userFromCode('123456');

      this.assert.strictEqual(user.id, 'fake-userid');
      this.assert.strictEqual(user.nickname, '');
      this.assert.strictEqual(user.name, 'fake-name');
      this.assert.strictEqual(user.email, 'fake-email');
      this.assert.strictEqual(user.avatar, 'fake-avatar');
      this.assert.strictEqual(user.raw.alias, 'fake-alias');
      this.assert.strictEqual(user.raw.mobile, '13800000000');
    });

    it(`Should fetch user from code (not staff)`, async () => {
      this.mockRest();

      this.mockResponseMulti([
        {
          "errcode": 0,
          "errmsg": "ok",
          "access_token": "fake-access-token",
          "expires_in": 7200,
        },
        {
          "errcode": 0,
          "errmsg": "ok",
          "openid": "fake-openid",
          "external_userid": "fake-external-userid"
        },
      ]);

      let wework = new WeWork({
        client_id: 'wework-corp-id',
        client_secret: 'wework-corp-secret',
        redirect: 'http://example.com/socialite/wework-callback',
      });

      let user = await wework.detailed().userFromCode('123456');

      this.assert.strictEqual(user.id, 'fake-openid');
      this.assert.strictEqual(user.nickname, '');
      this.assert.strictEqual(user.name, '');
      this.assert.strictEqual(user.email, '');
      this.assert.strictEqual(user.avatar, '');
      this.assert.strictEqual(user.raw.external_userid, 'fake-external-userid');
    });

    it('Should the same redirect url as qrcode', () => {
      let wework = new WeWork({
        client_id: 'wework-corp-id',
        client_secret: 'wework-corp-secret',
        redirect: 'http://example.com/socialite/wework-callback',
      });

      let url = wework.scopes('snsapi_base').withAgentId('wework-agent-id').asQrcode().redirect();
      this.assert.strictEqual(url, 'https://login.work.weixin.qq.com/wwlogin/sso/login?appid=wework-corp-id&redirect_uri=http%3A%2F%2Fexample.com%2Fsocialite%2Fwework-callback&agentid=wework-agent-id&login_type=CorpApp');
    });

  }

}

new TestUnit('wework');
