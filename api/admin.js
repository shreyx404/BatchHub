import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// ── Constants ──────────────────────────────────────────────────
const MAX_ATTEMPTS_PER_IP = 10;
const MAX_ATTEMPTS_PER_FINGERPRINT = 10;
const GLOBAL_MAX_ATTEMPTS_PER_DAY = 30;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── In-memory rate limiter (per-IP, survives within serverless warm instances) ──
const failedAttempts = new Map();

function isIpRateLimited(ip) {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.firstAttempt > WINDOW_MS) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS_PER_IP;
}

function recordIpFailedAttempt(ip) {
  const entry = failedAttempts.get(ip);
  if (!entry || Date.now() - entry.firstAttempt > WINDOW_MS) {
    failedAttempts.set(ip, { count: 1, firstAttempt: Date.now() });
  } else {
    entry.count++;
  }
}

function clearIpFailedAttempts(ip) {
  failedAttempts.delete(ip);
}

// ── In-memory rate limiter (per-fingerprint) ───────────────────
const fingerprintAttempts = new Map();

function isFingerprintRateLimited(fp) {
  if (!fp) return false;
  const entry = fingerprintAttempts.get(fp);
  if (!entry) return false;
  if (Date.now() - entry.firstAttempt > WINDOW_MS) {
    fingerprintAttempts.delete(fp);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS_PER_FINGERPRINT;
}

function recordFingerprintFailedAttempt(fp) {
  if (!fp) return;
  const entry = fingerprintAttempts.get(fp);
  if (!entry || Date.now() - entry.firstAttempt > WINDOW_MS) {
    fingerprintAttempts.set(fp, { count: 1, firstAttempt: Date.now() });
  } else {
    entry.count++;
  }
}

function clearFingerprintFailedAttempts(fp) {
  if (fp) fingerprintAttempts.delete(fp);
}

// ── Cloudflare Turnstile verification ──────────────────────────
async function verifyTurnstileToken(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Skip if not configured (dev/demo mode)
  if (!token) return false; // Token required when secret is configured

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: ip,
      }),
    });
    const data = await response.json();
    return data.success === true;
  } catch {
    // If Cloudflare is unreachable, fail open to avoid locking out admins
    console.error('Turnstile verification failed — network error');
    return true;
  }
}

// ── Global rate limiter via Supabase ───────────────────────────
async function checkGlobalRateLimit(supabase) {
  try {
    const cutoff = new Date(Date.now() - WINDOW_MS).toISOString();
    const { count, error } = await supabase
      .from('admin_login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('success', false)
      .gte('attempted_at', cutoff);

    if (error) {
      console.error('Global rate limit check error:', error);
      return false; // Fail open
    }
    return (count || 0) >= GLOBAL_MAX_ATTEMPTS_PER_DAY;
  } catch {
    return false; // Fail open
  }
}

async function logLoginAttempt(supabase, { ip, fingerprint, success }) {
  try {
    await supabase.from('admin_login_attempts').insert({
      ip: ip || 'unknown',
      fingerprint: fingerprint || null,
      success,
    });
  } catch (err) {
    console.error('Failed to log login attempt:', err);
  }
}

async function cleanupOldAttempts(supabase) {
  try {
    const cutoff = new Date(Date.now() - WINDOW_MS * 7).toISOString(); // Clean up entries older than 7 days
    await supabase
      .from('admin_login_attempts')
      .delete()
      .lt('attempted_at', cutoff);
  } catch {
    // Non-critical — cleanup failure is acceptable
  }
}

// ── Timing-safe string comparison ──────────────────────────────
function timingSafeCompare(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// ── Payload validators (whitelist allowed fields) ──────────────
const POST_FIELDS = ['title', 'content', 'type', 'subject_id', 'is_pinned', 'status', 'due_date', 'created_at', 'tags', 'links'];
const SUBJECT_FIELDS = ['name', 'code', 'color'];
const ATTACHMENT_FIELDS = ['post_id', 'file_name', 'file_url', 'file_size', 'file_type'];

function pick(obj, fields) {
  if (!obj || typeof obj !== 'object') return {};
  const result = {};
  for (const key of fields) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

// ── CORS helper ────────────────────────────────────────────────
function setCorsHeaders(res) {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// ── Main handler ───────────────────────────────────────────────
export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  const { fingerprint, turnstileToken } = req.body || {};

  // ── Layer 1: Per-IP rate limit (in-memory) ──
  if (isIpRateLimited(clientIp)) {
    res.setHeader('Retry-After', '86400');
    return res.status(429).json({ error: 'Too many failed attempts (10/10). Account locked for 24 hours. Please try again later.' });
  }

  // ── Layer 2: Per-device fingerprint rate limit (in-memory) ──
  if (isFingerprintRateLimited(fingerprint)) {
    res.setHeader('Retry-After', '86400');
    return res.status(429).json({ error: 'This device has been locked out due to too many failed attempts. Please try again in 24 hours.' });
  }

  // ── Layer 3: Cloudflare Turnstile CAPTCHA verification ──
  const turnstileValid = await verifyTurnstileToken(turnstileToken, clientIp);
  if (!turnstileValid) {
    return res.status(403).json({ error: 'Bot verification failed. Please refresh the page and try again.' });
  }

  // ── Layer 4: Verify Authorization ──
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set.');
    return res.status(500).json({ error: 'Admin authentication is not configured on the server.' });
  }

  // Initialize Supabase early — needed for global rate limit check and logging
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let supabase = null;

  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ── Layer 5: Global site-wide rate limit (Supabase persistent) ──
    const globalLimited = await checkGlobalRateLimit(supabase);
    if (globalLimited) {
      res.setHeader('Retry-After', '86400');
      return res.status(429).json({
        error: `Admin login is temporarily disabled due to excessive failed attempts across the site (${GLOBAL_MAX_ATTEMPTS_PER_DAY}/day limit reached). Please try again later.`
      });
    }
  }

  if (!authHeader || !timingSafeCompare(authHeader, `Bearer ${adminPassword}`)) {
    // Record failure across all tracking layers
    recordIpFailedAttempt(clientIp);
    recordFingerprintFailedAttempt(fingerprint);

    // Log to Supabase for persistent global tracking
    if (supabase) {
      await logLoginAttempt(supabase, { ip: clientIp, fingerprint, success: false });
    }

    const ipEntry = failedAttempts.get(clientIp);
    const remaining = Math.max(0, MAX_ATTEMPTS_PER_IP - (ipEntry?.count || 1));
    return res.status(401).json({
      error: remaining > 0
        ? `Unauthorized. Invalid admin password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Too many failed attempts (10/10). Account locked for 24 hours.'
    });
  }

  // ── Auth successful ──
  clearIpFailedAttempts(clientIp);
  clearFingerprintFailedAttempts(fingerprint);

  // Log success and clean up old entries
  if (supabase) {
    await logLoginAttempt(supabase, { ip: clientIp, fingerprint, success: true });
    cleanupOldAttempts(supabase); // Fire-and-forget cleanup
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server missing Supabase keys.' });
  }

  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  }

  // ── Process the action with validated payloads ──
  const { action, payload } = req.body;

  if (!action || typeof action !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid action.' });
  }

  try {
    let result;
    switch (action) {
      case 'createPost':
        result = await supabase.from('posts').insert(pick(payload, POST_FIELDS)).select('*, subjects(*), attachments(*)').single();
        break;
      case 'updatePost': {
        if (!payload?.id) return res.status(400).json({ error: 'Missing post ID.' });
        const updates = pick(payload.updates, POST_FIELDS);
        result = await supabase.from('posts').update(updates).eq('id', payload.id).select('*, subjects(*), attachments(*)').single();
        break;
      }
      case 'deletePost':
        if (!payload?.id) return res.status(400).json({ error: 'Missing post ID.' });
        result = await supabase.from('posts').delete().eq('id', payload.id);
        break;
      case 'createSubject':
        result = await supabase.from('subjects').insert(pick(payload, SUBJECT_FIELDS)).select().single();
        break;
      case 'updateSubject': {
        if (!payload?.id) return res.status(400).json({ error: 'Missing subject ID.' });
        const updates = pick(payload.updates, SUBJECT_FIELDS);
        result = await supabase.from('subjects').update(updates).eq('id', payload.id).select().single();
        break;
      }
      case 'deleteSubject':
        if (!payload?.id) return res.status(400).json({ error: 'Missing subject ID.' });
        result = await supabase.from('subjects').delete().eq('id', payload.id);
        break;
      case 'createAttachment':
        result = await supabase.from('attachments').insert(pick(payload, ATTACHMENT_FIELDS)).select().single();
        break;
      case 'deleteAttachment':
        if (!payload?.id) return res.status(400).json({ error: 'Missing attachment ID.' });
        result = await supabase.from('attachments').delete().eq('id', payload.id);
        break;
      default:
        return res.status(400).json({ error: 'Unknown action.' });
    }

    if (result.error) {
      throw result.error;
    }

    return res.status(200).json({ data: result.data });
  } catch (error) {
    console.error('Admin API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

