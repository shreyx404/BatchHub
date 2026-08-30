import { createClient } from '@supabase/supabase-js';

function setCorsHeaders(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  const origin = allowedOrigin || req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase credentials not configured on server.' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { start, end, status } = req.query || req.body || {};

  try {
    let query = supabase
      .from('posts')
      .select('*, subjects(*)')
      .not('due_date', 'is', null);

    if (status && ['published', 'archived'].includes(status)) {
      query = query.eq('status', status);
    } else {
      query = query.in('status', ['published', 'archived']);
    }

    if (start) {
      query = query.gte('due_date', start);
    }
    if (end) {
      query = query.lte('due_date', end);
    }

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;

    return res.status(200).json({ data });
  } catch (error) {
    console.error('Calendar API Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch calendar deadlines.' });
  }
}
