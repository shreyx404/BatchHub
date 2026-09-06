import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, X, Link as LinkIcon, Eye, EyeOff, ChevronUp, ChevronDown, GripVertical, Pin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { CONTENT_TYPE_LIST } from '../../lib/constants';
import { useSubjects } from '../../hooks/useSubjects';
import { createPost, updatePost } from '../../lib/api';

function toLocalISOString(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function sanitizeLinkUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (/^(https?:\/\/|mailto:)/i.test(trimmed)) {
    return trimmed;
  }
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return '';
}

function getEffectivePinExpiry(isPinned, duration, customDate, dueDate) {
  if (!isPinned) return null;
  if (duration === 'forever') return null;
  if (duration === 'until_due') {
    if (!dueDate) return null;
    const d = new Date(dueDate);
    return isNaN(d.getTime()) ? null : d;
  }
  if (duration === '1d') return new Date(Date.now() + 24 * 60 * 60 * 1000);
  if (duration === '3d') return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  if (duration === '7d') return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  if (duration === '14d') return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  if (duration === 'custom') {
    if (!customDate) return null;
    const d = new Date(customDate);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatPinHelper(duration, customDate, dueDate) {
  if (duration === 'forever') {
    return 'Stays pinned indefinitely until manually unpinned.';
  }
  if (duration === 'until_due') {
    if (!dueDate) return 'Please specify a Due Date above to unpin on deadline.';
    const d = new Date(dueDate);
    if (isNaN(d.getTime())) return 'Invalid due date.';
    return `Automatically unpins on deadline: ${format(d, 'dd-MM-yyyy · h:mm a')}`;
  }
  if (duration === '1d') {
    return `Automatically unpins after 24h: ${format(new Date(Date.now() + 24 * 3600 * 1000), 'dd-MM-yyyy · h:mm a')}`;
  }
  if (duration === '3d') {
    return `Automatically unpins after 3 days: ${format(new Date(Date.now() + 3 * 24 * 3600 * 1000), 'dd-MM-yyyy · h:mm a')}`;
  }
  if (duration === '7d') {
    return `Automatically unpins after 1 week: ${format(new Date(Date.now() + 7 * 24 * 3600 * 1000), 'dd-MM-yyyy · h:mm a')}`;
  }
  if (duration === '14d') {
    return `Automatically unpins after 2 weeks: ${format(new Date(Date.now() + 14 * 24 * 3600 * 1000), 'dd-MM-yyyy · h:mm a')}`;
  }
  if (duration === 'custom') {
    if (!customDate) return 'Please pick an expiration date & time above.';
    const d = new Date(customDate);
    if (isNaN(d.getTime())) return 'Invalid expiration date.';
    return `Automatically unpins on: ${format(d, 'dd-MM-yyyy · h:mm a')}`;
  }
  return '';
}

export default function PostForm({ existingPost, onSaved }) {
  const navigate = useNavigate();
  const { subjects } = useSubjects();
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Drag & drop state for link reordering
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'notice',
    subject_id: '',
    is_pinned: false,
    pin_duration: 'forever',
    pinned_until: '',
    status: 'published',
    due_date: '',
    links: [{ label: '', url: '' }],
  });

  useEffect(() => {
    if (existingPost) {
      let initialPinDuration = 'forever';
      let initialPinnedUntil = '';

      if (existingPost.pinned_until) {
        initialPinnedUntil = toLocalISOString(existingPost.pinned_until);
        initialPinDuration = 'custom';
      } else if (existingPost.is_pinned && existingPost.due_date) {
        initialPinDuration = 'until_due';
      }

      setForm({
        title: existingPost.title || '',
        content: existingPost.content || '',
        type: existingPost.type || 'notice',
        subject_id: existingPost.subject_id || '',
        is_pinned: existingPost.is_pinned || false,
        pin_duration: initialPinDuration,
        pinned_until: initialPinnedUntil,
        status: existingPost.status || 'published',
        due_date: toLocalISOString(existingPost.due_date),
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

  const moveLink = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= form.links.length) return;
    setForm((prev) => {
      const updated = [...prev.links];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);
      return { ...prev, links: updated };
    });
  };

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== targetIndex) {
      moveLink(dragIndex, targetIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    // Sanitize and validate links
    const sanitizedLinks = [];
    for (const link of form.links) {
      const rawUrl = link.url?.trim();
      if (!rawUrl) continue;
      const cleanUrl = sanitizeLinkUrl(rawUrl);
      if (!cleanUrl) {
        toast.error(`Invalid URL scheme for link "${link.label || rawUrl}". Must start with http:// or https://`);
        return;
      }
      sanitizedLinks.push({
        label: link.label.trim() || cleanUrl,
        url: cleanUrl,
      });
    }

    setSaving(true);
    try {
      let parsedDueDate = null;
      if (form.due_date) {
        const d = new Date(form.due_date);
        if (!isNaN(d.getTime())) {
          parsedDueDate = d.toISOString();
        }
      }

      let parsedPinnedUntil = null;
      if (form.is_pinned) {
        const expiry = getEffectivePinExpiry(
          true,
          form.pin_duration,
          form.pinned_until,
          form.due_date
        );
        if (expiry) {
          parsedPinnedUntil = expiry.toISOString();
        }
      }

      const postData = {
        title: form.title.trim(),
        content: form.content.trim(),
        type: form.type,
        subject_id: form.subject_id || null,
        is_pinned: form.is_pinned,
        pinned_until: parsedPinnedUntil,
        status: form.status,
        due_date: parsedDueDate,
        ...(existingPost?.created_at && { created_at: existingPost.created_at }),
        tags: existingPost?.tags || [],
        links: sanitizedLinks,
      };

      if (existingPost) {
        await updatePost(existingPost.id, postData);
      } else {
        await createPost(postData);
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
            {CONTENT_TYPE_LIST.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
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
          <div className="min-h-[200px] p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] prose">
            <ReactMarkdown
              disallowedElements={['script', 'iframe', 'object', 'embed']}
              unwrapDisallowed
              urlTransform={(url) => {
                if (!url) return '';
                if (/^(https?:\/\/|mailto:)/i.test(url)) return url;
                if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(url)) return `https://${url}`;
                return '';
              }}
            >
              {form.content || '*No content yet*'}
            </ReactMarkdown>
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

      {/* Due date & Status row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Due Date & Time" hint="Optional deadline for submissions/tasks">
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
      </div>

      {/* Pin Post & Duration Controls */}
      <div className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="post-is-pinned"
              checked={form.is_pinned}
              onChange={(e) => updateField('is_pinned', e.target.checked)}
              className="w-4 h-4 accent-[var(--color-accent)]"
            />
            <span className="text-sm font-medium text-[var(--color-text)] flex items-center gap-1.5">
              <Pin size={14} className={form.is_pinned ? 'text-[var(--color-accent)] fill-current' : 'text-[var(--color-text-muted)]'} />
              Pinned (Keep at top)
            </span>
          </label>
          {form.is_pinned && (
            <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 bg-[var(--color-surface-2)] text-[var(--color-accent)] border border-[var(--color-accent)]/30">
              Pin Active
            </span>
          )}
        </div>

        {form.is_pinned && (
          <div className="pt-2.5 border-t border-[var(--color-border)] space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
                Pin Duration / Expiration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 'forever', label: 'Indefinite' },
                  { value: 'until_due', label: 'Until Due Date', disabled: !form.due_date },
                  { value: '1d', label: '24 Hours' },
                  { value: '3d', label: '3 Days' },
                  { value: '7d', label: '1 Week' },
                  { value: '14d', label: '2 Weeks' },
                  { value: 'custom', label: 'Custom Date' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => updateField('pin_duration', opt.value)}
                    className={`min-h-[40px] sm:min-h-[36px] px-3 py-2 text-xs font-medium transition-all border text-left flex items-center justify-between active:scale-[0.98] ${
                      opt.value === 'custom' ? 'col-span-2 sm:col-span-1' : ''
                    } ${
                      form.pin_duration === opt.value
                        ? 'bg-[var(--color-accent)] text-black font-semibold border-[var(--color-accent)]'
                        : opt.disabled
                        ? 'bg-[var(--color-surface-2)] text-[var(--color-text-dim)] border-[var(--color-border)] opacity-40 cursor-not-allowed'
                        : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border-[var(--color-border)]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {form.pin_duration === opt.value && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom date picker */}
            {form.pin_duration === 'custom' && (
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                  Select Unpin Date & Time
                </label>
                <input
                  id="post-pinned-until"
                  type="datetime-local"
                  value={form.pinned_until}
                  onChange={(e) => updateField('pinned_until', e.target.value)}
                  className="input-field"
                />
              </div>
            )}

            {/* Live Expiration Feedback */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-accent-hover)] bg-[var(--color-surface-2)] p-2.5 border border-[var(--color-border)]">
              <Clock size={13} className="shrink-0" />
              <span>
                {formatPinHelper(form.pin_duration, form.pinned_until, form.due_date)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Resource Links / Attachments (Rearrangable) */}
      <Field
        label="Resource Links / Attachments"
        hint="Add Google Drive, Google Classroom, GitHub, or submission URLs. Reorder using arrow buttons or drag handle."
      >
        <div className="space-y-2.5">
          {form.links.map((link, i) => (
            <div
              key={i}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[var(--color-surface)] p-2.5 sm:p-2 border transition-all ${
                dragOverIndex === i
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-glow)]'
                  : dragIndex === i
                  ? 'opacity-40 border-dashed border-[var(--color-border-light)]'
                  : 'border-[var(--color-border)]'
              }`}
            >
              {/* Reorder controls & Index badge */}
              <div className="flex items-center gap-1 shrink-0 self-start sm:self-center">
                <div
                  title="Drag to reorder link"
                  className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-text)] cursor-grab active:cursor-grabbing shrink-0 min-h-[34px] min-w-[30px] flex items-center justify-center touch-manipulation"
                >
                  <GripVertical size={16} />
                </div>
                <span className="text-[10px] font-mono text-[var(--color-text-dim)] w-5 text-center select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => moveLink(i, i - 1)}
                  title="Move link up"
                  aria-label="Move link up"
                  className="p-1 border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] disabled:opacity-30 disabled:pointer-events-none text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors min-h-[34px] min-w-[34px] sm:min-h-[28px] sm:min-w-[28px] flex items-center justify-center active:scale-95 touch-manipulation"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={i === form.links.length - 1}
                  onClick={() => moveLink(i, i + 1)}
                  title="Move link down"
                  aria-label="Move link down"
                  className="p-1 border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] disabled:opacity-30 disabled:pointer-events-none text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors min-h-[34px] min-w-[34px] sm:min-h-[28px] sm:min-w-[28px] flex items-center justify-center active:scale-95 touch-manipulation"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Link Inputs */}
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateLink(i, 'label', e.target.value)}
                  placeholder="Label (e.g. Assignment PDF / G-Drive)"
                  className="input-field flex-1 text-xs sm:text-sm min-h-[40px] sm:min-h-[38px]"
                />
                <div className="flex gap-2 flex-1 sm:flex-[2]">
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateLink(i, 'url', e.target.value)}
                    placeholder="https://..."
                    className="input-field flex-1 text-xs sm:text-sm min-h-[40px] sm:min-h-[38px]"
                  />
                  {form.links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(i)}
                      aria-label="Remove link"
                      title="Remove link"
                      className="p-2 min-h-[40px] min-w-[40px] sm:min-h-[38px] sm:min-w-[38px] flex items-center justify-center border border-[var(--color-border)] hover:bg-red-500/10 text-[var(--color-text-dim)] hover:text-red-400 active:bg-red-500/20 transition-colors shrink-0 touch-manipulation"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addLink}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent-hover)] hover:underline pt-1 min-h-[38px] sm:min-h-[34px] touch-manipulation"
          >
            <Plus size={14} />
            Add another link
          </button>
        </div>
      </Field>

      {/* Submit Action Bar (Sticky on mobile for seamless submission) */}
      <div className="sticky bottom-0 sm:static bg-[var(--color-bg)]/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none p-3 sm:p-0 -mx-4 sm:mx-0 pt-3 sm:pt-4 border-t border-[var(--color-border)] flex items-center gap-2.5 sm:gap-3 z-20 pb-safe">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] active:scale-[0.99] disabled:opacity-60 text-black text-sm font-semibold transition-all"
        >
          {saving ? (
            <div className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'Saving...' : existingPost ? 'Update Post' : 'Publish Post'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/posts')}
          className="flex-1 sm:flex-initial px-4 py-2.5 min-h-[44px] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-colors text-center"
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
