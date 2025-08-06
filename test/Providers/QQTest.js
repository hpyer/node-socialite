
const BaseProviderTest = require('../BaseProviderTest');
const { QQ } = require('../../dist/Providers/QQ');

class TestUnit extends BaseProviderTest {

  test() {

    let qq = new QQ({
      client_id: 'qq-app-id',
      client_secret: 'qq-app-secret',
      redirect: 'http://example.com/socialite/qq-callback',
    });

    it('Should the same redirect url', () => {
      let url = qq.redirect();
      this.assert.strictEqual(url, 'https://graph.qq.com/oauth2.0/authorize?client_id=qq-app-id&redirect_uri=http%3A%2F%2Fexample.com%2Fsocialite%2Fqq-callback&scope=get_user_info&response_type=code');
    });

    it('Should the same redirect url with custom data', () => {
      let url = qq.scopes('test_scope').withState('test_state').redirect('http://test.com/socialite/callback');
      this.assert.strictEqual(url, 'https://graph.qq.com/oauth2.0/authorize?client_id=qq-app-id&redirect_uri=http%3A%2F%2Ftest.com%2Fsocialite%2Fcallback&scope=test_scope&response_type=code&state=test_state');
    });

    it(`Should fetch token from code`, async () => {
      this.mockResponse({
        openid: 'fake-openid',
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        expires_in: 7200,
      });
      let access_token = await qq.tokenFromCode('123456');

      this.assert.strictEqual(access_token.openid, 'fake-openid');
      this.assert.strictEqual(access_token.access_token, 'fake-access-token');
      this.assert.strictEqual(access_token.refresh_token, 'fake-refresh-token');
      this.assert.strictEqual(access_token.expires_in, 7200);
    });

    it(`Should fetch user from token`, async () => {

      this.mockRest();

      this.mockResponseMulti([
        {
          client_id: 'fake-client_id',
          openid: 'fake-openid',
        },
        {
          id: 'fake-id',
          nickname: 'fake-nickname',
          email: 'fake-email',
          figureurl_qq_2: 'fake-avatar',
        },
      ]);
      let user = await qq.userFromToken('fack-token');

      this.assert.strictEqual(user.provider, 'qq');
      this.assert.strictEqual(user.id, 'fake-openid');
      this.assert.strictEqual(user.nickname, 'fake-nickname');
      this.assert.strictEqual(user.name, 'fake-nickname');
      this.assert.strictEqual(user.email, 'fake-email');
      this.assert.strictEqual(user.avatar, 'fake-avatar');
    });

    it(`Should fetch user(with email) from code`, async () => {

      this.mockRest();

      this.mockResponseMulti([
        {
          openid: 'fake-openid',
          access_token: 'fake-access-token',
          refresh_token: 'fake-refresh-token',
          expires_in: 7200,
        },
        {
          client_id: 'fake-client_id',
          openid: 'fake-openid',
        },
        {
          id: 'fake-id',
          nickname: 'fake-nickname',
          email: 'fake-email',
          figureurl_qq_2: 'fake-avatar',
        },
      ]);
      let user = await qq.userFromCode('123456');

      this.assert.strictEqual(user.id, 'fake-openid');
      this.assert.strictEqual(user.nickname, 'fake-nickname');
      this.assert.strictEqual(user.name, 'fake-nickname');
      this.assert.strictEqual(user.email, 'fake-email');
      this.assert.strictEqual(user.avatar, 'fake-avatar');
      this.assert.strictEqual(user.access_token, 'fake-access-token');
      this.assert.strictEqual(user.refresh_token, 'fake-refresh-token');
    });

  }
}

new TestUnit('qq');
