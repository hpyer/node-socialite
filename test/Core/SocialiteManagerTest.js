
const assert = require('assert');

const { SocialiteManager, ProviderInterface, User } = require('../../dist');
const { default: Github } = require('../../dist/Providers/Github');

class TestCustomProvider extends ProviderInterface {
  getAuthUrl() {
    return '';
  }

  getTokenUrl() {
    return '';
  }

  getUserByToken(token) {
    return {};
  }

  mapUserToObject(user) {
    return new User({});
  }
}

describe('SocialiteManager', () => {

  let manager = new SocialiteManager({
    foo: {
      provider: 'github',
      client_id: 'foo-app-id',
      client_secret: 'foo-app-secret',
      redirect: 'http://example.com/socialite/foo-callback',
    },
    bar: {
      provider: 'github',
      client_id: 'bar-app-id',
      client_secret: 'bar-app-secret',
      redirect: 'http://example.com/socialite/bar-callback',
    },
  });

  it('Should instance of provider Github', function () {
    assert.strictEqual(manager.create('foo') instanceof Github, true);
    assert.strictEqual(manager.create('bar') instanceof Github, true);
  });

  it('Should the same client_id', function () {
    assert.strictEqual(manager.create('foo').getClientId(), 'foo-app-id');
    assert.strictEqual(manager.create('bar').getClientId(), 'bar-app-id');
  });

  it('Should throw error with invalid name', function () {
    try {
      manager.create('foobar');
    }
    catch (e) {
      assert.strictEqual(e.message, 'Invalid provider: foobar');
    }
  });

  // from name
  let config2 = {
    github: {
      client_id: 'foo-app-id',
      client_secret: 'foo-app-secret',
      redirect: 'http://example.com/socialite/foo-callback',
    },
  };
  let manager2 = new SocialiteManager(config2);

  it('Should instance of provider Github (from name)', function () {
    assert.strictEqual(manager2.create('github') instanceof Github, true);
  });

  it('Should the same client_id (from name)', function () {
    assert.strictEqual(manager2.create('github').getClientId(), 'foo-app-id');
  });

  // custom creator
  let config3 = {
    foo: {
      provider: 'myprovider',
      client_id: 'foo-app-id',
      client_secret: 'foo-app-secret',
      redirect: 'http://example.com/socialite/foo-callback',
    },
  };
  let manager3 = new SocialiteManager(config3);

  manager3.extend('myprovider', function (cfg) {
    return new TestCustomProvider(cfg);
  });

  it('Should instance of custom creator', function () {
    assert.strictEqual(manager3.create('foo') instanceof TestCustomProvider, true);
  });

  // custom provider
  let config4 = {
    bar: {
      provider: TestCustomProvider,
      client_id: 'bar-app-id',
      client_secret: 'bar-app-secret',
      redirect: 'http://example.com/socialite/bar-callback',
    },
  };
  let manager4 = new SocialiteManager(config4);

  it('Should instance of custom provider', function () {
    assert.strictEqual(manager4.create('bar') instanceof TestCustomProvider, true);
  });

});
