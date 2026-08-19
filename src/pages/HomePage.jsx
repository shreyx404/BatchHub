import { useState, useMemo, useCallback, useRef } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SearchBar from '../components/ui/SearchBar';
import FilterBar from '../components/ui/FilterBar';
import PostGrid from '../components/posts/PostGrid';
import DeadlineBanner from '../components/posts/DeadlineBanner';
import PinnedSection from '../components/posts/PinnedSection';
import NoticesSection from '../components/posts/NoticesSection';
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
  const searchTimerRef = useRef(null);
  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(val), 300);
  }, []);

  const filters = useMemo(
    () => ({ type: selectedType, subjectId: selectedSubject, search: debouncedSearch }),
    [selectedType, selectedSubject, debouncedSearch]
  );

  const { posts, loading, error, refetch } = usePosts(filters);
  const { deadlines, loading: deadlinesLoading } = useUpcomingDeadlines();
  const { subjects } = useSubjects();

  // Only show structured sections when no filters are active
  const showStructured = !selectedType && !selectedSubject && !debouncedSearch;

  // Categorise posts for structured "All Updates" view
  const { noticePosts, pinnedPosts, withDeadline, withoutDeadline, remainingPosts } = useMemo(() => {
    if (!showStructured) {
      return { noticePosts: [], pinnedPosts: [], withDeadline: [], withoutDeadline: [], remainingPosts: posts };
    }

    // 1. Notices & Important (highlighted at top)
    const notices = posts.filter((p) => p.type === 'notice' || p.type === 'important');
    const noticeIds = new Set(notices.map((p) => p.id));

    // 2. Pinned posts (excluding ones already in notices)
    const pinned = posts.filter((p) => p.is_pinned && !noticeIds.has(p.id));
    const pinnedIds = new Set(pinned.map((p) => p.id));

    // 3 & 4. Remaining posts (not notice/important, not pinned)
    const rest = posts.filter((p) => !noticeIds.has(p.id) && !pinnedIds.has(p.id));

    // Posts WITH due dates — sorted ascending (soonest deadline first)
    const hasDue = rest
      .filter((p) => p.due_date)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    // Posts WITHOUT due dates — sorted by created_at ascending (first come first serve)
    const noDue = rest
      .filter((p) => !p.due_date)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return { noticePosts: notices, pinnedPosts: pinned, withDeadline: hasDue, withoutDeadline: noDue, remainingPosts: [] };
  }, [posts, showStructured]);

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

        {/* Main content */}
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : loading ? (
          <LoadingState />
        ) : showStructured ? (
          <>
            {/* All Updates heading */}
            {posts.length > 0 && (
              <div className="flex items-center gap-2 pt-3">
                <h2 className="text-[var(--text-sm)] font-medium tracking-[0.02em] text-[var(--color-text)]">
                  All Updates
                </h2>
                <span className="text-[var(--text-xs)] font-light text-[var(--color-text-dim)]">
                  ({posts.length})
                </span>
              </div>
            )}

            {/* 1. Notices & Important — highlighted section */}
            <NoticesSection posts={posts} />

            {/* 2. Pinned posts */}
            <PinnedSection posts={posts} />

            {/* 3. Posts with due dates — ascending by deadline */}
            {withDeadline.length > 0 && (
              <div className="space-y-0">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-[10px] font-medium text-[var(--color-text-dim)] tracking-[0.1em] uppercase">
                    Upcoming Deadlines
                  </h3>
                  <span className="text-[10px] font-light text-[var(--color-text-dim)]">
                    ({withDeadline.length})
                  </span>
                </div>
                <PostGrid posts={withDeadline} loading={false} />
              </div>
            )}

            {/* 4. Posts without due dates — FCFS (created_at ascending) */}
            {withoutDeadline.length > 0 && (
              <div className="space-y-0">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-[10px] font-medium text-[var(--color-text-dim)] tracking-[0.1em] uppercase">
                    General Updates
                  </h3>
                  <span className="text-[10px] font-light text-[var(--color-text-dim)]">
                    ({withoutDeadline.length})
                  </span>
                </div>
                <PostGrid posts={withoutDeadline} loading={false} />
              </div>
            )}

            {/* Empty state when no posts at all */}
            {posts.length === 0 && (
              <PostGrid posts={[]} loading={false} />
            )}
          </>
        ) : (
          /* Filtered view — flat list, no sections */
          <PostGrid posts={remainingPosts.length > 0 ? remainingPosts : posts} loading={loading} />
        )}
      </main>

      <Footer />
    </div>
  );
}
