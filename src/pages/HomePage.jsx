import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filter values from URL params
  const initialType = searchParams.get('type') || null;
  const initialSubject = searchParams.get('subject') || null;
  const initialQuery = searchParams.get('q') || '';

  const [searchOpen, setSearchOpen] = useState(Boolean(initialQuery));
  const [search, setSearch] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);

  const searchTimerRef = useRef(null);

  // Helper to sync state to URL
  const updateUrlParams = useCallback((type, subject, query) => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (subject) params.set('subject', subject);
    if (query && query.trim()) params.set('q', query.trim());
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const handleTypeChange = useCallback((newType) => {
    setSelectedType(newType);
    updateUrlParams(newType, selectedSubject, debouncedSearch);
  }, [selectedSubject, debouncedSearch, updateUrlParams]);

  const handleSubjectChange = useCallback((newSubject) => {
    setSelectedSubject(newSubject);
    updateUrlParams(selectedType, newSubject, debouncedSearch);
  }, [selectedType, debouncedSearch, updateUrlParams]);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      updateUrlParams(selectedType, selectedSubject, val);
    }, 300);
  }, [selectedType, selectedSubject, updateUrlParams]);

  const filters = useMemo(
    () => ({ type: selectedType, subjectId: selectedSubject, search: debouncedSearch }),
    [selectedType, selectedSubject, debouncedSearch]
  );

  const { posts, loading, error, refetch } = usePosts(filters);
  const { deadlines, loading: deadlinesLoading } = useUpcomingDeadlines();
  const { subjects } = useSubjects();

  // Only show structured sections when no filters are active
  const showStructured = !selectedType && !selectedSubject && !debouncedSearch;

  // Live stats for hero
  const stats = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const dueThisWeek = posts.filter((p) => {
      if (!p.due_date) return false;
      const d = new Date(p.due_date);
      return d >= now && d <= weekFromNow;
    }).length;

    return { total: posts.length, dueThisWeek };
  }, [posts]);

  // Categorise posts for structured "All Updates" view
  const { noticePosts, pinnedPosts, withDeadline, withoutDeadline, remainingPosts } = useMemo(() => {
    if (!showStructured) {
      // Filtered view: sort by due date ascending (soonest first), with no-due-date posts at the very last
      const sorted = [...posts].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1;
        if (a.due_date && b.due_date) {
          const diff = new Date(a.due_date) - new Date(b.due_date);
          if (diff !== 0) return diff;
          return new Date(a.created_at) - new Date(b.created_at);
        }
        if (a.due_date && !b.due_date) return -1;
        if (!a.due_date && b.due_date) return 1;
        return new Date(a.created_at) - new Date(b.created_at);
      });
      return { noticePosts: [], pinnedPosts: [], withDeadline: [], withoutDeadline: [], remainingPosts: sorted };
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

  // Activate scroll reveal
  useScrollReveal();

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

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-5 py-4 sm:py-6">
        {/* ── Hero Section — Editorial Elevated ── */}
        <div className="animate-fade-in grain-overlay pt-8 sm:pt-12 md:pt-16 pb-6 sm:pb-8 md:pb-10 relative">
          <div className="relative z-10">
            <h1 className="text-[3rem] xs:text-[3.5rem] sm:text-[4.5rem] md:text-[var(--text-6xl)] font-display font-semibold text-[var(--color-text)] tracking-[-0.03em] leading-[1.02]">
              {APP_NAME}
            </h1>
            {/* Thin rule separator */}
            <div className="w-16 sm:w-24 h-[1px] bg-[var(--color-amber)] mt-4 sm:mt-5 mb-3 sm:mb-4" />
            <p className="text-[var(--text-sm)] sm:text-[var(--text-base)] font-light text-[var(--color-text-muted)] tracking-[0.02em] leading-relaxed uppercase" style={{ fontVariant: 'all-small-caps' }}>
              {APP_TAGLINE}
            </p>
            {/* Live stats */}
            {!loading && posts.length > 0 && (
              <div className="flex items-center gap-3 sm:gap-4 mt-4 sm:mt-5">
                <span className="text-[10px] sm:text-[var(--text-xs)] font-mono tracking-[0.06em] uppercase text-[var(--color-text-dim)]">
                  {stats.total} active
                </span>
                {stats.dueThisWeek > 0 && (
                  <>
                    <span className="text-[var(--color-border-light)]">·</span>
                    <span className="text-[10px] sm:text-[var(--text-xs)] font-mono tracking-[0.06em] uppercase text-[var(--color-amber)]">
                      {stats.dueThisWeek} due this week
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8 sm:space-y-10 md:space-y-12">
          {/* ── Deadline Banner ── */}
          {!deadlinesLoading && deadlines.length > 0 && (
            <div className="scroll-reveal">
              <DeadlineBanner deadlines={deadlines} />
            </div>
          )}

          {/* ── Search & Filters ── */}
          <div className="space-y-3 sm:space-y-4">
            <div className="w-full sm:max-w-md">
              <SearchBar value={search} onChange={handleSearch} />
            </div>
            <FilterBar
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
              selectedSubject={selectedSubject}
              onSubjectChange={handleSubjectChange}
              subjects={subjects}
            />
          </div>

          {/* ── Main Content ── */}
          {error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : loading ? (
            <LoadingState />
          ) : showStructured ? (
            <div className="space-y-8 sm:space-y-10 md:space-y-12">
              {/* All Updates heading */}
              {posts.length > 0 && (
                <div className="section-divider">
                  <span>All Updates · {posts.length}</span>
                </div>
              )}

              {/* 1. Notices & Important — highlighted section */}
              {noticePosts.length > 0 && (
                <div className="scroll-reveal">
                  <NoticesSection posts={noticePosts} />
                </div>
              )}

              {/* 2. Pinned posts */}
              {pinnedPosts.length > 0 && (
                <div className="scroll-reveal">
                  <PinnedSection posts={pinnedPosts} />
                </div>
              )}

              {/* 3. Posts with due dates — ascending by deadline */}
              {withDeadline.length > 0 && (
                <div className="scroll-reveal">
                  <div className="section-divider mb-5 sm:mb-6">
                    <span>Upcoming Deadlines · {withDeadline.length}</span>
                  </div>
                  <PostGrid posts={withDeadline} loading={false} />
                </div>
              )}

              {/* 4. Posts without due dates — FCFS (created_at ascending) */}
              {withoutDeadline.length > 0 && (
                <div className="scroll-reveal">
                  <div className="section-divider mb-5 sm:mb-6">
                    <span>General Updates · {withoutDeadline.length}</span>
                  </div>
                  <PostGrid posts={withoutDeadline} loading={false} />
                </div>
              )}

              {/* Empty state when no posts at all */}
              {posts.length === 0 && (
                <PostGrid posts={[]} loading={false} />
              )}
            </div>
          ) : (
            /* Filtered view — flat list, no sections */
            <PostGrid posts={remainingPosts.length > 0 ? remainingPosts : posts} loading={loading} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
