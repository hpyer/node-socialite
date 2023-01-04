
const BaseProviderTest = require('../BaseProviderTest');
const { default: Taobao } = require('../../dist/Providers/Taobao');

class TestUnit extends BaseProviderTest {

  test() {

    let taobao = new Taobao({
      client_id: 'taobao-app-id',
      client_secret: 'taobao-app-secret',
      redirect: 'http://example.com/socialite/taobao-callback',
    });

    it('Should the same redirect url', () => {
      let url = taobao.redirect();
      this.assert.strictEqual(url, 'https://oauth.taobao.com/authorize?client_id=taobao-app-id&redirect_uri=http%3A%2F%2Fexample.com%2Fsocialite%2Ftaobao-callback&view=web&response_type=code');
    });

    it('Should the same redirect url with custom data', () => {
      let url = taobao.withView('test_view').redirect('http://test.com/socialite/callback');
      this.assert.strictEqual(url, 'https://oauth.taobao.com/authorize?client_id=taobao-app-id&redirect_uri=http%3A%2F%2Ftest.com%2Fsocialite%2Fcallback&view=test_view&response_type=code');
    });

    it(`Should fetch token from code`, async () => {
      this.mockResponse({
        "w2_expires_in": 0,
        "taobao_user_id": "fake-user-id",
        "taobao_user_nick": "fake-user-nick",
        "w1_expires_in": 1800,
        "re_expires_in": 0,
        "r2_expires_in": 0,
        "expires_in": 86400,
        "token_type": "Bearer",
        "refresh_token": "fake-refresh-token",
        "access_token": "fake-access-token",
        "r1_expires_in": 1800
      });
      let access_token = await taobao.tokenFromCode('123456');

      this.assert.strictEqual(access_token.access_token, 'fake-access-token');
      this.assert.strictEqual(access_token.refresh_token, 'fake-refresh-token');
      this.assert.strictEqual(access_token.expires_in, 86400);
    });

    it(`Should fetch user from token`, async () => {

      this.mockRest();

      this.mockResponseMulti([
        {
          "miniapp_userInfo_get_response": {
            "result": {
              "model": {
                "open_id": "fake-openid",
                "avatar": "fake-avatar",
                "nick": "fake-nickname"
              },
              "err_message": "err_message",
              "err_code": "err_code",
              "success": false
            }
          }
        },
      ]);
      let user = await taobao.userFromToken('fack-token');

      this.assert.strictEqual(user.provider, 'taobao');
      this.assert.strictEqual(user.id, 'fake-openid');
      this.assert.strictEqual(user.nickname, 'fake-nickname');
      this.assert.strictEqual(user.name, 'fake-nickname');
      this.assert.strictEqual(user.email, null);
      this.assert.strictEqual(user.avatar, 'fake-avatar');
    });

  }
}

new TestUnit('taobao');
