import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import CalendarControls from '../calendar/CalendarControls';
import CalendarGrid from '../calendar/CalendarGrid';
import CalendarSidebar from '../calendar/CalendarSidebar';
import LoadingState from '../ui/LoadingState';
import ErrorState from '../ui/ErrorState';
import { useCalendarPosts } from '../../hooks/useCalendar';
import { useSubjects } from '../../hooks/useSubjects';
import { CalendarClock } from 'lucide-react';

export default function AdminCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

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

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Title & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-widest mb-1">
            <CalendarClock size={12} />
            <span>DEADLINE CALENDAR</span>
          </div>
          <h2 className="text-xl font-display font-medium text-[var(--color-text)] tracking-[-0.01em]">
            Deadlines & Schedule
          </h2>
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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Calendar Grid */}
          <div className="xl:col-span-8">
            <CalendarGrid
              year={year}
              month={month}
              postsByDate={postsByDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-4">
            <CalendarSidebar
              selectedDate={selectedDate}
              selectedPosts={selectedPosts}
              allPosts={filteredPosts}
            />
          </div>
        </div>
      )}
    </div>
  );
}
