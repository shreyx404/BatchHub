import { useMemo } from 'react';
import { format, differenceInHours, isPast } from 'date-fns';
import { CONTENT_TYPES } from '../../lib/constants';

const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

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
      <div className="grid grid-cols-7 bg-[var(--color-surface-2)] border-b border-[var(--color-border)] text-center text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider py-2.5">
        {DAY_NAMES.map((name, i) => (
          <div key={name} className={i >= 5 ? 'text-[var(--color-text-dim)]' : ''}>
            {name}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {days.map((cell) => {
          const events = postsByDate[cell.dateKey] || [];
          const isSelected = selectedDate === cell.dateKey;

          const cellClasses = [
            'day-cell p-2 flex flex-col cursor-pointer',
            !cell.isCurrentMonth && 'day-cell-other',
            cell.isToday && 'day-cell-today',
            isSelected && 'day-cell-selected',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={cell.dateKey}
              className={cellClasses}
              onClick={() => onSelectDate(cell.dateKey)}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[var(--text-xs)] font-mono ${
                    cell.isToday
                      ? 'bg-[var(--color-text)] text-black px-1.5 py-0.5 font-bold'
                      : cell.isCurrentMonth
                        ? 'text-[var(--color-text-muted)]'
                        : 'text-[var(--color-text-dim)]'
                  }`}
                >
                  {String(cell.day).padStart(2, '0')}
                </span>
                {cell.isToday && (
                  <span className="text-[8px] font-mono uppercase tracking-wider text-[var(--color-text)] font-bold">
                    TODAY
                  </span>
                )}
              </div>

              {/* Event chips (max 2 visible + overflow count) */}
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                {events.slice(0, 2).map((post) => (
                  <EventChip key={post.id} post={post} />
                ))}
                {events.length > 2 && (
                  <span className="text-[8px] font-mono text-[var(--color-text-dim)] tracking-wider pl-1">
                    +{events.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar Footer / Legend */}
      <div className="px-4 py-2.5 bg-[#0a0a0a] border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-[var(--color-text-muted)] text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#3b1515] border border-[#f87171]" />
            <span>Due &lt; 24h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#121212] border border-[var(--color-border-light)]" />
            <span>Upcoming</span>
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
  const isOverdue = isPast(dueDate);
  const isUrgent = !isOverdue && hoursLeft < 24;
  const subjectCode = post.subjects?.code || post.subjects?.name || '';
  const typeConfig = CONTENT_TYPES[post.type];

  const chipClass = isUrgent
    ? 'event-chip p-1.5 bg-[#1e1414] border border-[#6b2121] hover:border-[#b91c1c]'
    : isOverdue
      ? 'event-chip p-1.5 bg-[#111] border border-[var(--color-border)] opacity-50'
      : 'event-chip p-1.5 bg-[#121212] border border-[var(--color-border)] hover:border-[var(--color-border-light)]';

  return (
    <div className={chipClass}>
      <div className="flex items-center justify-between text-[8px] font-mono">
        <span className={isUrgent ? 'text-[#fca5a5] font-bold' : 'text-[var(--color-text-muted)]'}>
          {subjectCode}
        </span>
        <span className={isUrgent ? 'text-[#fca5a5]' : 'text-[var(--color-text-dim)]'}>
          {format(dueDate, 'h:mm a')}
        </span>
      </div>
      <p className={`text-[10px] font-medium truncate mt-0.5 ${isUrgent ? 'text-white' : 'text-[var(--color-text)]'}`}>
        {post.title}
      </p>
      {isUrgent && (
        <div className="mt-0.5 text-[8px] font-mono text-[#f87171]">
          ⏳ In {hoursLeft}h
        </div>
      )}
    </div>
  );
}
