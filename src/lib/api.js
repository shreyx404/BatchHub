import { supabase, isSupabaseConfigured } from './supabase.js';
import { DEMO_POSTS, DEMO_SUBJECTS, DEMO_NOTES, DEMO_SETTINGS } from './demoData.js';
import { DEFAULT_COLLEGE_MATERIAL_URL, SETTING_KEYS } from './constants.js';


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
    if (response.status === 401) {
      try {
        sessionStorage.removeItem('batchhub_admin_token');
      } catch {}
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Admin request failed');
  }

  const { data } = await response.json();
  return data;
}

/* ============================================================
   Posts API
   ============================================================ */

export const AUTO_ARCHIVE_CUTOFF_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch published posts with optional filtering.
 */
export async function fetchPosts({ type, subjectId, search, status = 'published' } = {}) {
  const now = new Date();
  const archiveCutoff = new Date(now.getTime() - AUTO_ARCHIVE_CUTOFF_MS);

  if (!isSupabaseConfigured()) {
    return filterDemoPosts({ type, subjectId, search, status, archiveCutoff });
  }

  let query = supabase
    .from('posts')
    .select('*, subjects(*)');

  if (status === 'archived') {
    // Query both published and archived so recently expired posts (> 24h past due)
    // are included even before the background database update finishes.
    query = query.in('status', ['published', 'archived']);
  } else {
    query = query.eq('status', status);
  }

  query = query
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

  // 1. Dynamic filtering & status mapping based on 24h expiration rule
  let processedData = [];
  let foundExpiredPublished = false;

  for (const post of data) {
    const isExpired = post.due_date && new Date(post.due_date) < archiveCutoff;

    if (status === 'published') {
      // Exclude posts whose due_date passed > 24 hours ago
      if (isExpired) {
        foundExpiredPublished = true;
        continue;
      }
      processedData.push(post);
    } else if (status === 'archived') {
      // Include posts explicitly marked archived OR published posts whose due_date passed > 24 hours ago
      if (post.status === 'archived') {
        processedData.push(post);
      } else if (post.status === 'published' && isExpired) {
        foundExpiredPublished = true;
        processedData.push({ ...post, status: 'archived' });
      }
    } else {
      processedData.push(post);
    }
  }

  // If we detected any published post that has passed the 24h auto-archive cutoff,
  // trigger opportunistic database auto-archive in the background
  if (foundExpiredPublished) {
    autoArchiveExpiredPosts().catch(() => {});
  }

  // 2. Dynamic unpinning: if post has explicit pinned_until or due_date that has passed, treat it as unpinned.
  processedData = processedData.map(post => {
    if (post.is_pinned) {
      if (post.pinned_until) {
        if (new Date(post.pinned_until) < now) {
          return { ...post, is_pinned: false };
        }
      } else if (post.due_date && new Date(post.due_date) < now) {
        return { ...post, is_pinned: false };
      }
    }
    return post;
  });

  // 3. Client-side sort: Pinned first, then by due_date ascending (nulls at the very end), then created_at ascending
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
    const cutoff = Date.now() - AUTO_ARCHIVE_CUTOFF_MS;
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

  // 1. If admin token is available, request through admin API
  const token = sessionStorage.getItem('batchhub_admin_token');
  if (token) {
    try {
      const archived = await adminRequest('autoArchiveExpired');
      return archived?.length || 0;
    } catch (err) {
      console.error('Admin auto-archive check failed (non-fatal):', err);
    }
  }

  // 2. Otherwise trigger through opportunistic calendar endpoint (runs with server service role)
  try {
    const res = await fetch('/api/calendar?autoArchive=1');
    if (res.ok) {
      const json = await res.json();
      return json.archived || 0;
    }
  } catch (err) {
    console.error('Opportunistic auto-archive check failed (non-fatal):', err);
  }

  return 0;
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
 * Supports options: { includeDrafts, status }
 */
export async function fetchCalendarDeadlines(year, month, options = {}) {
  const { includeDrafts = false, status = null } = options;

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
        if (!p.due_date) return false;
        if (status && status !== 'all') {
          if (p.status !== status) return false;
        } else if (!includeDrafts && p.status === 'draft') {
          return false;
        }
        const d = new Date(p.due_date);
        return d >= start && d <= end;
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }

  // 1. If admin token is available, query through admin endpoint with service role
  const token = sessionStorage.getItem('batchhub_admin_token');
  if (token) {
    try {
      return await adminRequest('getCalendarDeadlines', {
        start: startIso,
        end: endIso,
        includeDrafts: Boolean(includeDrafts),
        status: status && status !== 'all' ? status : undefined,
      });
    } catch {
      // Fallback to public fetch if admin request fails
    }
  }

  // 2. Try fetching from public /api/calendar serverless endpoint (uses service role to ensure all archived deliverables are retrieved)
  try {
    const statusParam = status && status !== 'all' ? `&status=${encodeURIComponent(status)}` : '';
    const res = await fetch(`/api/calendar?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}${statusParam}`);
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
  let query = supabase
    .from('posts')
    .select('*, subjects(*)')
    .not('due_date', 'is', null)
    .gte('due_date', startIso)
    .lte('due_date', endIso);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  } else {
    query = query.in('status', ['published', 'archived']);
  }

  const { data, error } = await query.order('due_date', { ascending: true });

  if (error) throw error;

  const archiveCutoff = new Date(Date.now() - AUTO_ARCHIVE_CUTOFF_MS);
  const mapped = (data || []).map(post => {
    if (post.status === 'published' && post.due_date && new Date(post.due_date) < archiveCutoff) {
      return { ...post, status: 'archived' };
    }
    return post;
  });

  return mapped;
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
   App Settings API
   ============================================================ */

export async function fetchSetting(key, defaultValue = null) {
  if (!isSupabaseConfigured()) {
    return DEMO_SETTINGS[key] ?? defaultValue;
  }

  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) throw error;
    return data?.value ?? defaultValue;
  } catch (err) {
    console.error(`Failed to fetch setting "${key}":`, err);
    return defaultValue;
  }
}

export async function updateSetting(key, value) {
  if (!isSupabaseConfigured()) {
    DEMO_SETTINGS[key] = value;
    return { key, value, updated_at: new Date().toISOString() };
  }

  return await adminRequest('updateSetting', { key, value });
}

export async function fetchCollegeMaterialUrl() {
  return await fetchSetting(SETTING_KEYS.COLLEGE_MATERIAL_URL, DEFAULT_COLLEGE_MATERIAL_URL);
}

export async function updateCollegeMaterialUrl(url) {
  return await updateSetting(SETTING_KEYS.COLLEGE_MATERIAL_URL, url);
}

/* ============================================================
   Notes API
   ============================================================ */

/**
 * Fetch all published notes (public).
 */
export async function fetchNotes({ search, subjectId } = {}) {
  if (!isSupabaseConfigured()) {
    let filtered = [...DEMO_NOTES];
    if (subjectId) filtered = filtered.filter((n) => n.subject_id === subjectId);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.subtitle && n.subtitle.toLowerCase().includes(q)) ||
          (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    if (subjectId) {
      return filtered.sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', undefined, { numeric: true, sensitivity: 'base' })
      );
    }
    return filtered.sort((a, b) => a.sort_order - b.sort_order);
  }

  let query = supabase
    .from('notes')
    .select('*, subjects(*)');

  if (subjectId) {
    query = query.eq('subject_id', subjectId).order('title', { ascending: true });
  } else {
    query = query.order('sort_order', { ascending: true }).order('created_at', { ascending: false });
  }

  if (search) {
    const escaped = search.replace(/[%_\\]/g, '\\$&');
    query = query.or(`title.ilike.%${escaped}%,subtitle.ilike.%${escaped}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  if (subjectId && data) {
    return [...data].sort((a, b) =>
      (a.title || '').localeCompare(b.title || '', undefined, { numeric: true, sensitivity: 'base' })
    );
  }
  return data;
}

/**
 * Fetch all notes for admin.
 */
export async function fetchAllNotes() {
  if (!isSupabaseConfigured()) {
    return [...DEMO_NOTES];
  }
  return await adminRequest('getAllNotes');
}

/**
 * Create a new note.
 */
export async function createNote(noteData) {
  if (!isSupabaseConfigured()) {
    const newNote = {
      id: `demo-note-${Date.now()}`,
      ...noteData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subjects: DEMO_SUBJECTS.find((s) => s.id === noteData.subject_id) || null,
    };
    DEMO_NOTES.push(newNote);
    return newNote;
  }
  return await adminRequest('createNote', noteData);
}

/**
 * Update a note.
 */
export async function updateNote(id, updates) {
  if (!isSupabaseConfigured()) {
    const idx = DEMO_NOTES.findIndex((n) => n.id === id);
    if (idx === -1) throw new Error('Note not found');
    DEMO_NOTES[idx] = {
      ...DEMO_NOTES[idx],
      ...updates,
      updated_at: new Date().toISOString(),
      subjects: updates.subject_id
        ? DEMO_SUBJECTS.find((s) => s.id === updates.subject_id) || null
        : DEMO_NOTES[idx].subjects,
    };
    return DEMO_NOTES[idx];
  }
  return await adminRequest('updateNote', { id, updates });
}

/**
 * Delete a note.
 */
export async function deleteNote(id) {
  if (!isSupabaseConfigured()) {
    const idx = DEMO_NOTES.findIndex((n) => n.id === id);
    if (idx !== -1) DEMO_NOTES.splice(idx, 1);
    return;
  }
  await adminRequest('deleteNote', { id });
}

/* ============================================================
   Helpers
   ============================================================ */


function filterDemoPosts({ type, subjectId, search, status, archiveCutoff }) {
  const cutoff = archiveCutoff || new Date(Date.now() - AUTO_ARCHIVE_CUTOFF_MS);

  let filtered = [];
  for (const p of DEMO_POSTS) {
    const isExpired = p.due_date && new Date(p.due_date) < cutoff;
    if (status === 'published') {
      if (p.status === 'published' && !isExpired) {
        filtered.push(p);
      }
    } else if (status === 'archived') {
      if (p.status === 'archived') {
        filtered.push(p);
      } else if (p.status === 'published' && isExpired) {
        filtered.push({ ...p, status: 'archived' });
      }
    } else if (status) {
      if (p.status === status) filtered.push(p);
    } else {
      filtered.push(p);
    }
  }

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
    if (post.is_pinned) {
      if (post.pinned_until) {
        if (new Date(post.pinned_until) < now) {
          return { ...post, is_pinned: false };
        }
      } else if (post.due_date && new Date(post.due_date) < now) {
        return { ...post, is_pinned: false };
      }
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
