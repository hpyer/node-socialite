
const BaseProviderTest = require('../BaseProviderTest');
const { default: DouYin } = require('../../dist/Providers/DouYin');

class TestUnit extends BaseProviderTest {

  test() {

    let douyin = new DouYin({
      client_id: 'douyin-app-id',
      client_secret: 'douyin-app-secret',
      redirect: 'http://example.com/socialite/douyin-callback',
    });

    it('Should the same redirect url', () => {
      let url = douyin.redirect();
      this.assert.strictEqual(url, 'https://open.douyin.com/platform/oauth/connect/?client_key=douyin-app-id&redirect_uri=http%3A%2F%2Fexample.com%2Fsocialite%2Fdouyin-callback&scope=user_info&response_type=code');
    });

    it('Should the same redirect url with custom data', () => {
      let url = douyin.scopes('test_scope').redirect('http://test.com/socialite/callback');
      this.assert.strictEqual(url, 'https://open.douyin.com/platform/oauth/connect/?client_key=douyin-app-id&redirect_uri=http%3A%2F%2Ftest.com%2Fsocialite%2Fcallback&scope=test_scope&response_type=code');
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
          open_id: 'fake-id',
          nickname: 'fake-nickname',
          email: 'fake-email',
          avatar: 'fake-avatar',
        },
      ]);
      let user = await douyin.userFromCode('123456');

      this.assert.strictEqual(user.id, 'fake-id');
      this.assert.strictEqual(user.nickname, 'fake-nickname');
      this.assert.strictEqual(user.name, 'fake-nickname');
      this.assert.strictEqual(user.email, 'fake-email');
      this.assert.strictEqual(user.avatar, 'fake-avatar');
      this.assert.strictEqual(user.access_token, 'fake-access-token');
      this.assert.strictEqual(user.refresh_token, 'fake-refresh-token');
    });

  }
}

new TestUnit('douyin');
