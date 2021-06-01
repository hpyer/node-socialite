
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

    it(`Should fetch user from code`, async () => {

      this.mockRest();

      this.mockResponseMulti([
        {
          "data": {
            "access_token": "access_token",
            "description": "",
            "error_code": "0",
            "expires_in": "86400",
            "open_id": "aaa-bbb-ccc",
            "refresh_expires_in": "86400",
            "refresh_token": "refresh_token",
            "scope": "user_info"
          },
          "message": "<nil>"
        },
        {
          "data": {
            "avatar": "https://example.com/x.jpeg",
            "city": "上海",
            "country": "中国",
            "description": "",
            "e_account_role": "<nil>",
            "error_code": "0",
            "gender": "<nil>",
            "nickname": "张伟",
            "open_id": "0da22181-d833-447f-995f-1beefea5bef3",
            "province": "上海",
            "union_id": "1ad4e099-4a0c-47d1-a410-bffb4f2f64a4"
          }
        },
      ]);
      let user = await douyin.userFromCode('123456');

      this.assert.strictEqual(user.id, '0da22181-d833-447f-995f-1beefea5bef3');
      this.assert.strictEqual(user.nickname, '张伟');
      this.assert.strictEqual(user.name, '张伟');
      this.assert.strictEqual(user.avatar, 'https://example.com/x.jpeg');
      this.assert.strictEqual(user.access_token, 'access_token');
      this.assert.strictEqual(user.refresh_token, 'refresh_token');
    });

  }
}

new TestUnit('douyin');
