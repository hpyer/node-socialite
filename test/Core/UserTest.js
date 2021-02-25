
const assert = require('assert');

const { User } = require('../../dist');

describe('User', () => {

  it('Should jsonserialize', function () {
    assert.strictEqual(JSON.stringify(new User({})), '{"provider":"","id":"","nickname":"","name":"","avatar":"","email":"","raw":null,"access_token":null,"refresh_token":null,"expires_in":null}');
    assert.strictEqual(JSON.stringify(new User({
      access_token: 'mock-token',
    })), '{"provider":"","id":"","nickname":"","name":"","avatar":"","email":"","raw":null,"access_token":"mock-token","refresh_token":null,"expires_in":null}');
  });

  it('Should return correct refresh_token', function () {
    let user = new User({
      refresh_token: 'mock-refresh',
    });
    assert.strictEqual(user.getRefreshToken(), 'mock-refresh');

    user = new User({});
    assert.strictEqual(user.getRefreshToken(), null);

    user = new User({});
    user.setRefreshToken('mock-refresh');
    assert.strictEqual(user.getRefreshToken(), 'mock-refresh');
  });

  it('Should set raw data', function () {
    let user = new User({});
    let data = {
      data: 'raw',
    };
    user.setRaw(data);
    assert.deepStrictEqual(user.getRaw(), data);
  });

});
