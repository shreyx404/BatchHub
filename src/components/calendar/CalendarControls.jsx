import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isSameMonth, isSameYear } from 'date-fns';

function formatWeekRange(date) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  if (isSameMonth(start, end)) {
    return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`;
  }
  if (isSameYear(start, end)) {
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }
  return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
}

export default function CalendarControls({
  currentDate,
  viewMode = 'month',
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  subjects,
  selectedSubject,
  onSubjectChange,
  postCountBySubject,
  totalPosts,
  showStatusFilters = false,
  statusFilter = 'all',
  onStatusFilterChange,
  statusCounts = {},
}) {
  // Label for date navigator depending on active view mode
  const dateLabel = useMemo(() => {
    if (!currentDate) return '';
    if (viewMode === 'week') {
      return formatWeekRange(currentDate);
    }
    return format(currentDate, 'MMMM yyyy');
  }, [currentDate, viewMode]);

  return (
    <div className="space-y-3 sm:space-y-3.5 w-full md:w-auto">
      {/* Navigator & View Mode Bar */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3">
        
        {/* Date Navigator */}
        <div className="flex items-center bg-[#0a0a0a] border border-[var(--color-border)] grow sm:grow-0 justify-between">
          <button
            onClick={onPrev}
            className="px-2.5 sm:px-3 py-2 min-h-[38px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] border-r border-[var(--color-border)] transition-colors"
            aria-label={viewMode === 'week' ? 'Previous week' : 'Previous month'}
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-2.5 sm:px-4 py-2 text-[11px] sm:text-[var(--text-xs)] font-mono font-medium tracking-wider text-[var(--color-text)] uppercase select-none grow text-center min-w-[130px] sm:min-w-[160px]">
            {dateLabel}
          </span>
          <button
            onClick={onNext}
            className="px-2.5 sm:px-3 py-2 min-h-[38px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] border-l border-[var(--color-border)] transition-colors"
            aria-label={viewMode === 'week' ? 'Next week' : 'Next month'}
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Action Group: TODAY + View Mode Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToday}
            className="px-3 py-2 min-h-[38px] text-[11px] sm:text-[var(--text-xs)] font-mono bg-[var(--color-surface-3)] border border-[var(--color-border-light)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface)] transition-colors"
          >
            TODAY
          </button>

          {/* View Mode Toggle: [ MONTH | WEEK | AGENDA ] */}
          <div className="flex items-center bg-[#0a0a0a] border border-[var(--color-border)] divide-x divide-[var(--color-border)]">
            <button
              onClick={() => onViewModeChange('month')}
              className={`px-2.5 sm:px-3 py-2 min-h-[38px] text-[10px] sm:text-[var(--text-xs)] font-mono transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-black font-bold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
              }`}
            >
              MONTH
            </button>
            <button
              onClick={() => onViewModeChange('week')}
              className={`px-2.5 sm:px-3 py-2 min-h-[38px] text-[10px] sm:text-[var(--text-xs)] font-mono transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-black font-bold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
              }`}
            >
              WEEK
            </button>
            <button
              onClick={() => onViewModeChange('agenda')}
              className={`px-2.5 sm:px-3 py-2 min-h-[38px] text-[10px] sm:text-[var(--text-xs)] font-mono transition-colors ${
                viewMode === 'agenda'
                  ? 'bg-white text-black font-bold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
              }`}
            >
              AGENDA
            </button>
          </div>
        </div>
      </div>

      {/* Optional Status Filters for Admin / Detailed View */}
      {showStatusFilters && onStatusFilterChange && (
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
          <span className="text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider shrink-0 mr-1">
            Status:
          </span>
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`px-2.5 py-1 min-h-[30px] text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider transition-colors ${
              statusFilter === 'all'
                ? 'bg-white text-black font-bold'
                : 'bg-[#0a0a0a] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-border-light)]'
            }`}
          >
            All ({statusCounts.all ?? totalPosts})
          </button>
          <button
            onClick={() => onStatusFilterChange('published')}
            className={`px-2.5 py-1 min-h-[30px] text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider transition-colors ${
              statusFilter === 'published'
                ? 'bg-white text-black font-bold'
                : 'bg-[#0a0a0a] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-border-light)]'
            }`}
          >
            Upcoming ({statusCounts.published ?? 0})
          </button>
          <button
            onClick={() => onStatusFilterChange('overdue')}
            className={`px-2.5 py-1 min-h-[30px] text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider transition-colors ${
              statusFilter === 'overdue'
                ? 'bg-[#ef4444] text-white font-bold'
                : 'bg-[#0a0a0a] border border-[var(--color-border)] text-red-400/90 hover:text-red-300 hover:border-red-800'
            }`}
          >
            Past Due ({statusCounts.overdue ?? 0})
          </button>
          <button
            onClick={() => onStatusFilterChange('archived')}
            className={`px-2.5 py-1 min-h-[30px] text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider transition-colors ${
              statusFilter === 'archived'
                ? 'bg-[#8888a0] text-black font-bold'
                : 'bg-[#0a0a0a] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-border-light)]'
            }`}
          >
            Archived ({statusCounts.archived ?? 0})
          </button>
          {(statusCounts.draft > 0 || statusFilter === 'draft') && (
            <button
              onClick={() => onStatusFilterChange('draft')}
              className={`px-2.5 py-1 min-h-[30px] text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-[#0a0a0a] border border-[var(--color-border)] text-amber-400/90 hover:text-amber-300 hover:border-amber-700'
              }`}
            >
              Drafts ({statusCounts.draft ?? 0})
            </button>
          )}
        </div>
      )}

      {/* Subject Filters (Touch scrollable with momentum) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <span className="text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider shrink-0 mr-1">
          Subject:
        </span>
        <button
          onClick={() => onSubjectChange(null)}
          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 min-h-[32px] sm:min-h-[34px] text-[11px] sm:text-[var(--text-xs)] font-medium whitespace-nowrap transition-colors ${
            !selectedSubject
              ? 'bg-white text-black font-semibold border border-white'
              : 'bg-[#0a0a0a] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-light)] hover:text-[var(--color-text)] active:bg-[var(--color-surface-2)]'
          }`}
        >
          All Subjects ({totalPosts})
        </button>
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSubjectChange(selectedSubject === subject.id ? null : subject.id)}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 min-h-[32px] sm:min-h-[34px] text-[11px] sm:text-[var(--text-xs)] whitespace-nowrap transition-colors ${
              selectedSubject === subject.id
                ? 'bg-white text-black font-semibold border border-white'
                : 'bg-[#0a0a0a] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-light)] hover:text-[var(--color-text)] active:bg-[var(--color-surface-2)]'
            }`}
          >
            {subject.code || subject.name}
            <span className={`ml-1 ${selectedSubject === subject.id ? 'text-black/80 font-bold' : 'text-[var(--color-text-dim)]'}`}>
              ({postCountBySubject[subject.id] || 0})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
