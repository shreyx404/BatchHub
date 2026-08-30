import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import cronHandler from '../../api/cron/auto-archive.js';

function createMockReqRes({
  method = 'GET',
  headers = {},
} = {}) {
  const req = {
    method,
    headers,
  };

  let statusCode = 200;
  let responseHeaders = {};
  let responseData = null;
  let ended = false;

  const res = {
    statusCode: 200,
    status(code) {
      statusCode = code;
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      responseHeaders[name.toLowerCase()] = value;
      return this;
    },
    json(data) {
      responseData = data;
      ended = true;
      return this;
    },
    end() {
      ended = true;
      return this;
    },
    _getResult() {
      return { statusCode, responseHeaders, responseData, ended };
    }
  };

  return { req, res };
}

describe('Cron Auto-Archive Endpoint (/api/cron/auto-archive)', () => {
  const TEST_CRON_SECRET = 'super_secret_cron_key_999!';

  beforeEach(() => {
    process.env.CRON_SECRET = TEST_CRON_SECRET;
  });

  it('should reject non-GET HTTP methods with 405 Method Not Allowed', async () => {
    for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) {
      const { req, res } = createMockReqRes({ method });
      await cronHandler(req, res);
      const result = res._getResult();

      assert.equal(result.statusCode, 405, `Method ${method} should be rejected with 405`);
    }
  });

  it('should fail closed with 500 when CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET;
    const { req, res } = createMockReqRes({
      method: 'GET',
      headers: { authorization: `Bearer ${TEST_CRON_SECRET}` },
    });

    await cronHandler(req, res);
    const result = res._getResult();

    assert.equal(result.statusCode, 500);
    assert.match(result.responseData?.error, /Cron authentication is not configured/);
  });

  it('should reject missing or incorrect Authorization header with 401', async () => {
    // Missing header
    const { req: req1, res: res1 } = createMockReqRes({ method: 'GET', headers: {} });
    await cronHandler(req1, res1);
    assert.equal(res1._getResult().statusCode, 401);

    // Incorrect header
    const { req: req2, res: res2 } = createMockReqRes({
      method: 'GET',
      headers: { authorization: 'Bearer invalid_cron_key' },
    });
    await cronHandler(req2, res2);
    assert.equal(res2._getResult().statusCode, 401);
  });
});
