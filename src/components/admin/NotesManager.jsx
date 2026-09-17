import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, ExternalLink, ArrowLeft, Folder,
  BookMarked, Search, X, ChevronRight, FolderPlus
} from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSubjectId = searchParams.get('subject') || null;

  const { subjects, loading: subjectsLoading } = useSubjects();

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

  useEffect(() => {
    load();
  }, []);

  /* ── Note Count per Subject ── */
  const notesCountBySubject = useMemo(() => {
    const counts = {};
    notes.forEach((note) => {
      const sId = note.subject_id || 'uncategorized';
      counts[sId] = (counts[sId] || 0) + 1;
    });
    return counts;
  }, [notes]);

  /* ── Notes without valid subject ── */
  const uncategorizedNotes = useMemo(() => {
    return notes.filter(
      (n) => !n.subject_id || !subjects.some((s) => s.id === n.subject_id)
    );
  }, [notes, subjects]);

  /* ── Current Active Subject for Folder View ── */
  const activeSubject = useMemo(() => {
    if (!selectedSubjectId) return null;
    if (selectedSubjectId === 'uncategorized') {
      return {
        id: 'uncategorized',
        name: 'Uncategorized Notes',
        code: 'GENERAL',
        color: 'var(--color-border-light)',
      };
    }
    return subjects.find((s) => s.id === selectedSubjectId) || null;
  }, [selectedSubjectId, subjects]);

  /* ── Notes inside Current Folder ── */
  const currentFolderNotes = useMemo(() => {
    if (!selectedSubjectId) return [];
    let list;
    if (selectedSubjectId === 'uncategorized') {
      list = uncategorizedNotes;
    } else {
      list = notes.filter((n) => n.subject_id === selectedSubjectId);
    }
    return [...list].sort((a, b) =>
      (a.title || '').localeCompare(b.title || '', undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [notes, selectedSubjectId, uncategorizedNotes]);

  /* ── Global Search Filter ── */
  const isSearching = Boolean(searchQuery.trim());
  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.toLowerCase().trim();
    return notes.filter((n) => {
      const matchTitle = n.title?.toLowerCase().includes(q);
      const matchSubtitle = n.subtitle?.toLowerCase().includes(q);
      const matchTags = n.tags?.some((t) => t.toLowerCase().includes(q));
      const matchSubject =
        n.subjects?.name?.toLowerCase().includes(q) ||
        n.subjects?.code?.toLowerCase().includes(q);
      return matchTitle || matchSubtitle || matchTags || matchSubject;
    });
  }, [notes, searchQuery, isSearching]);

  /* ── Folder Navigation ── */
  const handleSelectFolder = (subjectId) => {
    setSearchParams({ subject: subjectId });
  };

  const handleBackToFolders = () => {
    setSearchParams({});
  };

  /* ── Form Modal Handlers ── */
  const openCreate = (targetSubjectId) => {
    const prefillSubject =
      targetSubjectId ||
      (selectedSubjectId && selectedSubjectId !== 'uncategorized'
        ? selectedSubjectId
        : '');
    setForm({
      title: '',
      subtitle: '',
      subject_id: prefillSubject,
      url: '',
      tags: '',
    });
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
      toast.error(err.message || 'Failed to save note');
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
      toast.error(err.message || 'Failed to delete note');
    }
  };

  if (loading && notes.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      {/* ── Global Search Active View ── */}
      {isSearching ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes across all subjects..."
                  className="input-field pl-9 pr-9 min-h-[40px] text-sm"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
            <button
              onClick={() => openCreate()}
              className="btn-primary flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold transition-colors shrink-0"
            >
              <Plus size={14} />
              Add Note
            </button>
          </div>

          <div className="section-divider !mb-2">
            <span>Search Results · {searchResults.length} {searchResults.length === 1 ? 'note' : 'notes'}</span>
          </div>

          {searchResults.length === 0 ? (
            <EmptyState
              icon={BookMarked}
              title="No matching notes"
              description={`No notes matched "${searchQuery}". Try a different search term.`}
            />
          ) : (
            <div className="space-y-2">
              {searchResults.map((note) => (
                <NoteRowItem
                  key={note.id}
                  note={note}
                  onEdit={() => openEdit(note)}
                  onDelete={() => setDeleteTarget(note)}
                />
              ))}
            </div>
          )}
        </div>
      ) : selectedSubjectId ? (
        /* ── Inside Subject Folder View ── */
        <div className="space-y-5">
          {/* Breadcrumb Navigation & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
            <div className="flex items-start sm:items-center gap-3">
              <button
                type="button"
                onClick={handleBackToFolders}
                className="p-2 border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-colors text-[var(--color-text)] flex items-center justify-center min-h-[40px] min-w-[40px] shrink-0"
                title="Back to all folders"
                aria-label="Back to all folders"
              >
                <ArrowLeft size={16} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    onClick={handleBackToFolders}
                    className="text-xs font-medium text-[var(--color-text-dim)] hover:text-[var(--color-text)] cursor-pointer uppercase tracking-[0.05em] transition-colors"
                  >
                    Folders
                  </span>
                  <ChevronRight size={12} className="text-[var(--color-text-dim)]" />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rotate-45 shrink-0"
                      style={{
                        background:
                          activeSubject?.color || 'var(--color-border-light)',
                      }}
                    />
                    <h2 className="text-lg sm:text-xl font-display font-semibold text-[var(--color-text)] truncate">
                      {activeSubject?.name || 'Folder'}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  {activeSubject?.code && (
                    <span className="text-[10px] font-mono tracking-[0.05em] uppercase text-[var(--color-text-dim)] bg-[var(--color-surface-2)] border border-[var(--color-border)] px-1.5 py-0.5">
                      {activeSubject.code}
                    </span>
                  )}
                  <span className="text-xs text-[var(--color-text-muted)] font-light">
                    {currentFolderNotes.length}{' '}
                    {currentFolderNotes.length === 1 ? 'note' : 'notes'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={() =>
                  openCreate(
                    selectedSubjectId !== 'uncategorized'
                      ? selectedSubjectId
                      : ''
                  )
                }
                className="btn-primary flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold transition-colors"
              >
                <Plus size={14} />
                Add Note to {activeSubject?.code || 'Folder'}
              </button>
            </div>
          </div>

          {/* Notes List inside Folder */}
          {currentFolderNotes.length === 0 ? (
            <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-8 sm:p-12 text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-dim)]">
                <FolderPlus size={24} />
              </div>
              <div>
                <h3 className="text-base font-display font-semibold text-[var(--color-text)]">
                  Folder is empty
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto mt-1 font-light">
                  No notes have been added to {activeSubject?.name || 'this folder'} yet. Add study notes or HTML documentation links.
                </p>
              </div>
              <button
                onClick={() =>
                  openCreate(
                    selectedSubjectId !== 'uncategorized'
                      ? selectedSubjectId
                      : ''
                  )
                }
                className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.05em]"
              >
                <Plus size={13} />
                Add First Note
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {currentFolderNotes.map((note) => (
                <NoteRowItem
                  key={note.id}
                  note={note}
                  onEdit={() => openEdit(note)}
                  onDelete={() => setDeleteTarget(note)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── Root Folders Overview View ── */
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-[var(--color-text)] tracking-[-0.01em]">
                Notes
              </h2>
              <p
                className="text-xs text-[var(--color-text-muted)] uppercase tracking-[0.04em] mt-1 font-light"
                style={{ fontVariant: 'all-small-caps' }}
              >
                Select a subject folder to view and add notes
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => openCreate()}
                className="btn-primary flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold transition-colors"
              >
                <Plus size={14} />
                Add Note
              </button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick search across all notes..."
              className="input-field pl-9 pr-4 min-h-[40px] text-sm"
            />
          </div>

          {/* Folders Grid */}
          <div className="space-y-3">
            <div className="section-divider !mb-4">
              <span>
                Subject Folders · {subjects.length} {subjects.length === 1 ? 'Folder' : 'Folders'}
              </span>
            </div>

            {subjectsLoading ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : subjects.length === 0 ? (
              <EmptyState
                icon={BookMarked}
                title="No subjects found"
                description="Create subjects in the Subjects tab to organize your notes gallery."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((subject) => {
                  const count = notesCountBySubject[subject.id] || 0;
                  const subjectColor = subject.color || 'var(--color-amber)';

                  return (
                    <div
                      key={subject.id}
                      className="group relative flex items-stretch border-l border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)]/50 transition-all duration-300 hover:-translate-y-0.5 hover:translate-x-0.5"
                      style={{
                        '--hover-border-color': subjectColor,
                      }}
                    >
                      {/* Ledger Node Marker */}
                      <div
                        className="absolute left-[-4px] top-[26px] w-[7px] h-[7px] bg-[var(--color-border-light)] transition-colors duration-300 group-hover:bg-[var(--hover-border-color)]"
                        style={{
                          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                        }}
                      />
                      {/* Ledger glowing line overlay */}
                      <div
                        className="absolute left-0 top-0 w-[1px] h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(to bottom, transparent, ${subjectColor}, transparent)`,
                        }}
                      />

                      {/* Folder Card Main Button */}
                      <button
                        type="button"
                        onClick={() => handleSelectFolder(subject.id)}
                        className="flex-1 flex items-center gap-3.5 pl-5 sm:pl-6 py-4 pr-3 text-left min-w-0"
                      >
                        <div
                          className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] group-hover:border-[var(--hover-border-color)] transition-colors duration-300 flex items-center justify-center shrink-0"
                        >
                          <Folder
                            size={20}
                            className="text-[var(--color-text-dim)] group-hover:text-[var(--hover-border-color)] transition-colors duration-300"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-display font-semibold text-[var(--color-text)] tracking-[-0.01em] leading-snug truncate">
                            {subject.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {subject.code && (
                              <span className="text-[10px] font-mono tracking-[0.04em] text-[var(--color-text-dim)] uppercase">
                                {subject.code}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-[var(--color-text-dim)]">
                              • {count} {count === 1 ? 'note' : 'notes'}
                            </span>
                          </div>
                        </div>

                        <ChevronRight
                          size={16}
                          className="text-[var(--color-text-dim)] group-hover:text-[var(--color-text)] group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
                        />
                      </button>

                      {/* Quick Add Note Button inside this Folder */}
                      <div className="flex items-center pr-3 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCreate(subject.id);
                          }}
                          title={`Add Note to ${subject.name}`}
                          aria-label={`Add Note to ${subject.name}`}
                          className="p-2 border border-dashed border-[var(--color-border)] hover:border-[var(--hover-border-color)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Uncategorized Folder (if any notes exist without subject) */}
                {uncategorizedNotes.length > 0 && (
                  <div
                    className="group relative flex items-stretch border-l border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)]/50 transition-all duration-300 hover:-translate-y-0.5 hover:translate-x-0.5"
                  >
                    <div
                      className="absolute left-[-4px] top-[26px] w-[7px] h-[7px] bg-[var(--color-border-light)]"
                      style={{
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSelectFolder('uncategorized')}
                      className="flex-1 flex items-center gap-3.5 pl-5 sm:pl-6 py-4 pr-3 text-left min-w-0"
                    >
                      <div className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                        <Folder size={20} className="text-[var(--color-text-dim)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-display font-semibold text-[var(--color-text)] truncate">
                          Uncategorized Notes
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono tracking-[0.04em] text-[var(--color-text-dim)] uppercase">
                            GENERAL
                          </span>
                          <span className="text-[10px] font-mono text-[var(--color-text-dim)]">
                            • {uncategorizedNotes.length}{' '}
                            {uncategorizedNotes.length === 1 ? 'note' : 'notes'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-[var(--color-text-dim)] group-hover:text-[var(--color-text)] group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
                      />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Create / Edit Note Modal ── */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={
          editTarget
            ? 'Edit Note'
            : form.subject_id && subjects.find((s) => s.id === form.subject_id)
            ? `New Note in ${
                subjects.find((s) => s.id === form.subject_id).code ||
                subjects.find((s) => s.id === form.subject_id).name
              }`
            : 'New Note'
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          {/* Subject Selector */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
              Subject Folder
            </label>
            <select
              value={form.subject_id}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, subject_id: e.target.value }))
              }
              className="input-field min-h-[42px]"
            >
              <option value="">None / Uncategorized</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.code ? `(${s.code})` : ''}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-[var(--color-text-dim)] mt-1">
              Select which subject folder this note belongs to.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. OSI Reference Model"
              className="input-field min-h-[42px]"
              autoFocus
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
              Subtitle / Unit
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, subtitle: e.target.value }))
              }
              placeholder="e.g. Unit II — Data Communication & Networking"
              className="input-field min-h-[42px]"
            />
          </div>

          {/* URL */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
              URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, url: e.target.value }))
              }
              placeholder="https://shreyx404.github.io/batch-notes/osi-notes.html"
              className="input-field min-h-[42px] font-mono text-xs"
            />
            <p className="text-[10px] text-[var(--color-text-dim)] mt-1">
              Direct link to hosted HTML notes, PDF document, or GitHub repo.
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
              Tags
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, tags: e.target.value }))
              }
              placeholder="osi, networking, layers (comma-separated)"
              className="input-field min-h-[42px]"
            />
            <p className="text-[10px] text-[var(--color-text-dim)] mt-1">
              Comma-separated keywords for student search & filtering
            </p>
          </div>

          {/* Actions */}
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
              {saving && (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              )}
              {editTarget ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Note"
      >
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Are you sure you want to delete{' '}
          <strong className="text-[var(--color-text)]">
            "{deleteTarget?.title}"
          </strong>
          ? This action cannot be undone.
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

/* ── Note Row Item Component ── */
function NoteRowItem({ note, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-all group">
      {/* Subject color indicator */}
      <div
        className="w-2.5 h-2.5 rotate-45 shrink-0"
        style={{
          background:
            note.subjects?.color || 'var(--color-border-light)',
        }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text)] truncate">
          {note.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {note.subjects && (
            <span className="text-[10px] font-mono text-[var(--color-text-dim)] tracking-[0.04em] uppercase">
              {note.subjects.code || note.subjects.name}
            </span>
          )}
          {note.subtitle && (
            <span className="text-[10px] text-[var(--color-text-dim)] truncate">
              {note.subtitle}
            </span>
          )}
          {note.tags && note.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.2 text-[8.5px] font-mono uppercase bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-dim)]"
                >
                  {tag}
                </span>
              ))}
            </div>
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
          aria-label="Open Note URL"
          className="p-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/80 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
        >
          <ExternalLink size={14} />
        </a>
        <button
          type="button"
          onClick={onEdit}
          title="Edit Note"
          aria-label="Edit Note"
          className="p-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/80 active:bg-[var(--color-surface-3)] transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
        >
          <Edit2 size={14} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Delete Note"
          aria-label="Delete Note"
          className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 active:bg-red-500/30 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
