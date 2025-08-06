
const BaseProviderTest = require('../BaseProviderTest');
const { Coding } = require('../../dist/Providers/Coding');

class TestUnit extends BaseProviderTest {

  test() {

    let coding = new Coding({
      client_id: 'coding_client_id',
      client_secret: 'coding_client_secret',
      redirect: 'http://example.com/socialite/coding-callback',
      team_url: 'https://example.coding.net',
    });

    it('Should the same redirect url', () => {
      let url = coding.redirect();
      this.assert.strictEqual(url, 'https://example.coding.net/oauth_authorize.html?client_id=coding_client_id&redirect_uri=http%3A%2F%2Fexample.com%2Fsocialite%2Fcoding-callback&scope=user%2Cuser%3Aemail&response_type=code');
    });

    it('Should the same redirect url with custom data', () => {
      let url = coding.scopes('test_scope').redirect('http://test.com/socialite/callback');
      this.assert.strictEqual(url, 'https://example.coding.net/oauth_authorize.html?client_id=coding_client_id&redirect_uri=http%3A%2F%2Ftest.com%2Fsocialite%2Fcallback&scope=test_scope&response_type=code');
    });

    it(`Should fetch user from code`, async () => {

      this.mockRest();

      this.mockResponseMulti([
        {
          "access_token": "mock_access_token",
          "refresh_token": "mock_refresh_token",
          "team": "anywhere",
          "expires_in": "780260",
          "token_type": "bearer"
        },
        {
          "avatar": "https://coding.com/avatar.jpg",
          "created_at": 1572178118000,
          "global_key": "KMRnIKgzbV",
          "name": "sink",
          "name_pinyin": "sink",
          "updated_at": 1598411867000,
          "path": "/u/KMRnIKgzbV",
          "id": 183478,
          "team": "anywhere",
          "email_validation": 1
        },
      ]);
      let user = await coding.userFromCode('123456');

      this.assert.strictEqual(user.id, 183478);
      this.assert.strictEqual(user.nickname, 'sink');
      this.assert.strictEqual(user.name, 'sink');
      this.assert.strictEqual(user.avatar, 'https://coding.com/avatar.jpg');
      this.assert.strictEqual(user.access_token, 'mock_access_token');
      this.assert.strictEqual(user.refresh_token, 'mock_refresh_token');
    });

  }
}

new TestUnit('coding');
