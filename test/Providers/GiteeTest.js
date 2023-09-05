
const BaseProviderTest = require('../BaseProviderTest');
const { default: Gitee } = require('../../dist/Providers/Gitee');

class TestUnit extends BaseProviderTest {

  test() {

    let gitee = new Gitee({
      client_id: 'gitee_client_id',
      client_secret: 'gitee_client_secret',
      redirect: 'http://example.com/socialite/gitee-callback',
    });

    it('Should the same redirect url', () => {
      let url = gitee.redirect();
      this.assert.strictEqual(url, 'https://gitee.com/oauth/authorize?client_id=gitee_client_id&redirect_uri=http%3A%2F%2Fexample.com%2Fsocialite%2Fgitee-callback&scope=user_info&response_type=code');
    });

    it('Should the same redirect url with custom data', () => {
      let url = gitee.scopes('test_scope').redirect('http://test.com/socialite/callback');
      this.assert.strictEqual(url, 'https://gitee.com/oauth/authorize?client_id=gitee_client_id&redirect_uri=http%3A%2F%2Ftest.com%2Fsocialite%2Fcallback&scope=test_scope&response_type=code');
    });

    it(`Should fetch user from code`, async () => {

      this.mockRest();

      this.mockResponseMulti([
        {
          access_token: 'mock_access_token',
          token_type: 'bearer',
          expires_in: 86400,
          refresh_token: 'mock_refresh_token',
          scope: 'user_info emails',
          created_at: 1693877945
        },
        {
          id: 123456,
          login: 'zhangsan',
          name: '张三',
          avatar_url: 'https://gitee.com/avatar.jpg',
          email: null
        },
      ]);
      let user = await gitee.userFromCode('123456');

      this.assert.strictEqual(user.id, 123456);
      this.assert.strictEqual(user.nickname, 'zhangsan');
      this.assert.strictEqual(user.name, '张三');
      this.assert.strictEqual(user.avatar, 'https://gitee.com/avatar.jpg');
      this.assert.strictEqual(user.access_token, 'mock_access_token');
      this.assert.strictEqual(user.refresh_token, 'mock_refresh_token');
    });

  }
}

new TestUnit('gitee');
