import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CalendarControls from '../components/calendar/CalendarControls';
import CalendarGrid from '../components/calendar/CalendarGrid';
import CalendarSidebar from '../components/calendar/CalendarSidebar';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { useCalendarPosts } from '../hooks/useCalendar';
import { useSubjects } from '../hooks/useSubjects';
import { CalendarClock } from 'lucide-react';

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Search state for Header (no-op on calendar page, but Header requires it)
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { posts, loading, error } = useCalendarPosts(year, month);
  const { subjects } = useSubjects();

  // Filter posts by subject
  const filteredPosts = useMemo(() => {
    if (!selectedSubject) return posts;
    return posts.filter((p) => p.subject_id === selectedSubject);
  }, [posts, selectedSubject]);

  // Group posts by date key (YYYY-MM-DD)
  const postsByDate = useMemo(() => {
    const grouped = {};
    for (const post of filteredPosts) {
      const d = new Date(post.due_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(post);
    }
    return grouped;
  }, [filteredPosts]);

  // Count posts by subject for filter chips
  const postCountBySubject = useMemo(() => {
    const counts = {};
    for (const post of posts) {
      if (post.subject_id) {
        counts[post.subject_id] = (counts[post.subject_id] || 0) + 1;
      }
    }
    return counts;
  }, [posts]);

  // Selected date posts
  const selectedPosts = selectedDate ? (postsByDate[selectedDate] || []) : [];

  const handlePrevMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
    setSelectedDate(null);
  }, []);

  const handleNextMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
    setSelectedDate(null);
  }, []);

  const handleToday = useCallback(() => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDate(key);
  }, []);

  const handleSelectDate = useCallback((dateKey) => {
    setSelectedDate(dateKey);
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const el = document.getElementById('calendar-inspector-target');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }, []);

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-bg)]">
      <Header
        searchOpen={searchOpen}
        onToggleSearch={() => {
          setSearchOpen(!searchOpen);
          if (searchOpen) setSearch('');
        }}
        searchValue={search}
        onSearchChange={setSearch}
      />

      <main className="flex-1 mx-auto w-full max-w-[1400px] px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
        {/* Page Title & Controls */}
        <div className="animate-fade-in flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-[var(--color-border)]">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-widest mb-1">
              <CalendarClock size={12} />
              <span>ACADEMIC TIMETABLE</span>
            </div>
            <h1 className="text-[1.75rem] sm:text-[2.25rem] md:text-[2.75rem] font-display font-semibold text-[var(--color-text)] tracking-[-0.025em] leading-[1.08]">
              Deadlines & Schedule
            </h1>
          </div>

          <CalendarControls
            year={year}
            month={month}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
            postCountBySubject={postCountBySubject}
            totalPosts={filteredPosts.length}
          />
        </div>

        {/* Main content */}
        {error ? (
          <ErrorState message={error} />
        ) : loading ? (
          <LoadingState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start animate-fade-in">
            {/* Calendar Grid (8 cols on large) */}
            <div className="lg:col-span-8">
              <CalendarGrid
                year={year}
                month={month}
                postsByDate={postsByDate}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            </div>

            {/* Sidebar (4 cols on large) */}
            <div className="lg:col-span-4">
              <CalendarSidebar
                selectedDate={selectedDate}
                selectedPosts={selectedPosts}
                allPosts={filteredPosts}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

