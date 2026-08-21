import { createClient } from '@supabase/supabase-js';

/**
 * Vercel Cron Job — Auto-archive expired posts
 *
 * Runs on a schedule (configured in vercel.json) to archive all
 * published posts whose due_date is more than 24 hours in the past.
 *
 * Protected by CRON_SECRET to prevent unauthorized invocations.
 */
export default async function handler(req, res) {
  // Only allow GET (Vercel cron uses GET)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Verify cron secret to prevent external abuse
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
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
