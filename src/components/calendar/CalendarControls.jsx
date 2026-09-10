import { useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
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
  search = '',
  onSearchChange,
  searchOpen = false,
  onToggleSearch,
}) {
  const searchInputRef = useRef(null);

  // Auto-focus input when search is opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Keyboard shortcut: Ctrl+K or Cmd+K opens/focuses search, Esc clears or closes
  useEffect(() => {
    if (!onSearchChange) return;

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!searchOpen && onToggleSearch) {
          onToggleSearch();
        }
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 30);
      } else if (e.key === 'Escape' && (searchOpen || search)) {
        if (search) {
          onSearchChange('');
        } else if (onToggleSearch) {
          onToggleSearch();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, search, onSearchChange, onToggleSearch]);

  // Label for date navigator depending on active view mode
  const dateLabel = useMemo(() => {
    if (!currentDate) return '';
    if (viewMode === 'week') {
      return formatWeekRange(currentDate);
    }
    return format(currentDate, 'MMMM yyyy');
  }, [currentDate, viewMode]);

  return (
    <div className="space-y-2.5 sm:space-y-3.5 w-full lg:w-auto">
      {/* Navigator & View Mode Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-2 sm:gap-3">
        
        {/* Date Navigator */}
        <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] w-full sm:w-auto justify-between">
          <button
            onClick={onPrev}
            className="px-3 py-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] border-r border-[var(--color-border)] transition-colors"
            aria-label={viewMode === 'week' ? 'Previous week' : 'Previous month'}
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-3 sm:px-4 py-2 text-[11px] sm:text-[var(--text-xs)] font-mono font-medium tracking-wider text-[var(--color-text)] uppercase select-none grow text-center min-w-[120px] sm:min-w-[160px]">
            {dateLabel}
          </span>
          <button
            onClick={onNext}
            className="px-3 py-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] border-l border-[var(--color-border)] transition-colors"
            aria-label={viewMode === 'week' ? 'Next week' : 'Next month'}
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Action Group: TODAY + SEARCH + View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={onToday}
            className="px-3.5 py-2 min-h-[38px] text-[11px] sm:text-[var(--text-xs)] font-mono bg-[var(--color-surface-3)] border border-[var(--color-border-light)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface)] transition-colors"
          >
            TODAY
          </button>

          {/* Search Button / Option */}
          {onSearchChange && (
            <button
              type="button"
              onClick={onToggleSearch}
              className={`px-3 py-2 min-h-[38px] text-[11px] sm:text-[var(--text-xs)] font-mono flex items-center gap-1.5 transition-colors border ${
                searchOpen || search
                  ? 'bg-[var(--color-surface-3)] border-[var(--color-amber)] text-[var(--color-amber)] font-bold'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)]'
              }`}
              aria-label={searchOpen ? 'Close search' : 'Search deadlines'}
              title="Search deadlines (Ctrl + K)"
            >
              <Search size={13} />
              <span>SEARCH</span>
              {search && (
                <span className="w-1.5 h-1.5 bg-[var(--color-amber)] ml-0.5" />
              )}
            </button>
          )}

          {/* View Mode Toggle: [ MONTH | WEEK | AGENDA ] */}
          <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] divide-x divide-[var(--color-border)] grow sm:grow-0 justify-center">
            <button
              onClick={() => onViewModeChange('month')}
              className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 min-h-[38px] text-[10.5px] sm:text-[var(--text-xs)] font-mono transition-colors text-center ${
                viewMode === 'month'
                  ? 'badge-inverse font-bold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
              }`}
            >
              MONTH
            </button>
            <button
              onClick={() => onViewModeChange('week')}
              className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 min-h-[38px] text-[10.5px] sm:text-[var(--text-xs)] font-mono transition-colors text-center ${
                viewMode === 'week'
                  ? 'badge-inverse font-bold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
              }`}
            >
              WEEK
            </button>
            <button
              onClick={() => onViewModeChange('agenda')}
              className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 min-h-[38px] text-[10.5px] sm:text-[var(--text-xs)] font-mono transition-colors text-center ${
                viewMode === 'agenda'
                  ? 'badge-inverse font-bold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
              }`}
            >
              AGENDA
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {onSearchChange && (searchOpen || search) && (
        <div className="flex items-center gap-2 animate-fade-in pt-0.5 pb-0.5">
          <div className="relative flex-1 group">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] group-focus-within:text-[var(--color-amber)] transition-colors"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search deadlines, subjects, or tags... (Ctrl + K / Esc)"
              className="w-full h-10 pl-9 pr-24 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--text-xs)] sm:text-[var(--text-sm)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-amber)] transition-colors tracking-[0.005em]"
            />
            {search ? (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-[var(--color-amber)] bg-[var(--color-surface-2)] border border-[var(--color-border)] px-1.5 py-0.5">
                  {totalPosts} {totalPosts === 1 ? 'match' : 'matches'}
                </span>
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="p-1 min-h-[24px] min-w-[24px] flex items-center justify-center text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors"
                  aria-label="Clear search input"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-0.5 text-[10px] font-mono text-[var(--color-text-dim)] bg-[var(--color-surface-2)] border border-[var(--color-border)] px-1.5 py-0.5">
                <span>Ctrl</span>
                <span>K</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              if (onToggleSearch) onToggleSearch();
            }}
            className="px-3 py-2 min-h-[40px] text-[10.5px] font-mono uppercase bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-colors shrink-0"
            title="Close search"
          >
            Close
          </button>
        </div>
      )}

      {/* Optional Status Filters for Admin / Detailed View */}
      {showStatusFilters && onStatusFilterChange && (
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto touch-scroll py-0.5 -mx-3 px-3 sm:mx-0 sm:px-0">
          <span className="text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider shrink-0 mr-1">
            Status:
          </span>
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`px-2.5 py-1 min-h-[30px] text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap active:scale-[0.98] ${
              statusFilter === 'all'
                ? 'badge-inverse font-bold'
                : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-light)]'
            }`}
          >
            All ({statusCounts.all ?? totalPosts})
          </button>
          <button
            onClick={() => onStatusFilterChange('published')}
            className={`px-2.5 py-1 min-h-[30px] text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap active:scale-[0.98] ${
              statusFilter === 'published'
                ? 'badge-inverse font-bold'
                : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-light)]'
            }`}
          >
            Upcoming ({statusCounts.published ?? 0})
          </button>
          <button
            onClick={() => onStatusFilterChange('overdue')}
            className={`px-2.5 py-1 min-h-[30px] text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap active:scale-[0.98] ${
              statusFilter === 'overdue'
                ? 'bg-[#ef4444] text-white font-bold'
                : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-red-500 hover:text-red-400 hover:border-red-400'
            }`}
          >
            Past Due ({statusCounts.overdue ?? 0})
          </button>
          <button
            onClick={() => onStatusFilterChange('archived')}
            className={`px-2.5 py-1 min-h-[30px] text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap active:scale-[0.98] ${
              statusFilter === 'archived'
                ? 'bg-zinc-600 text-white font-bold'
                : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-light)]'
            }`}
          >
            Archived ({statusCounts.archived ?? 0})
          </button>
          {(statusCounts.draft > 0 || statusFilter === 'draft') && (
            <button
              onClick={() => onStatusFilterChange('draft')}
              className={`px-2.5 py-1 min-h-[30px] text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap active:scale-[0.98] ${
                statusFilter === 'draft'
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-amber-500 hover:text-amber-400 hover:border-amber-400'
              }`}
            >
              Drafts ({statusCounts.draft ?? 0})
            </button>
          )}
        </div>
      )}

      {/* Subject Filters (Touch scrollable with momentum) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto touch-scroll py-1 -mx-3 px-3 sm:mx-0 sm:px-0">
        <span className="text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider shrink-0 mr-1">
          Subject:
        </span>
        <button
          onClick={() => onSubjectChange(null)}
          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 min-h-[32px] sm:min-h-[34px] text-[11px] sm:text-[var(--text-xs)] font-medium whitespace-nowrap transition-colors active:scale-[0.98] ${
            !selectedSubject
              ? 'badge-inverse font-semibold border border-[var(--color-text)]'
              : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-light)] hover:text-[var(--color-text)] active:bg-[var(--color-surface)]'
          }`}
        >
          All Subjects ({totalPosts})
        </button>
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSubjectChange(selectedSubject === subject.id ? null : subject.id)}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 min-h-[32px] sm:min-h-[34px] text-[11px] sm:text-[var(--text-xs)] whitespace-nowrap transition-colors active:scale-[0.98] ${
              selectedSubject === subject.id
                ? 'badge-inverse font-semibold border border-[var(--color-text)]'
                : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-light)] hover:text-[var(--color-text)] active:bg-[var(--color-surface)]'
            }`}
          >
            {subject.code || subject.name}
            <span className={`ml-1 ${selectedSubject === subject.id ? 'opacity-80 font-bold' : 'text-[var(--color-text-dim)]'}`}>
              ({postCountBySubject[subject.id] || 0})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
