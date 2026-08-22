import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow, differenceInHours, isPast, addDays } from 'date-fns';
import { CONTENT_TYPES } from '../../lib/constants';
import { CalendarClock } from 'lucide-react';

export default function CalendarSidebar({ selectedDate, selectedPosts, allPosts }) {
  // Sort selected date posts by due time ascending (earliest first)
  const sortedSelectedPosts = useMemo(() => {
    if (!selectedPosts || selectedPosts.length === 0) return [];
    return [...selectedPosts].sort((a, b) => {
      const timeA = a.due_date ? new Date(a.due_date).getTime() : 0;
      const timeB = b.due_date ? new Date(b.due_date).getTime() : 0;
      return timeA - timeB;
    });
  }, [selectedPosts]);

  // Upcoming in 7 days from today (excluding posts on the selected date to avoid duplication)
  const now = new Date();
  const weekFromNow = addDays(now, 7);
  const selectedDateKey = selectedDate;

  const upcomingPosts = useMemo(() => {
    return allPosts
      .filter((p) => {
        if (!p.due_date) return false;
        const d = new Date(p.due_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        // If a date is selected, optionally avoid showing duplicates if already displayed above
        return d > now && d <= weekFromNow && key !== selectedDateKey;
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5);
  }, [allPosts, now, weekFromNow, selectedDateKey]);

  return (
    <div id="calendar-inspector-target" className="flex flex-col gap-4 sm:gap-5 scroll-mt-20">
      {/* Selected Date Deadlines: All posts of that day combined & sorted by time */}
      {sortedSelectedPosts.length > 0 ? (
        <div className="flex flex-col gap-3">
          {/* Section Header */}
          <div className="flex items-center justify-between px-1 pb-0.5">
            <div className="flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-wider text-[var(--color-text)] font-semibold">
              <CalendarClock size={13} className="text-[var(--color-text-muted)]" />
              <span>
                {format(new Date(sortedSelectedPosts[0].due_date), 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--color-text-dim)]">
              {sortedSelectedPosts.length} {sortedSelectedPosts.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          {/* All Posts on this date rendered as highlighted cards */}
          <div className="flex flex-col gap-3.5">
            {sortedSelectedPosts.map((post) => (
              <InspectorCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-4 sm:p-5">
          <div className="flex flex-col items-center justify-center py-5 sm:py-6 text-center">
            <CalendarClock size={26} className="text-[var(--color-text-dim)] mb-2.5" />
            <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-muted)]">
              Select a date
            </p>
            <p className="text-[10px] text-[var(--color-text-dim)] mt-1 font-mono tracking-wider">
              Tap a date with deadlines to view all deliverables
            </p>
          </div>
        </div>
      )}

      {/* Upcoming in 7 Days Queue */}
      {upcomingPosts.length > 0 && (
        <div className="bg-[#050505] border border-[var(--color-border)] p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
            <h3 className="font-display text-[var(--text-sm)] font-semibold text-[var(--color-text)]">
              Upcoming in 7 Days
            </h3>
            <span className="text-[10px] font-mono text-[var(--color-text-dim)]">
              {upcomingPosts.length} Item{upcomingPosts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-col divide-y divide-[#171717]">
            {upcomingPosts.map((post) => (
              <UpcomingItem key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InspectorCard({ post }) {
  const dueDate = new Date(post.due_date);
  const now = new Date();
  const hoursLeft = differenceInHours(dueDate, now);
  const isOverdue = isPast(dueDate);
  const isUrgent = !isOverdue && hoursLeft < 24;
  const subjectName = post.subjects?.name || post.subjects?.code || '';
  const subjectCode = post.subjects?.code || '';
  const typeConfig = CONTENT_TYPES[post.type];
  const links = post.links || [];

  // Countdown text
  let countdownText = '';
  if (isOverdue) {
    countdownText = 'Overdue';
  } else if (hoursLeft < 1) {
    countdownText = 'Due soon';
  } else if (hoursLeft < 24) {
    countdownText = `⏳ In ${hoursLeft}h`;
  } else {
    countdownText = formatDistanceToNow(dueDate, { addSuffix: false }) + ' left';
  }

  // Content preview (cleaned Markdown)
  const cleanSnippet = post.content
    ? post.content.replace(/[#*`_~>|\-]/g, '').replace(/\s+/g, ' ').trim().substring(0, 180)
    : '';

  return (
    <div
      className={`border p-4 sm:p-5 animate-fade-in transition-all ${
        isUrgent
          ? 'bg-[#120a0a] border-[#6b2121] shadow-sm'
          : isOverdue
            ? 'bg-[#0a0a0a] border-[var(--color-border)] opacity-75 hover:opacity-100'
            : 'bg-[#0c0c0e] border-[var(--color-border-light)]'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)] flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isUrgent && (
            <span className="px-2 py-0.5 bg-red-950/70 border border-red-800/80 text-red-300 text-[9px] font-mono font-semibold uppercase tracking-wider">
              URGENT
            </span>
          )}
          {isOverdue && (
            <span className="px-2 py-0.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-dim)] text-[9px] font-mono font-semibold uppercase tracking-wider">
              OVERDUE
            </span>
          )}
          <span className="text-[10px] font-mono text-[var(--color-text-muted)] font-medium">
            Due at {format(dueDate, 'h:mm a')}
          </span>
        </div>
        <span
          className={`text-[10px] font-mono font-bold ${
            isUrgent ? 'text-red-400' : isOverdue ? 'text-[var(--color-text-dim)]' : 'text-[var(--color-text-muted)]'
          }`}
        >
          {countdownText}
        </span>
      </div>

      {/* Content */}
      <div className="mb-3.5">
        {(subjectCode || subjectName) && (
          <span className="text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider font-semibold">
            {subjectCode}{subjectName && subjectCode ? ' · ' : ''}{subjectName}
          </span>
        )}
        <h3 className="font-display text-base sm:text-lg font-bold text-[var(--color-text)] mt-1 leading-snug">
          {post.title}
        </h3>
        {cleanSnippet && (
          <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] mt-2 leading-relaxed line-clamp-3">
            {cleanSnippet}
          </p>
        )}
      </div>

      {/* Resource links */}
      {links.length > 0 && (
        <div className="flex flex-col gap-2 pt-3 border-t border-[var(--color-border)]">
          <div className="text-[9px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider">
            Attached Links
          </div>
          {links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 sm:p-3 min-h-[40px] bg-[var(--color-surface-3)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] active:bg-[var(--color-surface-2)] text-[var(--text-xs)] text-[var(--color-text)] transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-[10px] font-mono text-[var(--color-text-dim)]">↗</span>
                <span className="truncate font-medium">{link.label}</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
        <span className="text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider">
          {typeConfig?.label || post.type}
        </span>
        <Link
          to={`/post/${post.id}`}
          className="px-3.5 py-2 min-h-[38px] flex items-center justify-center bg-white text-black font-semibold text-[var(--text-xs)] hover:bg-[#e5e5e5] active:bg-[#cccccc] transition-colors"
        >
          View Post Details →
        </Link>
      </div>
    </div>
  );
}

function UpcomingItem({ post }) {
  const dueDate = new Date(post.due_date);
  const subjectCode = post.subjects?.code || post.subjects?.name || '';
  const typeConfig = CONTENT_TYPES[post.type];

  return (
    <Link to={`/post/${post.id}`} className="py-3 first:pt-0 last:pb-0 block hover:bg-[var(--color-surface-2)]/30 active:bg-[var(--color-surface-2)]/60 transition-colors">
      <div className="flex items-center justify-between text-[9px] font-mono mb-1">
        <span className="text-[var(--color-text-muted)] font-medium">
          {subjectCode}{subjectCode && ' · '}{typeConfig?.label || post.type}
        </span>
        <span className="text-[var(--color-text)]">
          {format(dueDate, 'EEE, MMM d')} · {format(dueDate, 'h:mm a')}
        </span>
      </div>
      <p className="text-[var(--text-xs)] font-medium text-[var(--color-text)] truncate">
        {post.title}
      </p>
      <div className="mt-0.5 text-[9px] font-mono text-[var(--color-text-dim)]">
        {formatDistanceToNow(dueDate, { addSuffix: true })}
      </div>
    </Link>
  );
}
