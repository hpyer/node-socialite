
const BaseProviderTest = require('../BaseProviderTest');
const { Weibo } = require('../../dist/Providers/Weibo');

class TestUnit extends BaseProviderTest {

  test() {

    let weibo = new Weibo({
      client_id: 'weibo-app-id',
      client_secret: 'weibo-app-secret',
      redirect: 'http://example.com/socialite/weibo-callback',
    });

    it('Should the same redirect url', () => {
      let url = weibo.redirect();
      this.assert.strictEqual(url, 'https://api.weibo.com/oauth2/authorize?client_id=weibo-app-id&redirect_uri=http%3A%2F%2Fexample.com%2Fsocialite%2Fweibo-callback&scope=email&response_type=code');
    });

    it('Should the same redirect url with custom data', () => {
      let url = weibo.scopes('test_scope').withState('test_state').redirect('http://test.com/socialite/callback');
      this.assert.strictEqual(url, 'https://api.weibo.com/oauth2/authorize?client_id=weibo-app-id&redirect_uri=http%3A%2F%2Ftest.com%2Fsocialite%2Fcallback&scope=test_scope&response_type=code&state=test_state');
    });

    it(`Should fetch token from code`, async () => {
      this.mockResponse({
        openid: 'fake-openid',
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        expires_in: 7200,
      });
      let access_token = await weibo.tokenFromCode('123456');

      this.assert.strictEqual(access_token.openid, 'fake-openid');
      this.assert.strictEqual(access_token.access_token, 'fake-access-token');
      this.assert.strictEqual(access_token.refresh_token, 'fake-refresh-token');
      this.assert.strictEqual(access_token.expires_in, 7200);
    });

    it(`Should fetch user from token`, async () => {

      this.mockRest();

      this.mockResponseMulti([
        {
          uid: 'fake-uid',
        },
        {
          id: 'fake-id',
          screen_name: 'fake-nickname',
          name: 'fake-name',
          email: 'fake-email',
          avatar_large: 'fake-avatar',
        },
      ]);
      let user = await weibo.userFromToken('fack-token');

      this.assert.strictEqual(user.provider, 'weibo');
      this.assert.strictEqual(user.id, 'fake-id');
      this.assert.strictEqual(user.nickname, 'fake-nickname');
      this.assert.strictEqual(user.name, 'fake-name');
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
          uid: 'fake-uid',
        },
        {
          id: 'fake-id',
          screen_name: 'fake-nickname',
          name: 'fake-name',
          email: 'fake-email',
          avatar_large: 'fake-avatar',
        },
      ]);
      let user = await weibo.userFromCode('123456');

      this.assert.strictEqual(user.id, 'fake-id');
      this.assert.strictEqual(user.nickname, 'fake-nickname');
      this.assert.strictEqual(user.name, 'fake-name');
      this.assert.strictEqual(user.email, 'fake-email');
      this.assert.strictEqual(user.avatar, 'fake-avatar');
      this.assert.strictEqual(user.access_token, 'fake-access-token');
      this.assert.strictEqual(user.refresh_token, 'fake-refresh-token');
    });

  }
}

new TestUnit('weibo');
