import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import adminHandler from '../../api/admin.js';

// Mock request and response objects for testing serverless handlers
function createMockReqRes({
  method = 'POST',
  headers = {},
  body = {},
  ip = '127.0.0.1',
} = {}) {
  const req = {
    method,
    headers: {
      'x-forwarded-for': ip,
      origin: 'http://localhost:5173',
      ...headers,
    },
    body,
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
    getHeader(name) {
      return responseHeaders[name.toLowerCase()];
    },
    json(data) {
      responseData = data;
      ended = true;
      return this;
    },
    end(data) {
      if (data) responseData = data;
      ended = true;
      return this;
    },
    _getResult() {
      return { statusCode, responseHeaders, responseData, ended };
    }
  };

  return { req, res };
}

describe('Admin Serverless API (/api/admin) — Security & Rate Limiting Tests', () => {
  const TEST_ADMIN_PASSWORD = 'super_secure_admin_password_123!';

  beforeEach(() => {
    process.env.ADMIN_PASSWORD = TEST_ADMIN_PASSWORD;
    // Don't set TURNSTILE_SECRET_KEY by default in unit test to avoid external network calls
    delete process.env.TURNSTILE_SECRET_KEY;
  });

  describe('HTTP Method & CORS Enforcement', () => {
    it('should return 204 for OPTIONS preflight requests with CORS headers', async () => {
      const { req, res } = createMockReqRes({ method: 'OPTIONS' });
      await adminHandler(req, res);
      const result = res._getResult();

      assert.equal(result.statusCode, 204);
      assert.ok(result.responseHeaders['access-control-allow-origin']);
      assert.ok(result.responseHeaders['access-control-allow-methods']);
    });

    it('should reject non-POST methods with 405 Method Not Allowed', async () => {
      for (const method of ['GET', 'PUT', 'DELETE', 'PATCH']) {
        const { req, res } = createMockReqRes({ method });
        await adminHandler(req, res);
        const result = res._getResult();

        assert.equal(result.statusCode, 405, `Method ${method} should be rejected with 405`);
        assert.equal(result.responseData?.error, 'Method Not Allowed');
      }
    });
  });

  describe('Authentication & Timing-Safe Comparison', () => {
    it('should reject requests missing Authorization header with 401', async () => {
      const { req, res } = createMockReqRes({
        ip: '10.0.0.1',
        headers: {},
        body: { action: '__ping' },
      });
      await adminHandler(req, res);
      const result = res._getResult();

      assert.equal(result.statusCode, 401);
      assert.match(result.responseData?.error, /Unauthorized/);
    });

    it('should reject incorrect passwords with 401 and indicate remaining attempts', async () => {
      const { req, res } = createMockReqRes({
        ip: '10.0.0.2',
        headers: { authorization: 'Bearer wrong_password' },
        body: { action: '__ping' },
      });
      await adminHandler(req, res);
      const result = res._getResult();

      assert.equal(result.statusCode, 401);
      assert.match(result.responseData?.error, /attempt.*remaining/);
    });

    it('should authenticate successfully with correct Bearer token for __ping', async () => {
      const { req, res } = createMockReqRes({
        ip: '10.0.0.3',
        headers: { authorization: `Bearer ${TEST_ADMIN_PASSWORD}` },
        body: { action: '__ping' },
      });
      await adminHandler(req, res);
      const result = res._getResult();

      assert.equal(result.statusCode, 200);
      assert.deepEqual(result.responseData, { data: { authenticated: true } });
    });
  });

  describe('Layer 1: Per-IP Brute Force Rate Limiting', () => {
    it('should lock out an IP after 10 consecutive failed attempts with 429 and Retry-After', async () => {
      const testIp = '192.168.100.50';

      // 10 failed attempts
      for (let i = 1; i <= 10; i++) {
        const { req, res } = createMockReqRes({
          ip: testIp,
          headers: { authorization: `Bearer bad_pwd_${i}` },
          body: { action: '__ping' },
        });
        await adminHandler(req, res);
        const result = res._getResult();

        if (i < 10) {
          assert.equal(result.statusCode, 401);
        } else {
          // 10th failure returns 401 with 0 attempts remaining
          assert.equal(result.statusCode, 401);
          assert.match(result.responseData?.error, /locked/i);
        }
      }

      // 11th attempt (even with valid password) must now return 429 Too Many Requests
      const { req: lockedReq, res: lockedRes } = createMockReqRes({
        ip: testIp,
        headers: { authorization: `Bearer ${TEST_ADMIN_PASSWORD}` },
        body: { action: '__ping' },
      });
      await adminHandler(lockedReq, lockedRes);
      const lockedResult = lockedRes._getResult();

      assert.equal(lockedResult.statusCode, 429, '11th attempt must be 429 rate-limited');
      assert.equal(lockedResult.responseHeaders['retry-after'], '86400', 'Must include Retry-After 24h header');
      assert.match(lockedResult.responseData?.error, /locked for 24 hours/i);
    });
  });

  describe('Layer 2: Per-Device Fingerprint Rate Limiting', () => {
    it('should lock out a device fingerprint across different spoofed IPs', async () => {
      const targetFingerprint = 'test-device-fp-998877';

      // 10 failed attempts from rotating IPs but identical fingerprint
      for (let i = 1; i <= 10; i++) {
        const rotatingIp = `172.16.0.${i}`;
        const { req, res } = createMockReqRes({
          ip: rotatingIp,
          headers: { authorization: `Bearer bad_pwd_attempt_${i}` },
          body: { action: '__ping', fingerprint: targetFingerprint },
        });
        await adminHandler(req, res);
      }

      // Attempt from a completely new IP with the same fingerprint
      const { req: newIpReq, res: newIpRes } = createMockReqRes({
        ip: '172.16.100.99',
        headers: { authorization: `Bearer ${TEST_ADMIN_PASSWORD}` },
        body: { action: '__ping', fingerprint: targetFingerprint },
      });
      await adminHandler(newIpReq, newIpRes);
      const result = newIpRes._getResult();

      assert.equal(result.statusCode, 429, 'Device fingerprint must trigger 429 across IPs');
      assert.match(result.responseData?.error, /device has been locked out/i);
    });
  });

  describe('Input Validation & Action Routing', () => {
    it('should return 400 for missing action in body', async () => {
      const { req, res } = createMockReqRes({
        ip: '10.0.1.1',
        headers: { authorization: `Bearer ${TEST_ADMIN_PASSWORD}` },
        body: {},
      });
      await adminHandler(req, res);
      const result = res._getResult();

      assert.equal(result.statusCode, 400);
      assert.match(result.responseData?.error, /Missing or invalid action/i);
    });

    it('should return 400 for unknown action name', async () => {
      const { req, res } = createMockReqRes({
        ip: '10.0.1.2',
        headers: { authorization: `Bearer ${TEST_ADMIN_PASSWORD}` },
        body: { action: 'executeArbitrarySqlCmd' },
      });
      await adminHandler(req, res);
      const result = res._getResult();

      assert.equal(result.statusCode, 400);
      assert.match(result.responseData?.error, /Unknown action/i);
    });
  });
});
