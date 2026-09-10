import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Archive } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SearchBar from '../components/ui/SearchBar';
import FilterBar from '../components/ui/FilterBar';
import ArchiveSortBar from '../components/ui/ArchiveSortBar';
import PostGrid from '../components/posts/PostGrid';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { useArchivePosts } from '../hooks/useArchivePosts';
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

export default function ArchivePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial values from URL params
  const initialType = searchParams.get('type') || null;
  const initialSubject = searchParams.get('subject') || null;
  const initialQuery = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || 'newest';

  const [search, setSearch] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [sortBy, setSortBy] = useState(initialSort);

  const searchTimerRef = useRef(null);

  // Sync state to URL
  const updateUrlParams = useCallback((type, subject, query, sort) => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (subject) params.set('subject', subject);
    if (query && query.trim()) params.set('q', query.trim());
    if (sort && sort !== 'newest') params.set('sort', sort);
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const handleTypeChange = useCallback((newType) => {
    setSelectedType(newType);
    updateUrlParams(newType, selectedSubject, debouncedSearch, sortBy);
  }, [selectedSubject, debouncedSearch, sortBy, updateUrlParams]);

  const handleSubjectChange = useCallback((newSubject) => {
    setSelectedSubject(newSubject);
    updateUrlParams(selectedType, newSubject, debouncedSearch, sortBy);
  }, [selectedType, debouncedSearch, sortBy, updateUrlParams]);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      updateUrlParams(selectedType, selectedSubject, val, sortBy);
    }, 300);
  }, [selectedType, selectedSubject, sortBy, updateUrlParams]);

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    updateUrlParams(selectedType, selectedSubject, debouncedSearch, newSort);
  }, [selectedType, selectedSubject, debouncedSearch, updateUrlParams]);

  const filters = useMemo(
    () => ({ type: selectedType, subjectId: selectedSubject, search: debouncedSearch }),
    [selectedType, selectedSubject, debouncedSearch]
  );

  const { posts, totalCount, loading, error, refetch } = useArchivePosts(filters, sortBy);
  const { subjects } = useSubjects();

  useScrollReveal();

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-bg)]">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-5 py-4 sm:py-6">
        {/* ── Archive Hero — differentiated from home ── */}
        <div className="animate-fade-in pt-6 sm:pt-10 md:pt-12 pb-6 sm:pb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center">
              <Archive size={20} className="text-[var(--color-text-dim)]" />
            </div>
            <div>
              <h1 className="text-[2rem] xs:text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] font-display font-semibold text-[var(--color-text-muted)] tracking-[-0.025em] leading-[1.05]">
                Archive
              </h1>
            </div>
          </div>
          {/* Thin rule */}
          <div className="w-12 sm:w-16 h-[1px] bg-[var(--color-border-light)] mb-3" />
          <p className="text-[var(--text-sm)] sm:text-[var(--text-base)] font-light text-[var(--color-text-dim)] tracking-[0.01em] leading-relaxed max-w-lg">
            Past events, expired deadlines, and completed assignments — preserved for reference.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8 md:space-y-10">
          {/* ── Search & Filters ── */}
          <div className="space-y-3 sm:space-y-4">
            <div className="w-full sm:max-w-md">
              <SearchBar value={search} onChange={handleSearch} placeholder="Search archived posts... (Ctrl + K)" />
            </div>
            <FilterBar
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
              selectedSubject={selectedSubject}
              onSubjectChange={handleSubjectChange}
              subjects={subjects}
            />
          </div>

          {/* ── Sort & Results ── */}
          <div>
            <ArchiveSortBar
              sortBy={sortBy}
              onSortChange={handleSortChange}
              totalCount={totalCount}
              loading={loading}
            />

            <div className="section-divider mt-4 sm:mt-5 mb-5 sm:mb-6">
              <span>Archived Results</span>
            </div>
          </div>

          {/* ── Content ── */}
          {error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : loading ? (
            <LoadingState />
          ) : posts.length === 0 ? (
            <EmptyState
              icon={Archive}
              title="No archived posts"
              description="There are no archived events matching your filters. Try broadening your search."
            />
          ) : (
            <div className="scroll-reveal opacity-90">
              <PostGrid posts={posts} loading={false} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
