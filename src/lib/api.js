import { supabase, isSupabaseConfigured } from './supabase';
import { DEMO_POSTS, DEMO_SUBJECTS } from './demoData';

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
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
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

  const { data, error } = await supabase
    .from('posts')
    .insert(postData)
    .select('*, subjects(*), attachments(*)')
    .single();

  if (error) throw error;
  return data;
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

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select('*, subjects(*), attachments(*)')
    .single();

  if (error) throw error;
  return data;
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

  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
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

  const { data, error } = await supabase
    .from('subjects')
    .insert(subjectData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubject(id, updates) {
  if (!isSupabaseConfigured()) {
    const idx = DEMO_SUBJECTS.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Subject not found');
    DEMO_SUBJECTS[idx] = { ...DEMO_SUBJECTS[idx], ...updates };
    return DEMO_SUBJECTS[idx];
  }

  const { data, error } = await supabase
    .from('subjects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSubject(id) {
  if (!isSupabaseConfigured()) {
    const idx = DEMO_SUBJECTS.findIndex((s) => s.id === id);
    if (idx !== -1) DEMO_SUBJECTS.splice(idx, 1);
    return;
  }

  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) throw error;
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

  const fileName = `${Date.now()}-${file.name}`;
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

  const { data, error } = await supabase
    .from('attachments')
    .insert(attachmentData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAttachment(id) {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase.from('attachments').delete().eq('id', id);
  if (error) throw error;
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
