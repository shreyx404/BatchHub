import { useMemo } from 'react';
import { format, differenceInHours, isPast } from 'date-fns';
import { CONTENT_TYPES } from '../../lib/constants';

const DAY_NAMES = [
  { short: 'MO', full: 'MON' },
  { short: 'TU', full: 'TUE' },
  { short: 'WE', full: 'WED' },
  { short: 'TH', full: 'THU' },
  { short: 'FR', full: 'FRI' },
  { short: 'SA', full: 'SAT' },
  { short: 'SU', full: 'SUN' },
];

/**
 * Build a 7×N grid of day cells for a given month.
 * Each cell: { date: Date, day: number, isCurrentMonth: boolean, isToday: boolean, dateKey: string }
 */
function buildCalendarDays(year, month) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday-based week: getDay() returns 0=Sun..6=Sat → convert to 0=Mon..6=Sun
  const startDow = (firstDay.getDay() + 6) % 7;

  const days = [];

  // Previous month overflow
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({ date: d, day: d.getDate(), isCurrentMonth: false, isToday: key === todayStr, dateKey: key });
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ date, day: d, isCurrentMonth: true, isToday: key === todayStr, dateKey: key });
  }

  // Next month overflow (fill to complete last week row)
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({ date: d, day: d.getDate(), isCurrentMonth: false, isToday: key === todayStr, dateKey: key });
    }
  }

  return days;
}

export default function CalendarGrid({ year, month, postsByDate, selectedDate, onSelectDate }) {
  const days = useMemo(() => buildCalendarDays(year, month), [year, month]);

  return (
    <div className="border border-[var(--color-border)] flex flex-col">
      {/* Day Names Header */}
      <div className="grid grid-cols-7 bg-[var(--color-surface-2)] border-b border-[var(--color-border)] text-center text-[9px] sm:text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider py-2 sm:py-2.5">
        {DAY_NAMES.map(({ short, full }, i) => (
          <div key={full} className={i >= 5 ? 'text-[var(--color-text-dim)]' : ''}>
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{full}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {days.map((cell) => {
          const events = postsByDate[cell.dateKey] || [];
          const isSelected = selectedDate === cell.dateKey;
          const hasUrgent = events.some((post) => {
            const d = new Date(post.due_date);
            return !isPast(d) && differenceInHours(d, new Date()) < 24;
          });

          const cellClasses = [
            'day-cell p-1.5 sm:p-2 flex flex-col justify-between sm:justify-start cursor-pointer active:scale-[0.98] sm:active:scale-100',
            !cell.isCurrentMonth && 'day-cell-other',
            cell.isToday && 'day-cell-today',
            isSelected && 'day-cell-selected',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={cell.dateKey}
              className={cellClasses}
              onClick={() => onSelectDate(cell.dateKey)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectDate(cell.dateKey);
                }
              }}
              aria-label={`${cell.dateKey}, ${events.length} deadlines`}
            >
              {/* Date number */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] sm:text-[var(--text-xs)] font-mono ${
                    cell.isToday
                      ? 'bg-white text-black px-1 sm:px-1.5 py-0.2 sm:py-0.5 font-bold'
                      : cell.isCurrentMonth
                        ? 'text-[var(--color-text-muted)]'
                        : 'text-[var(--color-text-dim)]'
                  }`}
                >
                  {String(cell.day).padStart(2, '0')}
                </span>
                {cell.isToday && (
                  <span className="hidden sm:inline text-[8px] font-mono uppercase tracking-wider text-[var(--color-text)] font-bold">
                    TODAY
                  </span>
                )}
              </div>

              {/* Mobile View: Event indicators (dots / compact count) */}
              <div className="flex sm:hidden items-center justify-center gap-1 mt-1 flex-wrap">
                {events.slice(0, 3).map((post, idx) => {
                  const d = new Date(post.due_date);
                  const isPostArchived = post.status === 'archived';
                  const isPostDraft = post.status === 'draft';
                  const isPostPast = !isPostDraft && isPast(d);
                  const isPostUrgent = !isPostPast && !isPostArchived && !isPostDraft && differenceInHours(d, new Date()) < 24;

                  return (
                    <span
                      key={idx}
                      className={`w-1.5 h-1.5 inline-block ${
                        isPostUrgent
                          ? 'bg-[#ef4444] shadow-[0_0_4px_#ef4444]'
                          : isPostDraft
                            ? 'bg-amber-400'
                            : isPostArchived
                              ? 'bg-[#8888a0]'
                              : isPostPast
                                ? 'bg-red-400/80'
                                : 'bg-[var(--color-text-muted)]'
                      }`}
                    />
                  );
                })}
                {events.length > 3 && (
                  <span className="text-[7px] font-mono text-[var(--color-text-dim)] font-bold leading-none">
                    +{events.length - 3}
                  </span>
                )}
              </div>

              {/* Tablet & Desktop View: Rich Event chips */}
              <div className="hidden sm:flex flex-col gap-1 flex-1 min-w-0 mt-1">
                {events.slice(0, 2).map((post) => (
                  <EventChip key={post.id} post={post} />
                ))}
                {events.length > 2 && (
                  <span className="text-[8px] font-mono text-[var(--color-text-dim)] tracking-wider pl-1 font-semibold">
                    +{events.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar Footer / Legend */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0a0a0a] border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[var(--color-text-muted)] text-[9px] sm:text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#3b1515] border border-[#f87171]" />
            <span>Due &lt; 24h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#121212] border border-[var(--color-border-light)]" />
            <span>Upcoming</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#261010] border border-[#6b2121]" />
            <span>Past Due</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#14141c] border border-[#3b3b4f]" />
            <span>Archived</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventChip({ post }) {
  const dueDate = new Date(post.due_date);
  const now = new Date();
  const hoursLeft = differenceInHours(dueDate, now);
  const isArchived = post.status === 'archived';
  const isDraft = post.status === 'draft';
  const isOverdue = !isDraft && isPast(dueDate);
  const isUrgent = !isArchived && !isDraft && !isOverdue && hoursLeft < 24;
  const subjectCode = post.subjects?.code || post.subjects?.name || '';

  const chipClass = isUrgent
    ? 'event-chip p-1 sm:p-1.5 bg-[#1e1010] border border-[#7f1d1d] hover:border-[#b91c1c] transition-colors'
    : isArchived
      ? 'event-chip p-1 sm:p-1.5 bg-[#0f0f15] border border-[#2b2b3b] hover:border-[#4b4b66] transition-colors'
      : isDraft
        ? 'event-chip p-1 sm:p-1.5 bg-[#14120a] border border-[#453610] hover:border-[#735817] transition-colors'
        : isOverdue
          ? 'event-chip p-1 sm:p-1.5 bg-[#170a0a] border border-[#4a1d1d] hover:border-[#702424] transition-colors'
          : 'event-chip p-1 sm:p-1.5 bg-[#121214] border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-colors';

  return (
    <div className={chipClass}>
      <div className="flex items-center justify-between text-[7.5px] sm:text-[8px] font-mono gap-1.5 min-w-0">
        <span
          className={`truncate font-bold ${
            isUrgent
              ? 'text-[#fca5a5]'
              : isArchived
                ? 'text-[#a0a0b8]'
                : isDraft
                  ? 'text-amber-300'
                  : isOverdue
                    ? 'text-red-300'
                    : 'text-[var(--color-text-muted)]'
          }`}
        >
          {subjectCode}
        </span>
        <span
          className={`shrink-0 font-medium ${
            isUrgent
              ? 'text-[#fca5a5]'
              : isArchived
                ? 'text-[#85859e]'
                : isDraft
                  ? 'text-amber-400'
                  : isOverdue
                    ? 'text-red-400'
                    : 'text-[var(--color-text-dim)]'
          }`}
        >
          {isArchived ? 'Archived' : isDraft ? 'Draft' : format(dueDate, 'h:mm a')}
        </span>
      </div>
      <p
        className={`text-[9.5px] sm:text-[10px] font-medium truncate mt-0.5 ${
          isUrgent
            ? 'text-white'
            : isArchived
              ? 'text-[#c0c0d8]'
              : isDraft
                ? 'text-amber-100'
                : isOverdue
                  ? 'text-red-100'
                  : 'text-[var(--color-text)]'
        }`}
      >
        {post.title}
      </p>
      {isUrgent && (
        <div className="mt-0.5 text-[7px] sm:text-[8px] font-mono text-[#f87171] font-semibold">
          ⏳ In {hoursLeft}h
        </div>
      )}
    </div>
  );
}

