/* ============================================================
   Device Fingerprinting — Zero-dependency browser fingerprint
   Generates a stable hash from hardware/software signals that
   persists across VPN/IP changes on the same device.
   ============================================================ */

/**
 * Generate a simple hash from a string using djb2 algorithm.
 * Returns a hex string.
 */
function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Get a canvas-based fingerprint signal.
 * Different GPUs / font renderers produce subtly different pixel data.
 */
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Draw text with specific styling
    ctx.textBaseline = 'alphabetic';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('BatchHub\ud83d\ude80fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('BatchHub\ud83d\ude80fingerprint', 4, 17);

    // Draw shapes
    ctx.beginPath();
    ctx.arc(50, 30, 10, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    return canvas.toDataURL();
  } catch {
    return '';
  }
}

/**
 * Get WebGL renderer info — unique per GPU model.
 */
function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return '';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'no-debug-info';

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    return `${vendor}~${renderer}`;
  } catch {
    return '';
  }
}

/**
 * Collect all fingerprint signals and hash them into a single ID.
 */
export function generateDeviceFingerprint() {
  const signals = [];

  // 1. Screen properties
  signals.push(`screen:${screen.width}x${screen.height}x${screen.colorDepth}`);
  signals.push(`avail:${screen.availWidth}x${screen.availHeight}`);
  signals.push(`dpr:${window.devicePixelRatio || 1}`);

  // 2. Timezone
  signals.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  signals.push(`tzoff:${new Date().getTimezoneOffset()}`);

  // 3. Language & platform
  signals.push(`lang:${navigator.language}`);
  signals.push(`langs:${(navigator.languages || []).join(',')}`);
  signals.push(`plat:${navigator.platform || ''}`);
  signals.push(`cores:${navigator.hardwareConcurrency || 0}`);
  signals.push(`mem:${navigator.deviceMemory || 0}`);
  signals.push(`touch:${navigator.maxTouchPoints || 0}`);

  // 4. Canvas fingerprint
  const canvasFP = getCanvasFingerprint();
  if (canvasFP) {
    signals.push(`canvas:${djb2Hash(canvasFP)}`);
  }

  // 5. WebGL fingerprint
  const webglFP = getWebGLFingerprint();
  if (webglFP) {
    signals.push(`webgl:${webglFP}`);
  }

  // 6. Installed plugins count (legacy but stable signal)
  signals.push(`plugins:${navigator.plugins?.length || 0}`);

  // Combine all signals and hash
  const combined = signals.join('|');
  
  // Use two rounds of hashing for better distribution
  const hash1 = djb2Hash(combined);
  const hash2 = djb2Hash(combined.split('').reverse().join(''));
  
  return `${hash1}-${hash2}`;
}

/**
 * Get or create a cached fingerprint. Caches in sessionStorage for performance
 * (regenerated each browser session, but stable within a session).
 */
const FINGERPRINT_CACHE_KEY = 'batchhub_device_fp';

export function getDeviceFingerprint() {
  try {
    const cached = sessionStorage.getItem(FINGERPRINT_CACHE_KEY);
    if (cached) return cached;

    const fp = generateDeviceFingerprint();
    sessionStorage.setItem(FINGERPRINT_CACHE_KEY, fp);
    return fp;
  } catch {
    return generateDeviceFingerprint();
  }
}
