import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// ── Simple in-memory rate limiter ──────────────────────────────
// Tracks failed auth attempts per IP with a 10-attempt limit and 24-hour window / lockout.
const failedAttempts = new Map();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function isRateLimited(ip) {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.firstAttempt > WINDOW_MS) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip) {
  const entry = failedAttempts.get(ip);
  if (!entry || Date.now() - entry.firstAttempt > WINDOW_MS) {
    failedAttempts.set(ip, { count: 1, firstAttempt: Date.now() });
  } else {
    entry.count++;
  }
}

function clearFailedAttempts(ip) {
  failedAttempts.delete(ip);
}

// ── Timing-safe string comparison ──────────────────────────────
function timingSafeCompare(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Compare against self to keep constant-time but return false
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
  // Allow same-origin by default; restrict in production by setting ALLOWED_ORIGIN env var
  const origin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// ── Main handler ───────────────────────────────────────────────
export default async function handler(req, res) {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Rate limiting
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientIp)) {
    res.setHeader('Retry-After', '86400');
    return res.status(429).json({ error: 'Too many failed attempts (10/10). Account locked for 24 hours. Please try again later.' });
  }

  // 2. Verify Authorization
  // Supports both ADMIN_PASSWORD (preferred) and VITE_ADMIN_PASSWORD (legacy/fallback)
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set.');
    return res.status(500).json({ error: 'Admin authentication is not configured on the server.' });
  }

  if (!authHeader || !timingSafeCompare(authHeader, `Bearer ${adminPassword}`)) {
    recordFailedAttempt(clientIp);
    const entry = failedAttempts.get(clientIp);
    const remaining = Math.max(0, MAX_ATTEMPTS - (entry?.count || 1));
    return res.status(401).json({
      error: remaining > 0
        ? `Unauthorized. Invalid admin password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Too many failed attempts (10/10). Account locked for 24 hours.'
    });
  }

  // Clear failed attempts on successful authentication
  clearFailedAttempts(clientIp);

  // 3. Initialize Supabase Admin Client
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server missing Supabase keys.' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // 4. Process the action with validated payloads
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
