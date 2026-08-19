import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Verify Authorization
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.VITE_ADMIN_PASSWORD;

  if (adminPassword) {
    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
      return res.status(401).json({ error: 'Unauthorized. Invalid admin password.' });
    }
  }

  // 2. Initialize Supabase Admin Client
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server missing Supabase keys' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // 3. Process the action
  const { action, payload } = req.body;

  try {
    let result;
    switch (action) {
      case 'createPost':
        result = await supabase.from('posts').insert(payload).select('*, subjects(*), attachments(*)').single();
        break;
      case 'updatePost':
        result = await supabase.from('posts').update(payload.updates).eq('id', payload.id).select('*, subjects(*), attachments(*)').single();
        break;
      case 'deletePost':
        result = await supabase.from('posts').delete().eq('id', payload.id);
        break;
      case 'createSubject':
        result = await supabase.from('subjects').insert(payload).select().single();
        break;
      case 'updateSubject':
        result = await supabase.from('subjects').update(payload.updates).eq('id', payload.id).select().single();
        break;
      case 'deleteSubject':
        result = await supabase.from('subjects').delete().eq('id', payload.id);
        break;
      case 'createAttachment':
        result = await supabase.from('attachments').insert(payload).select().single();
        break;
      case 'deleteAttachment':
        result = await supabase.from('attachments').delete().eq('id', payload.id);
        break;
      default:
        return res.status(400).json({ error: 'Unknown action' });
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
