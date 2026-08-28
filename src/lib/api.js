import { supabase, isSupabaseConfigured } from './supabase.js';
import { DEMO_POSTS, DEMO_SUBJECTS } from './demoData.js';

async function adminRequest(action, payload) {
  const token = sessionStorage.getItem('batchhub_admin_token');
  const response = await fetch('/api/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify({ action, payload })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Admin request failed');
  }

  const { data } = await response.json();
  return data;
}

/* ============================================================
   Posts API
   ============================================================ */

/**
 * Fetch published posts with optional filtering.
 */
export async function fetchPosts({ type, subjectId, search, status = 'published' } = {}) {
  if (!isSupabaseConfigured()) {
    return filterDemoPosts({ type, subjectId, search, status });
  }

  let query = supabase
    .from('posts')
    .select('*, subjects(*)')
    .eq('status', status)
    .order('is_pinned', { ascending: false })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

  if (type) query = query.eq('type', type);
  if (subjectId) query = query.eq('subject_id', subjectId);
  if (search) {
    // Escape PostgREST/SQL wildcard characters to prevent filter manipulation
    const escaped = search.replace(/[%_\\]/g, '\\$&');
    query = query.or(`title.ilike.%${escaped}%,content.ilike.%${escaped}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Dynamic unpinning: if a post is pinned but its due date has passed, treat it as unpinned.
  const now = new Date();
  const processedData = data.map(post => {
    if (post.is_pinned && post.due_date && new Date(post.due_date) < now) {
      return { ...post, is_pinned: false };
    }
    return post;
  });

  // Client-side sort: Pinned first, then by due_date ascending (nulls at the very end), then created_at ascending
  processedData.sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1;
    if (a.due_date && b.due_date) {
      const diff = new Date(a.due_date) - new Date(b.due_date);
      if (diff !== 0) return diff;
      return new Date(a.created_at) - new Date(b.created_at);
    }
    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;
    return new Date(a.created_at) - new Date(b.created_at);
  });

  return processedData;
}

/**
 * Auto-archive published posts whose due_date passed more than 24 hours ago.
 * Runs silently — errors are logged but never thrown to avoid blocking the UI.
 */
export async function autoArchiveExpiredPosts() {
  if (!isSupabaseConfigured()) {
    // Demo mode: mutate in-memory array
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    let count = 0;
    for (const post of DEMO_POSTS) {
      if (
        post.status === 'published' &&
        post.due_date &&
        new Date(post.due_date).getTime() < cutoff
      ) {
        post.status = 'archived';
        post.updated_at = new Date().toISOString();
        count++;
      }
    }
    return count;
  }

  try {
    const archived = await adminRequest('autoArchiveExpired');
    return archived?.length || 0;
  } catch (err) {
    console.error('Auto-archive check failed (non-fatal):', err);
    return 0;
  }
}

/**
 * Fetch all posts (any status: published, draft, archived) for admin.
 */
export async function fetchAllPosts() {
  if (!isSupabaseConfigured()) {
    // Run auto-archive before returning demo posts
    await autoArchiveExpiredPosts();
    return DEMO_POSTS;
  }

  // Fire auto-archive in the background without blocking the query
  autoArchiveExpiredPosts().catch(() => {});
  return await adminRequest('getAllPosts');
}

/**
 * Fetch a single post by ID.
 */
export async function fetchPost(id) {
  if (!isSupabaseConfigured()) {
    const post = DEMO_POSTS.find((p) => p.id === id);
    if (!post) throw new Error('Post not found');
    return post;
  }

  // If admin token is available, query through admin endpoint to access drafts/archived posts
  const token = sessionStorage.getItem('batchhub_admin_token');
  if (token) {
    try {
      return await adminRequest('getPost', { id });
    } catch {
      // Fallback to public client if admin request fails
    }
  }

  const { data, error } = await supabase
    .from('posts')
    .select('*, subjects(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch upcoming deadlines (posts with due_date in the future).
 */
export async function fetchUpcomingDeadlines() {
  if (!isSupabaseConfigured()) {
    const now = new Date().toISOString();
    return DEMO_POSTS
      .filter((p) => p.due_date && p.due_date > now && p.status === 'published')
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }

  const { data, error } = await supabase
    .from('posts')
    .select('*, subjects(*)')
    .eq('status', 'published')
    .not('due_date', 'is', null)
    .gte('due_date', new Date().toISOString())
    .order('due_date', { ascending: true })
    .limit(10);

  if (error) throw error;
  return data;
}

/**
 * Fetch posts with due_date in a given month (±6 days for calendar grid padding).
 */
export async function fetchCalendarDeadlines(year, month) {
  // Build date range: start of month minus 6 days, end of month plus 6 days
  const start = new Date(year, month, 1);
  start.setDate(start.getDate() - 6);
  const end = new Date(year, month + 1, 0);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const startIso = start.toISOString();
  const endIso = end.toISOString();

  if (!isSupabaseConfigured()) {
    return DEMO_POSTS
      .filter((p) => {
        if (!p.due_date || (p.status !== 'published' && p.status !== 'archived')) return false;
        const d = new Date(p.due_date);
        return d >= start && d <= end;
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }

  // 1. If admin token is available, query through admin endpoint with service role
  const token = sessionStorage.getItem('batchhub_admin_token');
  if (token) {
    try {
      return await adminRequest('getCalendarDeadlines', { start: startIso, end: endIso });
    } catch {
      // Fallback to public fetch if admin request fails
    }
  }

  // 2. Try fetching from public /api/calendar serverless endpoint (uses service role to ensure all archived deliverables are retrieved)
  try {
    const res = await fetch(`/api/calendar?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {
    // Fallback to direct client query if serverless endpoint is not reachable
  }

  // 3. Fallback: Direct Supabase client query with anon key
  const { data, error } = await supabase
    .from('posts')
    .select('*, subjects(*)')
    .in('status', ['published', 'archived'])
    .not('due_date', 'is', null)
    .gte('due_date', startIso)
    .lte('due_date', endIso)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Create a new post.
 */
export async function createPost(postData) {
  if (!isSupabaseConfigured()) {
    const newPost = {
      id: `demo-${Date.now()}`,
      ...postData,
      created_at: postData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_POSTS.unshift(newPost);
    return newPost;
  }

  return await adminRequest('createPost', postData);
}

/**
 * Update a post.
 */
export async function updatePost(id, updates) {
  if (!isSupabaseConfigured()) {
    const idx = DEMO_POSTS.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Post not found');
    DEMO_POSTS[idx] = { ...DEMO_POSTS[idx], ...updates, updated_at: new Date().toISOString() };
    return DEMO_POSTS[idx];
  }

  return await adminRequest('updatePost', { id, updates });
}

/**
 * Delete a post.
 */
export async function deletePost(id) {
  if (!isSupabaseConfigured()) {
    const idx = DEMO_POSTS.findIndex((p) => p.id === id);
    if (idx !== -1) DEMO_POSTS.splice(idx, 1);
    return;
  }

  await adminRequest('deletePost', { id });
}

/* ============================================================
   Subjects API
   ============================================================ */

export async function fetchSubjects() {
  if (!isSupabaseConfigured()) {
    return [...DEMO_SUBJECTS];
  }

  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function createSubject(subjectData) {
  if (!isSupabaseConfigured()) {
    const newSubject = { id: `demo-subj-${Date.now()}`, ...subjectData, created_at: new Date().toISOString() };
    DEMO_SUBJECTS.push(newSubject);
    return newSubject;
  }

  return await adminRequest('createSubject', subjectData);
}

export async function updateSubject(id, updates) {
  if (!isSupabaseConfigured()) {
    const idx = DEMO_SUBJECTS.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Subject not found');
    DEMO_SUBJECTS[idx] = { ...DEMO_SUBJECTS[idx], ...updates };
    return DEMO_SUBJECTS[idx];
  }

  return await adminRequest('updateSubject', { id, updates });
}

export async function deleteSubject(id) {
  if (!isSupabaseConfigured()) {
    const idx = DEMO_SUBJECTS.findIndex((s) => s.id === id);
    if (idx !== -1) DEMO_SUBJECTS.splice(idx, 1);
    return;
  }

  await adminRequest('deleteSubject', { id });
}

/* ============================================================
   Helpers
   ============================================================ */

function filterDemoPosts({ type, subjectId, search, status }) {
  let filtered = DEMO_POSTS.filter((p) => p.status === status);
  if (type) filtered = filtered.filter((p) => p.type === type);
  if (subjectId) filtered = filtered.filter((p) => p.subject_id === subjectId);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.content && p.content.toLowerCase().includes(q))
    );
  }
  const now = new Date();
  filtered = filtered.map(post => {
    if (post.is_pinned && post.due_date && new Date(post.due_date) < now) {
      return { ...post, is_pinned: false };
    }
    return post;
  });

  // Client-side sort: Pinned first, then by due_date ascending (nulls at the very end), then created_at ascending
  filtered.sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1;
    if (a.due_date && b.due_date) {
      const diff = new Date(a.due_date) - new Date(b.due_date);
      if (diff !== 0) return diff;
      return new Date(a.created_at) - new Date(b.created_at);
    }
    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;
    return new Date(a.created_at) - new Date(b.created_at);
  });
  return filtered;
}
