import { useState } from 'react';
import { Plus, Edit2, Trash2, Palette, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import { LoadingSpinner } from '../ui/LoadingState';
import EmptyState from '../ui/EmptyState';
import { useSubjects } from '../../hooks/useSubjects';
import { createSubject, updateSubject, deleteSubject } from '../../lib/api';

const COLOR_PRESETS = [
  '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444',
  '#f97316', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b',
];

export default function SubjectManager() {
  const { subjects, loading, refetch } = useSubjects();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', color: '#6366f1' });
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm({ name: '', code: '', color: '#6366f1' });
    setEditTarget(null);
    setShowForm(true);
  };

  const openEdit = (subject) => {
    setForm({ name: subject.name, code: subject.code || '', color: subject.color || '#6366f1' });
    setEditTarget(subject);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    setSaving(true);
    try {
      if (editTarget) {
        await updateSubject(editTarget.id, form);
        toast.success('Subject updated');
      } else {
        await createSubject(form);
        toast.success('Subject created');
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSubject(deleteTarget.id);
      toast.success('Subject deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Subjects</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black text-sm font-semibold transition-colors"
        >
          <Plus size={14} />
          Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <EmptyState title="No subjects" description="Add subjects to organize your posts." />
      ) : (
        <div className="space-y-2">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-all group"
            >
              <div
                className="w-2.5 h-2.5 rotate-45 shrink-0"
                style={{ background: subject.color || '#6366f1' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {subject.name}
                </p>
                {subject.code && (
                  <p className="text-xs text-[var(--color-text-dim)] font-mono">{subject.code}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => openEdit(subject)}
                  title="Edit Subject"
                  aria-label="Edit Subject"
                  className="p-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/80 active:bg-[var(--color-surface-3)] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(subject)}
                  title="Delete Subject"
                  aria-label="Delete Subject"
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
        onClose={() => setShowForm(false)}
        title={editTarget ? 'Edit Subject' : 'New Subject'}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Data Structures"
              className="input-field min-h-[42px]"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
              Code
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="e.g. CS201"
              className="input-field min-h-[42px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
              Color
            </label>
            <div className="flex flex-wrap gap-4 py-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className="w-7 h-7 rotate-45 border transition-all hover:scale-110 active:scale-95 flex items-center justify-center min-h-[28px] min-w-[28px]"
                  style={{
                    background: c,
                    borderColor: form.color === c ? '#ffffff' : 'transparent',
                    boxShadow: form.color === c ? '0 0 0 2px #ffffff' : 'none',
                  }}
                  title={c}
                >
                  {form.color === c && <Check size={12} className="text-white -rotate-45 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-3">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 min-h-[42px] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 min-h-[42px] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] active:scale-[0.99] disabled:opacity-60 text-black text-sm font-semibold transition-all"
            >
              {saving ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : null}
              {editTarget ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Subject"
      >
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Delete <strong className="text-[var(--color-text)]">"{deleteTarget?.name}"</strong>?
          Posts using this subject will have their subject cleared.
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
