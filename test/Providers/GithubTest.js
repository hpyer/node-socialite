
const BaseProviderTest = require('../BaseProviderTest');
const { Github } = require('../../dist/Providers/Github');

class TestUnit extends BaseProviderTest {

  test() {

    let github = new Github({
      client_id: 'github-app-id',
      client_secret: 'github-app-secret',
      redirect: 'http://example.com/socialite/github-callback',
    });

    it('Should the same redirect url', () => {
      let url = github.redirect();
      this.assert.strictEqual(url, 'https://github.com/login/oauth/authorize?client_id=github-app-id&redirect_uri=http%3A%2F%2Fexample.com%2Fsocialite%2Fgithub-callback&scope=read%3Auser&response_type=code');
    });

    it('Should the same redirect url with custom data', () => {
      let url = github.scopes('test_scope').withState('test_state').redirect('http://test.com/socialite/callback');
      this.assert.strictEqual(url, 'https://github.com/login/oauth/authorize?client_id=github-app-id&redirect_uri=http%3A%2F%2Ftest.com%2Fsocialite%2Fcallback&scope=test_scope&response_type=code&state=test_state');
    });

    it(`Should fetch token from code`, async () => {
      this.mockResponse({
        openid: 'fake-openid',
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        expires_in: 7200,
      });
      let access_token = await github.tokenFromCode('123456');

      this.assert.strictEqual(access_token.openid, 'fake-openid');
      this.assert.strictEqual(access_token.access_token, 'fake-access-token');
      this.assert.strictEqual(access_token.refresh_token, 'fake-refresh-token');
      this.assert.strictEqual(access_token.expires_in, 7200);
    });

    it(`Should fetch user from token`, async () => {
      this.mockResponse({
        id: 'fake-id',
        login: 'fake-login',
        name: 'fake-name',
        avatar_url: 'fake-avatar',
      });
      let user = await github.userFromToken('fack-token');

      this.assert.strictEqual(user.provider, 'github');
      this.assert.strictEqual(user.id, 'fake-id');
      this.assert.strictEqual(user.nickname, 'fake-login');
      this.assert.strictEqual(user.name, 'fake-name');
      this.assert.strictEqual(user.email, null);
      this.assert.strictEqual(user.avatar, 'fake-avatar');
    });

    it(`Should fetch user(with email) from code`, async () => {

      this.mockRest();

      // 设置为需要获取用户Email
      github.scopes(['read:user', 'user:email'])

      this.mockResponseMulti([
        {
          openid: 'fake-openid',
          access_token: 'fake-access-token',
          refresh_token: 'fake-refresh-token',
          expires_in: 7200,
        },
        {
          id: 'fake-id',
          login: 'fake-login',
          name: 'fake-name',
          avatar_url: 'fake-avatar',
        },
        [
          {
            email: 'test@github.com',
            verified: true,
            primary: true,
            visibility: 'public'
          }
        ],
      ]);
      let user = await github.userFromCode('123456');

      this.assert.strictEqual(user.id, 'fake-id');
      this.assert.strictEqual(user.nickname, 'fake-login');
      this.assert.strictEqual(user.name, 'fake-name');
      this.assert.strictEqual(user.email, 'test@github.com');
      this.assert.strictEqual(user.avatar, 'fake-avatar');
      this.assert.strictEqual(user.access_token, 'fake-access-token');
      this.assert.strictEqual(user.refresh_token, 'fake-refresh-token');
    });

  }
}

new TestUnit('github');
