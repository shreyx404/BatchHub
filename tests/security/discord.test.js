import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import nacl from 'tweetnacl';
import { Readable } from 'node:stream';
import discordHandler from '../../api/discord.js';

// Helper to generate a test Ed25519 keypair
const testKeyPair = nacl.sign.keyPair();
const PUBLIC_KEY_HEX = Buffer.from(testKeyPair.publicKey).toString('hex');
const SECRET_KEY = testKeyPair.secretKey;

function signDiscordPayload(timestamp, bodyString) {
  const message = Buffer.from(timestamp + bodyString);
  const signature = nacl.sign.detached(message, SECRET_KEY);
  return Buffer.from(signature).toString('hex');
}

function createDiscordMockReqRes({
  bodyObject,
  signature,
  timestamp,
  method = 'POST',
} = {}) {
  const bodyString = JSON.stringify(bodyObject || {});
  const stream = Readable.from([Buffer.from(bodyString)]);

  stream.method = method;
  stream.headers = {
    'x-signature-ed25519': signature || '',
    'x-signature-timestamp': timestamp || '',
  };

  let statusCode = 200;
  let responseData = null;
  let ended = false;

  const res = {
    statusCode: 200,
    status(code) {
      statusCode = code;
      this.statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      ended = true;
      return this;
    },
    send(data) {
      responseData = data;
      ended = true;
      return this;
    },
    _getResult() {
      return { statusCode, responseData, ended };
    }
  };

  return { req: stream, res, bodyString };
}

describe('Discord Interaction Webhook (/api/discord) — Cryptographic Security Tests', () => {
  beforeEach(() => {
    process.env.DISCORD_PUBLIC_KEY = PUBLIC_KEY_HEX;
  });

  it('should reject requests without signature headers with 401', async () => {
    const { req, res } = createDiscordMockReqRes({
      bodyObject: { type: 1 },
      signature: '',
      timestamp: '',
    });

    await discordHandler(req, res);
    const result = res._getResult();

    assert.equal(result.statusCode, 401);
    assert.match(result.responseData, /Missing Discord signature headers/);
  });

  it('should reject invalid or forged cryptographic signatures with 401', async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const forgedSignature = '0'.repeat(128); // invalid signature

    const { req, res } = createDiscordMockReqRes({
      bodyObject: { type: 1 },
      signature: forgedSignature,
      timestamp,
    });

    await discordHandler(req, res);
    const result = res._getResult();

    assert.equal(result.statusCode, 401);
    assert.match(result.responseData, /Invalid request signature/);
  });

  it('should verify valid Ed25519 signature and respond to PING (type: 1) with PONG (type: 1)', async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const bodyObject = { type: 1 };
    const bodyString = JSON.stringify(bodyObject);
    const validSignature = signDiscordPayload(timestamp, bodyString);

    const { req, res } = createDiscordMockReqRes({
      bodyObject,
      signature: validSignature,
      timestamp,
    });

    await discordHandler(req, res);
    const result = res._getResult();

    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.responseData, { type: 1 });
  });

  it('should fail closed with 500 if DISCORD_PUBLIC_KEY is not set', async () => {
    delete process.env.DISCORD_PUBLIC_KEY;
    const timestamp = String(Math.floor(Date.now() / 1000));
    const bodyObject = { type: 1 };
    const bodyString = JSON.stringify(bodyObject);
    const validSignature = signDiscordPayload(timestamp, bodyString);

    const { req, res } = createDiscordMockReqRes({
      bodyObject,
      signature: validSignature,
      timestamp,
    });

    await discordHandler(req, res);
    const result = res._getResult();

    assert.equal(result.statusCode, 500);
    assert.match(result.responseData, /Server misconfiguration/);
  });
});
