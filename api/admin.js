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

// ── Global & Persistent rate limiters via Supabase ─────────────
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

async function isPersistentIpRateLimited(supabase, ip) {
  if (!supabase || !ip || ip === 'unknown') return false;
  try {
    const cutoff = new Date(Date.now() - WINDOW_MS).toISOString();
    const { count, error } = await supabase
      .from('admin_login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)
      .eq('success', false)
      .gte('attempted_at', cutoff);

    if (error) {
      console.error('Persistent IP rate limit check error:', error);
      return false;
    }
    return (count || 0) >= MAX_ATTEMPTS_PER_IP;
  } catch {
    return false;
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
  if (!a || !b) return false;
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// ── Payload validators (whitelist allowed fields) ──────────────
const POST_FIELDS = ['title', 'content', 'type', 'subject_id', 'is_pinned', 'status', 'due_date', 'created_at', 'tags', 'links'];
const SUBJECT_FIELDS = ['name', 'code', 'color'];

function pick(obj, fields) {
  if (!obj || typeof obj !== 'object') return {};
  const result = {};
  for (const key of fields) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

// ── CORS helper ────────────────────────────────────────────────
function setCorsHeaders(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  const origin = allowedOrigin || req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// ── Main handler ───────────────────────────────────────────────
export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  const { fingerprint, turnstileToken, action, payload } = req.body || {};

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

  // ── Layer 3: Cloudflare Turnstile CAPTCHA verification (on login / ping) ──
  if (action === '__ping' || turnstileToken) {
    const turnstileValid = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstileValid) {
      return res.status(403).json({ error: 'Bot verification failed. Please refresh the page and try again.' });
    }
  }

  // ── Layer 4: Verify Authorization ──
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set.');
    return res.status(500).json({ error: 'Admin authentication is not configured on the server.' });
  }

  // Initialize Supabase early — needed for persistent rate limit checks and logging
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let supabase = null;

  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Check persistent per-IP rate limit across serverless instances
    const ipPersistentLimited = await isPersistentIpRateLimited(supabase, clientIp);
    if (ipPersistentLimited) {
      res.setHeader('Retry-After', '86400');
      return res.status(429).json({ error: 'Too many failed attempts (10/10). Account locked for 24 hours. Please try again later.' });
    }

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

    // Log to Supabase for persistent tracking
    if (supabase) {
      await logLoginAttempt(supabase, { ip: clientIp, fingerprint, success: false });
    }

    let failedCount = failedAttempts.get(clientIp)?.count || 1;
    if (supabase && clientIp !== 'unknown') {
      try {
        const cutoff = new Date(Date.now() - WINDOW_MS).toISOString();
        const { count } = await supabase
          .from('admin_login_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('ip', clientIp)
          .eq('success', false)
          .gte('attempted_at', cutoff);
        if (count && count > failedCount) failedCount = count;
      } catch {}
    }

    const remaining = Math.max(0, MAX_ATTEMPTS_PER_IP - failedCount);
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

  // If this was an auth ping / login check, return success immediately
  if (action === '__ping') {
    return res.status(200).json({ data: { authenticated: true } });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server missing Supabase keys.' });
  }

  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  }

  // ── Process the action with validated payloads ──
  if (!action || typeof action !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid action.' });
  }

  try {
    let result;
    switch (action) {
      case 'getAllPosts':
        result = await supabase
          .from('posts')
          .select('*, subjects(*)')
          .order('created_at', { ascending: false });
        break;
      case 'getPost': {
        if (!payload?.id) return res.status(400).json({ error: 'Missing post ID.' });
        result = await supabase
          .from('posts')
          .select('*, subjects(*)')
          .eq('id', payload.id)
          .single();
        break;
      }
      case 'createPost':
        result = await supabase.from('posts').insert(pick(payload, POST_FIELDS)).select('*, subjects(*)').single();
        break;
      case 'updatePost': {
        if (!payload?.id) return res.status(400).json({ error: 'Missing post ID.' });
        const updates = pick(payload.updates, POST_FIELDS);
        result = await supabase.from('posts').update(updates).eq('id', payload.id).select('*, subjects(*)').single();
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
      case 'autoArchiveExpired': {
        // Archive all published posts whose due_date is more than 24 hours in the past
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        result = await supabase
          .from('posts')
          .update({ status: 'archived' })
          .eq('status', 'published')
          .not('due_date', 'is', null)
          .lt('due_date', cutoff)
          .select('id, title');
        break;
      }
      default:
        return res.status(400).json({ error: 'Unknown action.' });
    }

    if (result.error) {
      throw result.error;
    }

    return res.status(200).json({ data: result.data });
  } catch (error) {
    console.error('Admin API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

