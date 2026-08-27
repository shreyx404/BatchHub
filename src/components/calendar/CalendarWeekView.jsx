import { useMemo } from 'react';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  differenceInHours,
  isPast,
} from 'date-fns';
import { Link } from 'react-router-dom';
import { CONTENT_TYPES } from '../../lib/constants';

export default function CalendarWeekView({
  currentDate,
  postsByDate,
  selectedDate,
  onSelectDate,
}) {
  // Generate the 7 days of the active week (Monday to Sunday)
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  return (
    <div className="border border-[var(--color-border)] flex flex-col bg-[#050505] animate-fade-in overflow-hidden">
      {/* Scrollable Container for Mobile / Tablet responsiveness with touch momentum */}
      <div className="overflow-x-auto scrollbar-hide touch-pan-x">
        <div className="min-w-[840px] md:min-w-0">
          {/* Week Day Header */}
          <div className="grid grid-cols-7 bg-[var(--color-surface-2)] border-b border-[var(--color-border)] text-center divide-x divide-[var(--color-border)]">
            {weekDays.map((day) => {
              const todayDay = isToday(day);
              const dateKey = format(day, 'yyyy-MM-dd');
              const isSelected = selectedDate === dateKey;

              return (
                <div
                  key={dateKey}
                  onClick={() => onSelectDate(dateKey)}
                  className={`py-2.5 px-2 cursor-pointer transition-colors ${
                    todayDay
                      ? 'bg-[#0d0d12]'
                      : isSelected
                        ? 'bg-[var(--color-surface-3)]'
                        : 'hover:bg-[var(--color-surface-3)]'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectDate(dateKey);
                    }
                  }}
                  aria-label={`Select ${format(day, 'EEEE, MMM d')}`}
                >
                  <div className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">
                    {format(day, 'EEE')}
                  </div>
                  <div className="mt-1 flex items-center justify-center">
                    <span
                      className={`text-[12px] sm:text-[var(--text-sm)] font-mono ${
                        todayDay
                          ? 'bg-white text-black px-1.5 py-0.5 font-bold'
                          : isSelected
                            ? 'text-white font-bold underline underline-offset-4'
                            : 'text-[var(--color-text)] font-medium'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                  {todayDay && (
                    <span className="block mt-0.5 text-[8px] font-mono uppercase tracking-wider text-[var(--color-text)] font-bold">
                      TODAY
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 7 Columns for the 7 Days */}
          <div className="grid grid-cols-7 divide-x divide-[var(--color-border)] bg-[#050505] min-h-[380px] sm:min-h-[460px]">
            {weekDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const events = postsByDate[dateKey] || [];
              const todayDay = isToday(day);
              const isSelected = selectedDate === dateKey;

              const colClasses = [
                'p-2 sm:p-2.5 flex flex-col gap-2 transition-colors relative cursor-pointer',
                todayDay ? 'bg-[#0a0a0e]' : 'bg-[#050505]',
                isSelected && 'outline outline-[1.5px] outline-white -outline-offset-[1.5px] z-10',
                'hover:bg-[#0c0c10]',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div
                  key={dateKey}
                  className={colClasses}
                  onClick={() => onSelectDate(dateKey)}
                  role="region"
                  aria-label={`${format(day, 'EEEE, MMMM d')}, ${events.length} deadlines`}
                >
                  {/* Top Day Accent Line for Today */}
                  {todayDay && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-white" />
                  )}

                  {/* Deadline Cards inside the Day Column */}
                  {events.length > 0 ? (
                    <div className="flex flex-col gap-2 flex-1">
                      {events.map((post) => (
                        <WeekEventCard
                          key={post.id}
                          post={post}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDate(dateKey);
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-6 opacity-30 select-none">
                      <span className="text-[10px] font-mono text-[var(--color-text-dim)]">
                        —
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Week Footer / Legend & Touch Scroll Helper */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0a0a0a] border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-3 sm:gap-4 text-[var(--color-text-muted)] text-[9px] sm:text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#3b1515] border border-[#f87171]" />
            <span>Due &lt; 24h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#121212] border border-[var(--color-border-light)]" />
            <span>Upcoming</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#0a0a0c] border border-[var(--color-border)]/50 opacity-50" />
            <span>Past / Archived</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-mono text-[var(--color-text-dim)]">
          <span className="md:hidden">← Swipe week →</span>
          <span className="hidden md:inline">Mon – Sun · 7-Day Timetable</span>
        </div>
      </div>
    </div>
  );
}

function WeekEventCard({ post, onClick }) {
  const dueDate = new Date(post.due_date);
  const now = new Date();
  const hoursLeft = differenceInHours(dueDate, now);
  const isArchived = post.status === 'archived';
  const isOverdue = isPast(dueDate);
  const isFaded = isArchived || isOverdue;
  const isUrgent = !isFaded && hoursLeft < 24;
  const subjectCode = post.subjects?.code || post.subjects?.name || '';
  const links = post.links || [];

  const cardClass = isUrgent
    ? 'p-2 sm:p-2.5 bg-[#1e1414] border border-[#6b2121] hover:border-[#ef4444] transition-all shadow-sm'
    : isFaded
      ? 'p-2 sm:p-2.5 bg-[#0a0a0c]/80 border border-[var(--color-border)]/40 opacity-55 hover:opacity-95 transition-all'
      : 'p-2 sm:p-2.5 bg-[#121214] border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-all';

  return (
    <div
      onClick={onClick}
      className={cardClass}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      }}
    >
      {/* Top row: Subject & Time */}
      <div className="flex items-center justify-between text-[8.5px] sm:text-[9px] font-mono gap-1 mb-1">
        <span
          className={`truncate font-semibold ${
            isUrgent ? 'text-[#fca5a5]' : isFaded ? 'text-[var(--color-text-dim)]' : 'text-[var(--color-text-muted)]'
          }`}
        >
          {subjectCode}
        </span>
        <span
          className={`shrink-0 ${
            isUrgent ? 'text-[#fca5a5]' : 'text-[var(--color-text-dim)]'
          }`}
        >
          {isArchived ? 'Archived' : format(dueDate, 'h:mm a')}
        </span>
      </div>

      {/* Title */}
      <h4
        className={`text-[10.5px] sm:text-[11px] font-medium leading-snug line-clamp-2 ${
          isUrgent ? 'text-white' : isFaded ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'
        }`}
      >
        {post.title}
      </h4>

      {/* Urgency Badge or Countdown */}
      {isUrgent && (
        <div className="mt-1.5 text-[8px] font-mono text-[#f87171] font-semibold flex items-center gap-1">
          <span>⏳</span>
          <span>In {hoursLeft}h</span>
        </div>
      )}

      {/* Attached Links count indicator */}
      {links.length > 0 && (
        <div className="mt-2 pt-1 border-t border-[var(--color-border)]/50 flex items-center justify-between text-[8px] sm:text-[8.5px] font-mono text-[var(--color-text-dim)]">
          <span>↗ {links.length} link{links.length > 1 ? 's' : ''}</span>
          <Link
            to={`/post/${post.id}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-white underline underline-offset-2 transition-colors px-1"
          >
            Details →
          </Link>
        </div>
      )}
    </div>
  );
}
