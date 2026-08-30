import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock browser globals for testing fingerprint generator in Node environment
function setupMockBrowser() {
  global.screen = {
    width: 1920,
    height: 1080,
    colorDepth: 24,
    availWidth: 1920,
    availHeight: 1040,
  };
  global.window = {
    devicePixelRatio: 2,
  };
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      language: 'en-US',
      languages: ['en-US', 'en'],
      platform: 'Win32',
      hardwareConcurrency: 8,
      deviceMemory: 16,
      maxTouchPoints: 0,
      plugins: { length: 3 },
    },
    configurable: true,
    writable: true,
  });
  global.sessionStorage = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, val) { this.store[key] = String(val); },
    removeItem(key) { delete this.store[key]; },
    clear() { this.store = {}; }
  };
  global.document = {
    createElement(tag) {
      if (tag === 'canvas') {
        return {
          width: 200,
          height: 50,
          getContext(type) {
            if (type === '2d') {
              return {
                textBaseline: '',
                font: '',
                fillStyle: '',
                fillRect() {},
                fillText() {},
                beginPath() {},
                arc() {},
                closePath() {},
                fill() {},
              };
            }
            if (type === 'webgl' || type === 'experimental-webgl') {
              return {
                getExtension(ext) {
                  if (ext === 'WEBGL_debug_renderer_info') {
                    return {
                      UNMASKED_VENDOR_WEBGL: 0x9245,
                      UNMASKED_RENDERER_WEBGL: 0x9246,
                    };
                  }
                  return null;
                },
                getParameter(param) {
                  if (param === 0x9245) return 'Google Inc. (NVIDIA)';
                  if (param === 0x9246) return 'ANGLE (NVIDIA GeForce RTX 4070)';
                  return '';
                },
              };
            }
            return null;
          },
          toDataURL() {
            return 'data:image/png;base64,mockCanvasHashData12345';
          }
        };
      }
      return {};
    }
  };
}

describe('Device Fingerprinting Utility', async () => {
  setupMockBrowser();
  const { generateDeviceFingerprint, getDeviceFingerprint } = await import('../../src/lib/fingerprint.js');

  beforeEach(() => {
    global.sessionStorage.clear();
  });

  it('should generate a stable non-empty fingerprint hash formatted as hash1-hash2', () => {
    const fp1 = generateDeviceFingerprint();
    assert.ok(fp1, 'Fingerprint should not be empty');
    assert.match(fp1, /^[0-9a-f]{8}-[0-9a-f]{8}$/, 'Fingerprint should match 8hex-8hex format');
  });

  it('should generate identical fingerprints for the same hardware signals', () => {
    const fp1 = generateDeviceFingerprint();
    const fp2 = generateDeviceFingerprint();
    assert.equal(fp1, fp2, 'Fingerprints generated with identical signals must match');
  });

  it('should produce different fingerprints when hardware parameters change', () => {
    const fpOriginal = generateDeviceFingerprint();

    // Change a hardware signal (e.g. screen resolution)
    global.screen.width = 2560;
    global.screen.height = 1440;
    const fpChanged = generateDeviceFingerprint();

    assert.notEqual(fpOriginal, fpChanged, 'Fingerprints must change when hardware parameters differ');

    // Restore
    global.screen.width = 1920;
    global.screen.height = 1080;
  });

  it('should cache and retrieve fingerprint in sessionStorage via getDeviceFingerprint', () => {
    assert.equal(global.sessionStorage.getItem('batchhub_device_fp'), null);

    const fp = getDeviceFingerprint();
    assert.ok(fp);
    assert.equal(global.sessionStorage.getItem('batchhub_device_fp'), fp, 'Fingerprint must be cached in sessionStorage');

    // Modifying screen width now should NOT change getDeviceFingerprint because of session cache
    global.screen.width = 3840;
    const cachedFp = getDeviceFingerprint();
    assert.equal(cachedFp, fp, 'Cached session fingerprint should be returned');

    // Restore
    global.screen.width = 1920;
  });

  it('should gracefully handle canvas rendering exceptions without crashing', () => {
    // Corrupt createElement
    const origCreateElement = global.document.createElement;
    global.document.createElement = () => { throw new Error('Canvas sandbox disabled'); };

    const fp = generateDeviceFingerprint();
    assert.ok(fp, 'Fingerprint should fallback gracefully when canvas fails');
    assert.match(fp, /^[0-9a-f]{8}-[0-9a-f]{8}$/);

    global.document.createElement = origCreateElement;
  });
});
