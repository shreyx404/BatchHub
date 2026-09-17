import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import { LoadingSpinner } from '../ui/LoadingState';
import EmptyState from '../ui/EmptyState';
import { useSubjects } from '../../hooks/useSubjects';
import { fetchAllNotes, createNote, updateNote, deleteNote } from '../../lib/api';

export default function NotesManager() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', subject_id: '', url: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const { subjects } = useSubjects();

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAllNotes();
      setNotes(data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ title: '', subtitle: '', subject_id: '', url: '', tags: '' });
    setEditTarget(null);
    setShowForm(true);
  };

  const openEdit = (note) => {
    setForm({
      title: note.title || '',
      subtitle: note.subtitle || '',
      subject_id: note.subject_id || '',
      url: note.url || '',
      tags: (note.tags || []).join(', '),
    });
    setEditTarget(note);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditTarget(null);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.url.trim()) {
      toast.error('URL is required');
      return;
    }
    if (!/^https?:\/\//i.test(form.url.trim())) {
      toast.error('URL must begin with http:// or https://');
      return;
    }

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      subject_id: form.subject_id || null,
      url: form.url.trim(),
      tags: form.tags
        ? form.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
        : [],
    };

    setSaving(true);
    try {
      if (editTarget) {
        await updateNote(editTarget.id, payload);
        toast.success('Note updated');
      } else {
        await createNote(payload);
        toast.success('Note created');
      }
      closeForm();
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNote(deleteTarget.id);
      toast.success('Note deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Notes</h2>
        <button
          onClick={openCreate}
          className="btn-primary flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors"
        >
          <Plus size={14} />
          Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <EmptyState title="No notes yet" description="Add study notes with external URLs for your batch." />
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-all group"
            >
              {/* Subject color indicator */}
              <div
                className="w-2.5 h-2.5 rotate-45 shrink-0"
                style={{ background: note.subjects?.color || 'var(--color-border-light)' }}
              />
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">
                  {note.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {note.subjects && (
                    <span className="text-[10px] font-mono text-[var(--color-text-dim)] tracking-[0.04em]">
                      {note.subjects.code || note.subjects.name}
                    </span>
                  )}
                  {note.subtitle && (
                    <span className="text-[10px] text-[var(--color-text-dim)] truncate">
                      {note.subtitle}
                    </span>
                  )}
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={note.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open Note URL"
                  className="p-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/80 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                >
                  <ExternalLink size={15} />
                </a>
                <button
                  type="button"
                  onClick={() => openEdit(note)}
                  title="Edit Note"
                  aria-label="Edit Note"
                  className="p-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/80 active:bg-[var(--color-surface-3)] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(note)}
                  title="Delete Note"
                  aria-label="Delete Note"
                  className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 active:bg-red-500/30 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editTarget ? 'Edit Note' : 'New Note'}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. OSI Reference Model"
              className="input-field min-h-[42px]"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
              Subtitle
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="e.g. Unit II — Data Communication & Networking"
              className="input-field min-h-[42px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
              URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="https://shreyx404.github.io/batch-notes/osi-notes.html"
              className="input-field min-h-[42px] font-mono text-xs"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
              Subject
            </label>
            <select
              value={form.subject_id}
              onChange={(e) => setForm((prev) => ({ ...prev, subject_id: e.target.value }))}
              className="input-field min-h-[42px]"
            >
              <option value="">None</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.code ? `(${s.code})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
              Tags
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="osi, networking, layers (comma-separated)"
              className="input-field min-h-[42px]"
            />
            <p className="text-[10px] text-[var(--color-text-dim)] mt-1">Comma-separated tags for search & filtering</p>
          </div>

          <div className="flex gap-3 justify-end pt-3">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2.5 min-h-[42px] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 min-h-[42px] active:scale-[0.99] disabled:opacity-60 text-sm font-semibold transition-all"
            >
              {saving ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : null}
              {editTarget ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Note"
      >
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Delete <strong className="text-[var(--color-text)]">"{deleteTarget?.title}"</strong>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setDeleteTarget(null)}
            className="px-4 py-2 border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
