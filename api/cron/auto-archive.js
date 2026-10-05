import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// ── Timing-safe string comparison ──────────────────────────────
function timingSafeCompare(a, b) {
  if (!a || !b) return false;
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Vercel Cron Job — Auto-archive expired posts
 *
 * Runs on a schedule (configured in vercel.json) to archive all
 * published posts whose due_date is more than 24 hours in the past.
 *
 * Protected by CRON_SECRET to prevent unauthorized invocations.
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow GET (Vercel cron uses GET)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const cronSecret = process.env.CRON_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const authHeader = req.headers.authorization;
  const isVercelCron = req.headers['x-vercel-cron'] === '1';

  let isAuthorized = false;

  // 1. Authorized via CRON_SECRET bearer token
  if (cronSecret && authHeader && timingSafeCompare(authHeader, `Bearer ${cronSecret}`)) {
    isAuthorized = true;
  }
  // 2. Authorized via ADMIN_PASSWORD bearer token
  else if (adminPassword && authHeader && timingSafeCompare(authHeader, `Bearer ${adminPassword}`)) {
    isAuthorized = true;
  }
  // 3. Authorized via Vercel's internal cron header (trusted platform header)
  else if (isVercelCron) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    // If CRON_SECRET is not configured on the server and not from Vercel cron, fail closed
    if (!cronSecret) {
      console.error('[auto-archive cron] CRON_SECRET environment variable is not set.');
      return res.status(500).json({ error: 'Cron authentication is not configured on the server.' });
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase not configured.' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // 24 hours ago
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('posts')
      .update({ status: 'archived' })
      .eq('status', 'published')
      .not('due_date', 'is', null)
      .lt('due_date', cutoff)
      .select('id, title');

    if (error) throw error;

    const count = data?.length || 0;
    console.log(`[auto-archive cron] Archived ${count} expired post(s).`);

    return res.status(200).json({
      success: true,
      archived: count,
      posts: data || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[auto-archive cron] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
