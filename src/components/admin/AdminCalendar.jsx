import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, addWeeks, subWeeks, isPast } from 'date-fns';
import CalendarControls from '../calendar/CalendarControls';
import CalendarGrid from '../calendar/CalendarGrid';
import CalendarWeekView from '../calendar/CalendarWeekView';
import CalendarAgendaView from '../calendar/CalendarAgendaView';
import CalendarSidebar from '../calendar/CalendarSidebar';
import LoadingState from '../ui/LoadingState';
import ErrorState from '../ui/ErrorState';
import { useCalendarPosts } from '../../hooks/useCalendar';
import { useSubjects } from '../../hooks/useSubjects';
import { CalendarClock, Plus } from 'lucide-react';

export default function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'agenda'
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'overdue' | 'archived' | 'draft'

  const navigate = useNavigate();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { posts, loading, error } = useCalendarPosts(year, month, { includeDrafts: true });
  const { subjects } = useSubjects();

  const now = new Date();

  // Status counts for filter chips
  const statusCounts = useMemo(() => {
    let published = 0;
    let overdue = 0;
    let archived = 0;
    let draft = 0;

    for (const post of posts) {
      if (!post.due_date) continue;
      if (post.status === 'archived') {
        archived++;
      } else if (post.status === 'draft') {
        draft++;
      } else if (new Date(post.due_date) <= now) {
        overdue++;
      } else {
        published++;
      }
    }

    return {
      all: posts.length,
      published,
      overdue,
      archived,
      draft,
    };
  }, [posts, now]);

  // Filter posts by subject, status, and viewMode
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (selectedSubject && p.subject_id !== selectedSubject) {
        return false;
      }
      if (viewMode === 'agenda') {
        // In Agenda view, never include archived or past posts
        if (!p.due_date) return false;
        if (p.status === 'archived') return false;
        if (isPast(new Date(p.due_date))) return false;
        return true;
      }
      if (statusFilter === 'all') return true;
      if (statusFilter === 'archived') return p.status === 'archived';
      if (statusFilter === 'draft') return p.status === 'draft';
      if (statusFilter === 'overdue') {
        return p.status !== 'archived' && p.status !== 'draft' && p.due_date && new Date(p.due_date) <= now;
      }
      if (statusFilter === 'published') {
        return p.status === 'published' && p.due_date && new Date(p.due_date) > now;
      }
      return true;
    });
  }, [posts, selectedSubject, statusFilter, now, viewMode]);

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
    const sourcePosts = viewMode === 'agenda'
      ? posts.filter((p) => p.due_date && p.status !== 'archived' && !isPast(new Date(p.due_date)))
      : posts;
    for (const post of sourcePosts) {
      if (post.subject_id) {
        counts[post.subject_id] = (counts[post.subject_id] || 0) + 1;
      }
    }
    return counts;
  }, [posts, viewMode]);

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
    setSelectedDate(format(today, 'yyyy-MM-dd'));
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
            <span>ADMIN DEADLINE CALENDAR</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-display font-medium text-[var(--color-text)] tracking-[-0.01em]">
              Deadlines & Schedule
            </h2>
            <button
              onClick={() => navigate('/admin/create')}
              className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black text-[11px] font-mono font-bold transition-colors"
            >
              <Plus size={12} />
              <span>New Deadline</span>
            </button>
          </div>
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
          showStatusFilters={viewMode !== 'agenda'}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusCounts={statusCounts}
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
          <div className="xl:col-span-8 min-w-0">
            {viewMode === 'month' && (
              <CalendarGrid
                year={year}
                month={month}
                postsByDate={postsByDate}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                isAdmin={true}
              />
            )}

            {viewMode === 'week' && (
              <CalendarWeekView
                currentDate={currentDate}
                postsByDate={postsByDate}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                isAdmin={true}
              />
            )}

            {viewMode === 'agenda' && (
              <CalendarAgendaView
                posts={filteredPosts}
                selectedSubject={selectedSubject}
                onSubjectChange={setSelectedSubject}
                isAdmin={true}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-4 xl:sticky xl:top-0 xl:max-h-[calc(100dvh-200px)] xl:overflow-y-auto xl:pr-1 min-w-0">
            <CalendarSidebar
              selectedDate={selectedDate}
              selectedPosts={selectedPosts}
              allPosts={filteredPosts}
              isAdmin={true}
              onSelectDate={handleSelectDate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
