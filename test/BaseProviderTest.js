
const Sinon = require('sinon');
const assert = require('assert');
const axios = require('axios');

module.exports = class BaseProviderTest {

  /**
   * 构造通用模块测试用例
   * @param {string} name 要测试的供应商名称
   * @param {boolean} 是否自动运行测试用例
   */
  constructor(name, autoRun = true) {
    /**
     * 断言方法
     * @type {typeof assert}
     */
    this.assert = assert;
    /**
     * 测试供应商名称（小写）
     * @type {string}
     */
    this.name = name.toLowerCase();

    if (autoRun) {
      this.run();
    }
  }

  /**
   * 配置模拟请求的响应结果
   * @param {string} body 响应结果
   * @param {object} headers 响应 headers
   * @param {number} status 响应状态码，默认：200
   */
  mockResponse(body, headers = null, status = 200) {
    this._request.resolves({
      status,
      headers,
      data: body,
    });

    return this;
  }

  /**
   * 配置多次模拟请求的响应结果
   * @param {object[]} responses [{body: xxxx, headers: {a: '111'}, status: 200}]
   */
  mockResponseMulti(responses) {
    for (let i = 0; i < responses.length; i++) {
      let response = responses[i];
      if (typeof response.body == 'undefined' && typeof response.status == 'undefined' && typeof response.headers == 'undefined') {
        response = {
          body: response,
          status: 200,
          headers: null,
        }
      }
      this._request.onCall(i).resolves({
        status: response.status || 200,
        headers: response.headers || null,
        data: response.body,
      });
    }

    return this;
  }

  /**
   * 具体的测试方法，需要被继承
   */
  test() {
  }

  /**
   * 重置模拟请求
   */
  mockRest() {
    this._request.reset();
  }

  /**
   * 执行测试用例
   */
  run() {

    describe(`Provider: ${this.name}`, () => {

      before(() => {
        this._request = Sinon.stub(axios, 'request');
      });

      after(() => {
        axios.request.restore();
      });

      this.test();

    });
  }

};
