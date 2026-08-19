import { useState, useMemo, useCallback } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SearchBar from '../components/ui/SearchBar';
import FilterBar from '../components/ui/FilterBar';
import PostGrid from '../components/posts/PostGrid';
import DeadlineBanner from '../components/posts/DeadlineBanner';
import PinnedSection from '../components/posts/PinnedSection';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import { usePosts, useUpcomingDeadlines } from '../hooks/usePosts';
import { useSubjects } from '../hooks/useSubjects';
import { APP_NAME, APP_TAGLINE } from '../lib/constants';

export default function HomePage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(window.__bh_search_timer);
    window.__bh_search_timer = setTimeout(() => setDebouncedSearch(val), 300);
  }, []);

  const filters = useMemo(
    () => ({ type: selectedType, subjectId: selectedSubject, search: debouncedSearch }),
    [selectedType, selectedSubject, debouncedSearch]
  );

  const { posts, loading, error, refetch } = usePosts(filters);
  const { deadlines, loading: deadlinesLoading } = useUpcomingDeadlines();
  const { subjects } = useSubjects();

  // Only show pinned section when no filters are active
  const showPinned = !selectedType && !selectedSubject && !debouncedSearch;

  // Separate non-pinned posts when showing pinned section
  const displayPosts = showPinned ? posts.filter((p) => !p.is_pinned) : posts;

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-bg)]">
      <Header
        searchOpen={searchOpen}
        onToggleSearch={() => {
          setSearchOpen(!searchOpen);
          if (searchOpen) {
            setSearch('');
            setDebouncedSearch('');
          }
        }}
        searchValue={search}
        onSearchChange={handleSearch}
      />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="animate-fade-in pt-6 pb-3">
          <h1 className="text-[2.5rem] sm:text-[3.25rem] font-display font-semibold text-[var(--color-text)] tracking-[-0.025em] leading-[1.05]">
            {APP_NAME}
          </h1>
          <p className="text-[var(--text-base)] font-light text-[var(--color-text-muted)] mt-3 tracking-[0.01em] leading-relaxed">
            {APP_TAGLINE}
          </p>
        </div>

        {/* Deadline banner */}
        {!deadlinesLoading && deadlines.length > 0 && (
          <DeadlineBanner deadlines={deadlines} />
        )}

        {/* Search (mobile — always visible on large screens via header) */}
        <div className="sm:hidden">
          <SearchBar value={search} onChange={handleSearch} />
        </div>

        {/* Desktop search */}
        <div className="hidden sm:block max-w-md">
          <SearchBar value={search} onChange={handleSearch} />
        </div>

        {/* Filters */}
        <FilterBar
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedSubject={selectedSubject}
          onSubjectChange={setSelectedSubject}
          subjects={subjects}
        />

        {/* Pinned section */}
        {showPinned && !loading && <PinnedSection posts={posts} />}

        {/* Main post grid */}
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : loading ? (
          <LoadingState />
        ) : (
          <>
            {showPinned && displayPosts.length > 0 && (
              <div className="flex items-center gap-2 pt-3">
                <h2 className="text-[var(--text-sm)] font-medium tracking-[0.02em] text-[var(--color-text)]">
                  All Updates
                </h2>
                <span className="text-[var(--text-xs)] font-light text-[var(--color-text-dim)]">
                  ({displayPosts.length})
                </span>
              </div>
            )}
            <PostGrid posts={displayPosts} loading={loading} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
