import { supabase, isSupabaseConfigured } from './supabase';
import { DEMO_POSTS, DEMO_SUBJECTS } from './demoData';

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
    .select('*, subjects(*), attachments(*)')
    .eq('status', status)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (type) query = query.eq('type', type);
  if (subjectId) query = query.eq('subject_id', subjectId);
  if (search) {
    // Escape PostgREST/SQL wildcard characters to prevent filter manipulation
    const escaped = search.replace(/[%_\\]/g, '\\$&');
    query = query.or(`title.ilike.%${escaped}%,content.ilike.%${escaped}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Fetch all posts (any status) for admin.
 */
export async function fetchAllPosts() {
  if (!isSupabaseConfigured()) {
    return DEMO_POSTS;
  }

  const { data, error } = await supabase
    .from('posts')
    .select('*, subjects(*), attachments(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
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

  const { data, error } = await supabase
    .from('posts')
    .select('*, subjects(*), attachments(*)')
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
 * Create a new post.
 */
export async function createPost(postData) {
  if (!isSupabaseConfigured()) {
    const newPost = {
      id: `demo-${Date.now()}`,
      ...postData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attachments: [],
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
   Attachments / Storage API
   ============================================================ */

export async function uploadFile(file) {
  if (!isSupabaseConfigured()) {
    return {
      file_name: file.name,
      file_url: URL.createObjectURL(file),
      file_size: file.size,
      file_type: file.type,
    };
  }

  // Use crypto UUID + sanitized filename to prevent collisions and path traversal
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${crypto.randomUUID()}-${sanitizedName}`;
  const { error: uploadError } = await supabase.storage
    .from('attachments')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('attachments')
    .getPublicUrl(fileName);

  return {
    file_name: file.name,
    file_url: publicUrl,
    file_size: file.size,
    file_type: file.type,
  };
}

export async function createAttachment(attachmentData) {
  if (!isSupabaseConfigured()) {
    return { id: `demo-att-${Date.now()}`, ...attachmentData, created_at: new Date().toISOString() };
  }

  return await adminRequest('createAttachment', attachmentData);
}

export async function deleteAttachment(id) {
  if (!isSupabaseConfigured()) return;

  await adminRequest('deleteAttachment', { id });
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
  // Pinned first, then by created_at desc
  filtered.sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1;
    return new Date(b.created_at) - new Date(a.created_at);
  });
  return filtered;
}
