import { useState, useMemo, useCallback } from 'react';
import { format, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';
import CalendarControls from '../calendar/CalendarControls';
import CalendarGrid from '../calendar/CalendarGrid';
import CalendarWeekView from '../calendar/CalendarWeekView';
import CalendarAgendaView from '../calendar/CalendarAgendaView';
import CalendarSidebar from '../calendar/CalendarSidebar';
import LoadingState from '../ui/LoadingState';
import ErrorState from '../ui/ErrorState';
import { useCalendarPosts } from '../../hooks/useCalendar';
import { useSubjects } from '../../hooks/useSubjects';
import { CalendarClock } from 'lucide-react';

export default function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'agenda'
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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
      if (!post.due_date) continue;
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

  // Navigation Handlers adapting to current view mode
  const handlePrev = useCallback(() => {
    setCurrentDate((prev) => {
      if (viewMode === 'week') {
        return subWeeks(prev, 1);
      }
      return subMonths(prev, 1);
    });
    setSelectedDate(null);
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => {
      if (viewMode === 'week') {
        return addWeeks(prev, 1);
      }
      return addMonths(prev, 1);
    });
    setSelectedDate(null);
  }, [viewMode]);

  const handleToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDate(key);
  }, []);

  const handleSelectDate = useCallback((dateKey) => {
    setSelectedDate(dateKey);
    if (window.innerWidth < 1280) {
      setTimeout(() => {
        const el = document.getElementById('calendar-inspector-target');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* Page Title & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-widest mb-1">
            <CalendarClock size={12} />
            <span>DEADLINE CALENDAR</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-medium text-[var(--color-text)] tracking-[-0.01em]">
            Deadlines & Schedule
          </h2>
        </div>

        <CalendarControls
          currentDate={currentDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onPrev={handlePrev}
          onNext={handleNext}
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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 items-start">
          {/* Primary Calendar View Area */}
          <div className="xl:col-span-8">
            {viewMode === 'month' && (
              <CalendarGrid
                year={year}
                month={month}
                postsByDate={postsByDate}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            )}

            {viewMode === 'week' && (
              <CalendarWeekView
                currentDate={currentDate}
                postsByDate={postsByDate}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            )}

            {viewMode === 'agenda' && (
              <CalendarAgendaView
                posts={filteredPosts}
                selectedSubject={selectedSubject}
                onSubjectChange={setSelectedSubject}
              />
            )}
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
