import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookMarked, ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SearchBar from '../components/ui/SearchBar';
import NoteCard from '../components/notes/NoteCard';
import FolderCard from '../components/notes/FolderCard';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { useNotes } from '../hooks/useNotes';
import { useSubjects } from '../hooks/useSubjects';

/* ── Scroll Reveal Hook ── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.scroll-reveal:not(.revealed)');
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
}

export default function NotesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSubject = searchParams.get('subject') || null;
  const initialQuery = searchParams.get('q') || '';

  const [search, setSearch] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);

  const searchTimerRef = useRef(null);

  const updateUrlParams = useCallback((subject, query) => {
    const params = new URLSearchParams();
    if (subject) params.set('subject', subject);
    if (query && query.trim()) params.set('q', query.trim());
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const handleSubjectChange = useCallback((newSubject) => {
    setSelectedSubject(newSubject);
    updateUrlParams(newSubject, debouncedSearch);
  }, [debouncedSearch, updateUrlParams]);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      updateUrlParams(selectedSubject, val);
    }, 300);
  }, [selectedSubject, updateUrlParams]);

  const filters = useMemo(
    () => ({ search: debouncedSearch, subjectId: selectedSubject }),
    [debouncedSearch, selectedSubject]
  );

  const { notes, loading, error, refetch } = useNotes(filters);
  const { subjects, loading: subjectsLoading } = useSubjects();

  useScrollReveal();

  const isGlobalSearch = Boolean(debouncedSearch);
  const isSubjectView = Boolean(selectedSubject) && !isGlobalSearch;
  const isFolderView = !selectedSubject && !isGlobalSearch;

  const activeSubjectData = useMemo(() => {
    return subjects.find(s => s.id === selectedSubject);
  }, [subjects, selectedSubject]);

  const sortedNotes = useMemo(() => {
    if (!notes) return [];
    if (isSubjectView) {
      return [...notes].sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', undefined, { numeric: true, sensitivity: 'base' })
      );
    }
    return notes;
  }, [notes, isSubjectView]);

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-bg)]">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-5 py-4 sm:py-6">
        {/* ── Hero Section ── */}
        <div className="animate-fade-in grain-overlay pt-8 sm:pt-12 md:pt-16 pb-6 sm:pb-8 md:pb-10 relative">
          <div className="relative z-10">
            <h1 className="text-[3rem] xs:text-[3.5rem] sm:text-[4.5rem] md:text-[var(--text-6xl)] font-display font-semibold text-[var(--color-text)] tracking-[-0.03em] leading-[1.02]">
              Notes
            </h1>
            {/* Thin rule separator */}
            <div className="w-16 sm:w-24 h-[1px] bg-[var(--color-amber)] mt-4 sm:mt-5 mb-3 sm:mb-4" />
            <p className="text-[var(--text-sm)] sm:text-[var(--text-base)] font-light text-[var(--color-text-muted)] tracking-[0.02em] leading-relaxed uppercase" style={{ fontVariant: 'all-small-caps' }}>
              Curated study notes for every subject — open, read, ace.
            </p>
          </div>
        </div>

        <div className="space-y-8 sm:space-y-10 md:space-y-12">
          {/* ── Search ── */}
          <div className="w-full sm:max-w-md">
            <SearchBar value={search} onChange={handleSearch} placeholder="Search across all notes..." />
          </div>

          {/* ── Content Area ── */}
          {error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : (
            <div className="scroll-reveal">
              {isFolderView && (
                <>
                  <div className="section-divider mb-5 sm:mb-6">
                    <span>Subjects · {subjects.length} Folders</span>
                  </div>
                  {subjectsLoading ? (
                    <LoadingState />
                  ) : subjects.length === 0 ? (
                    <EmptyState
                      icon={BookMarked}
                      title="No subjects found"
                      description="Add subjects in the admin dashboard to see folders here."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {subjects.map((subject) => (
                        <FolderCard 
                          key={subject.id} 
                          subject={subject} 
                          onClick={() => handleSubjectChange(subject.id)} 
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {isSubjectView && (
                <>
                  <div className="flex items-center gap-4 mb-5 sm:mb-6">
                    <button 
                      onClick={() => handleSubjectChange(null)}
                      className="p-2 border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-colors text-[var(--color-text)] flex items-center justify-center min-h-[40px] min-w-[40px]"
                      title="Back to all folders"
                      aria-label="Back to all folders"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div className="section-divider flex-1 !mb-0">
                      <span>{activeSubjectData ? activeSubjectData.name : 'Notes'} · {sortedNotes.length}</span>
                    </div>
                  </div>

                  {loading ? (
                    <LoadingState />
                  ) : sortedNotes.length === 0 ? (
                     <EmptyState
                      icon={BookMarked}
                      title="Folder is empty"
                      description="No notes found in this folder."
                    />
                  ) : (
                    <div className="space-y-0">
                      {sortedNotes.map((note) => (
                        <NoteCard key={note.id} note={note} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {isGlobalSearch && (
                <>
                  <div className="section-divider mb-5 sm:mb-6">
                    <span>Search Results · {notes.length}</span>
                  </div>
                  {loading ? (
                    <LoadingState />
                  ) : notes.length === 0 ? (
                     <EmptyState
                      icon={BookMarked}
                      title="No notes found"
                      description={`No results for "${debouncedSearch}".`}
                    />
                  ) : (
                    <div className="space-y-0">
                      {notes.map((note) => (
                        <NoteCard key={note.id} note={note} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
