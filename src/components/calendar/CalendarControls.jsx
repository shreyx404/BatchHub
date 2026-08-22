import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarControls({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onToday,
  subjects,
  selectedSubject,
  onSubjectChange,
  postCountBySubject,
  totalPosts,
}) {
  return (
    <div className="space-y-3 sm:space-y-4 w-full md:w-auto">
      {/* Month Navigator & View Mode Bar */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3">
        
        {/* Date Navigator */}
        <div className="flex items-center bg-[#0a0a0a] border border-[var(--color-border)] grow sm:grow-0 justify-between">
          <button
            onClick={onPrevMonth}
            className="px-2.5 sm:px-3 py-2 min-h-[38px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] border-r border-[var(--color-border)] transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-2 sm:px-4 py-2 text-[11px] sm:text-[var(--text-xs)] font-mono font-medium tracking-wider text-[var(--color-text)] uppercase select-none grow text-center min-w-[110px] sm:min-w-[130px]">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={onNextMonth}
            className="px-2.5 sm:px-3 py-2 min-h-[38px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] border-l border-[var(--color-border)] transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Action Group: TODAY + View Mode */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToday}
            className="px-3 py-2 min-h-[38px] text-[11px] sm:text-[var(--text-xs)] font-mono bg-[var(--color-surface-3)] border border-[var(--color-border-light)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface)] transition-colors"
          >
            TODAY
          </button>

          {/* View Mode — Month only for now */}
          <div className="flex items-center bg-[#0a0a0a] border border-[var(--color-border)]">
            <button className="px-2.5 sm:px-3 py-2 min-h-[38px] text-[11px] sm:text-[var(--text-xs)] font-mono bg-[var(--color-text)] text-black font-semibold">
              MONTH
            </button>
            <button
              disabled
              className="hidden xs:inline-block sm:inline-block px-2.5 sm:px-3 py-2 min-h-[38px] text-[11px] sm:text-[var(--text-xs)] font-mono text-[var(--color-text-dim)] border-l border-[var(--color-border)] cursor-not-allowed opacity-40"
            >
              WEEK
            </button>
            <button
              disabled
              className="hidden sm:inline-block px-2.5 sm:px-3 py-2 min-h-[38px] text-[11px] sm:text-[var(--text-xs)] font-mono text-[var(--color-text-dim)] border-l border-[var(--color-border)] cursor-not-allowed opacity-40"
            >
              AGENDA
            </button>
          </div>
        </div>
      </div>

      {/* Subject Filters (Touch scrollable with momentum) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <span className="text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider shrink-0 mr-1">
          Filter:
        </span>
        <button
          onClick={() => onSubjectChange(null)}
          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 min-h-[32px] sm:min-h-[34px] text-[11px] sm:text-[var(--text-xs)] font-medium whitespace-nowrap transition-colors ${
            !selectedSubject
              ? 'bg-[var(--color-text)] text-black'
              : 'bg-[#0a0a0a] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-light)] hover:text-[var(--color-text)] active:bg-[var(--color-surface-2)]'
          }`}
        >
          All Deadlines ({totalPosts})
        </button>
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSubjectChange(selectedSubject === subject.id ? null : subject.id)}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 min-h-[32px] sm:min-h-[34px] text-[11px] sm:text-[var(--text-xs)] whitespace-nowrap transition-colors ${
              selectedSubject === subject.id
                ? 'bg-[var(--color-text)] text-black font-medium'
                : 'bg-[#0a0a0a] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-light)] hover:text-[var(--color-text)] active:bg-[var(--color-surface-2)]'
            }`}
          >
            {subject.code || subject.name}
            <span className={`ml-1 ${selectedSubject === subject.id ? 'text-black/60' : 'text-[var(--color-text-dim)]'}`}>
              ({postCountBySubject[subject.id] || 0})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

