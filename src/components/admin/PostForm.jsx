import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, X, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import FileUploader from './FileUploader';
import { CONTENT_TYPE_LIST } from '../../lib/constants';
import { useSubjects } from '../../hooks/useSubjects';
import { createPost, updatePost, uploadFile, createAttachment } from '../../lib/api';

export default function PostForm({ existingPost, onSaved }) {
  const navigate = useNavigate();
  const { subjects } = useSubjects();
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'notice',
    subject_id: '',
    is_pinned: false,
    status: 'published',
    due_date: '',
    tags: '',
    links: [{ label: '', url: '' }],
  });

  useEffect(() => {
    if (existingPost) {
      setForm({
        title: existingPost.title || '',
        content: existingPost.content || '',
        type: existingPost.type || 'notice',
        subject_id: existingPost.subject_id || '',
        is_pinned: existingPost.is_pinned || false,
        status: existingPost.status || 'published',
        due_date: existingPost.due_date
          ? new Date(existingPost.due_date).toISOString().slice(0, 16)
          : '',
        tags: existingPost.tags?.join(', ') || '',
        links:
          existingPost.links?.length > 0
            ? existingPost.links
            : [{ label: '', url: '' }],
      });
    }
  }, [existingPost]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addLink = () => {
    setForm((prev) => ({
      ...prev,
      links: [...prev.links, { label: '', url: '' }],
    }));
  };

  const removeLink = (index) => {
    setForm((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const updateLink = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      links: prev.links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title: form.title.trim(),
        content: form.content.trim(),
        type: form.type,
        subject_id: form.subject_id || null,
        is_pinned: form.is_pinned,
        status: form.status,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        tags: form.tags
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        links: form.links.filter((l) => l.url.trim()),
      };

      let savedPost;
      if (existingPost) {
        savedPost = await updatePost(existingPost.id, postData);
      } else {
        savedPost = await createPost(postData);
      }

      // Upload files
      for (const file of files) {
        const uploaded = await uploadFile(file);
        await createAttachment({
          post_id: savedPost.id,
          ...uploaded,
        });
      }

      toast.success(existingPost ? 'Post updated!' : 'Post created!');
      onSaved?.();
      if (!existingPost) {
        navigate('/admin/posts');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-[var(--color-text)]">
        {existingPost ? 'Edit Post' : 'Create New Post'}
      </h2>

      {/* Title */}
      <Field label="Title" required>
        <input
          id="post-title"
          type="text"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Enter post title..."
          className="input-field"
        />
      </Field>

      {/* Type + Subject row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Type" required>
          <select
            id="post-type"
            value={form.type}
            onChange={(e) => updateField('type', e.target.value)}
            className="input-field"
          >
            {CONTENT_TYPE_LIST.map(({ value, emoji, label }) => (
              <option key={value} value={value}>
                {emoji} {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Subject">
          <select
            id="post-subject"
            value={form.subject_id}
            onChange={(e) => updateField('subject_id', e.target.value)}
            className="input-field"
          >
            <option value="">None</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code ? `${s.code} — ` : ''}{s.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Content */}
      <Field
        label="Content"
        extra={
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-[var(--color-accent-hover)] hover:underline flex items-center gap-1"
          >
            {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        }
      >
        {showPreview ? (
          <div className="min-h-[200px] p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] prose">
            <ReactMarkdown>{form.content || '*No content yet*'}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            id="post-content"
            value={form.content}
            onChange={(e) => updateField('content', e.target.value)}
            placeholder="Write post content in Markdown..."
            rows={10}
            className="input-field resize-y font-mono text-sm"
          />
        )}
      </Field>

      {/* Due date + Status + Pin */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Due Date">
          <input
            id="post-due-date"
            type="datetime-local"
            value={form.due_date}
            onChange={(e) => updateField('due_date', e.target.value)}
            className="input-field"
          />
        </Field>

        <Field label="Status">
          <select
            id="post-status"
            value={form.status}
            onChange={(e) => updateField('status', e.target.value)}
            className="input-field"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </Field>

        <Field label="Pin Post">
          <label className="flex items-center gap-2 h-11 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_pinned}
              onChange={(e) => updateField('is_pinned', e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--color-accent)]"
            />
            <span className="text-sm text-[var(--color-text)]">Pinned</span>
          </label>
        </Field>
      </div>

      {/* Tags */}
      <Field label="Tags" hint="Comma-separated (e.g. graded, individual)">
        <input
          id="post-tags"
          type="text"
          value={form.tags}
          onChange={(e) => updateField('tags', e.target.value)}
          placeholder="graded, individual, urgent"
          className="input-field"
        />
      </Field>

      {/* Links */}
      <Field label="Links">
        <div className="space-y-2">
          {form.links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateLink(i, 'label', e.target.value)}
                placeholder="Label"
                className="input-field flex-1"
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(i, 'url', e.target.value)}
                placeholder="https://..."
                className="input-field flex-[2]"
              />
              {form.links.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--color-text-dim)] hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addLink}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent-hover)] hover:underline"
          >
            <Plus size={12} />
            Add link
          </button>
        </div>
      </Field>

      {/* Attachments */}
      <Field label="Attachments">
        <FileUploader files={files} onFilesChange={setFiles} />
      </Field>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border)]">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-60 text-black text-sm font-semibold transition-colors"
        >
          {saving ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'Saving...' : existingPost ? 'Update Post' : 'Publish Post'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/posts')}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ── Field wrapper ── */
function Field({ label, hint, required, extra, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-[var(--color-text)]">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {extra}
      </div>
      {hint && (
        <p className="text-xs text-[var(--color-text-dim)] mb-1.5">{hint}</p>
      )}
      {children}
    </div>
  );
}
