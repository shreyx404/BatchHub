import { useState, useMemo, useCallback, useRef } from 'react';
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

export default function ArchivePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial values from URL params
  const initialType = searchParams.get('type') || null;
  const initialSubject = searchParams.get('subject') || null;
  const initialQuery = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || 'newest';

  const [searchOpen, setSearchOpen] = useState(Boolean(initialQuery));
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

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-bg)]">
      <Header
        searchOpen={searchOpen}
        onToggleSearch={() => {
          setSearchOpen(!searchOpen);
          if (searchOpen) {
            handleSearch('');
          }
        }}
        searchValue={search}
        onSearchChange={handleSearch}
      />

      <main className="flex-1 mx-auto w-full max-w-6xl px-3.5 sm:px-4 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Page heading */}
        <div className="animate-fade-in pt-4 sm:pt-6 pb-2 sm:pb-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center">
              <Archive size={18} className="text-[var(--color-text-dim)]" />
            </div>
            <h1 className="text-[2.25rem] xs:text-[2.75rem] sm:text-[3.25rem] font-display font-semibold text-[var(--color-text)] tracking-[-0.025em] leading-[1.05]">
              Archive
            </h1>
          </div>
          <p className="text-[var(--text-sm)] sm:text-[var(--text-base)] font-light text-[var(--color-text-muted)] mt-2 sm:mt-3 tracking-[0.01em] leading-relaxed">
            Past events, expired deadlines, and completed assignments.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:max-w-md">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search archived posts... (Ctrl + K)" />
        </div>

        {/* Filters */}
        <FilterBar
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
          selectedSubject={selectedSubject}
          onSubjectChange={handleSubjectChange}
          subjects={subjects}
        />

        {/* Sort bar */}
        <ArchiveSortBar
          sortBy={sortBy}
          onSortChange={handleSortChange}
          totalCount={totalCount}
          loading={loading}
        />

        {/* Results */}
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
          <PostGrid posts={posts} loading={false} />
        )}
      </main>

      <Footer />
    </div>
  );
}
