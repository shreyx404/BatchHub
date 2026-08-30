import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow, differenceInHours, isPast, addDays } from 'date-fns';
import { CONTENT_TYPES } from '../../lib/constants';
import { CalendarClock, CalendarCheck, Clock, Edit3, ArrowRight, X } from 'lucide-react';

export default function CalendarSidebar({
  selectedDate,
  selectedPosts,
  allPosts = [],
  isAdmin = false,
  onSelectDate,
}) {
  // Parse selected date key safely without timezone offset issues
  const selectedDateObject = useMemo(() => {
    if (!selectedDate) return null;
    const parts = selectedDate.split('-').map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date(selectedDate);
  }, [selectedDate]);

  // Sort selected date posts by due time ascending (earliest first)
  const sortedSelectedPosts = useMemo(() => {
    if (!selectedPosts || selectedPosts.length === 0) return [];
    return [...selectedPosts].sort((a, b) => {
      const timeA = a.due_date ? new Date(a.due_date).getTime() : 0;
      const timeB = b.due_date ? new Date(b.due_date).getTime() : 0;
      return timeA - timeB;
    });
  }, [selectedPosts]);

  const now = new Date();
  const weekFromNow = addDays(now, 7);
  const selectedDateKey = selectedDate;

  // Upcoming in 7 days from today (excluding posts on the selected date to avoid duplication)
  const upcomingPosts = useMemo(() => {
    return allPosts
      .filter((p) => {
        if (!p.due_date || p.status === 'archived' || p.status === 'draft') return false;
        const d = new Date(p.due_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return d > now && d <= weekFromNow && key !== selectedDateKey;
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }, [allPosts, now, weekFromNow, selectedDateKey]);

  return (
    <div id="calendar-inspector-target" className="flex flex-col gap-4 sm:gap-5 scroll-mt-20">
      {/* Selected Date Section: Deadlines Inspector OR Empty Date Indicator OR Default Prompt */}
      {selectedDateObject ? (
        sortedSelectedPosts.length > 0 ? (
          <div className="flex flex-col gap-3 animate-fade-in">
            {/* Section Header */}
            <div className="flex items-center justify-between px-1 pb-0.5">
              <div className="flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-wider text-[var(--color-text)] font-semibold">
                <CalendarClock size={13} className="text-[var(--color-text-muted)]" />
                <span>
                  {format(selectedDateObject, 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[var(--color-text-dim)]">
                  {sortedSelectedPosts.length} {sortedSelectedPosts.length === 1 ? 'Item' : 'Items'}
                </span>
                {onSelectDate && (
                  <button
                    onClick={() => onSelectDate(null)}
                    title="Clear selected date"
                    className="text-[var(--color-text-dim)] hover:text-white transition-colors p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* All Posts on this date rendered as highlighted cards */}
            <div className="flex flex-col gap-3.5">
              {sortedSelectedPosts.map((post) => (
                <InspectorCard key={post.id} post={post} isAdmin={isAdmin} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-fade-in">
            {/* Section Header with Date */}
            <div className="flex items-center justify-between px-1 pb-0.5">
              <div className="flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-wider text-[var(--color-text)] font-semibold">
                <CalendarClock size={13} className="text-[var(--color-text-muted)]" />
                <span>
                  {format(selectedDateObject, 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              {onSelectDate && (
                <button
                  onClick={() => onSelectDate(null)}
                  title="Clear selected date"
                  className="text-[var(--color-text-dim)] hover:text-white transition-colors p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Empty State for Selected Date */}
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-4 sm:p-5 text-center">
              <div className="flex flex-col items-center justify-center py-5 sm:py-6">
                <CalendarCheck size={26} className="text-[var(--color-text-muted)] mb-2.5" />
                <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text)] font-display">
                  No Deadlines Scheduled
                </p>
                <p className="text-[10.5px] text-[var(--color-text-dim)] mt-1 font-mono tracking-wider max-w-[240px] leading-relaxed">
                  No assignments, practicals, or deliverables due on this date.
                </p>
                {onSelectDate && (
                  <button
                    onClick={() => onSelectDate(null)}
                    className="mt-3.5 px-3 py-1 text-[10px] font-mono border border-[var(--color-border)] bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-border-light)] transition-colors"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-4 sm:p-5">
          <div className="flex flex-col items-center justify-center py-5 sm:py-6 text-center">
            <CalendarClock size={26} className="text-[var(--color-text-dim)] mb-2.5" />
            <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-muted)]">
              Select a date
            </p>
            <p className="text-[10px] text-[var(--color-text-dim)] mt-1 font-mono tracking-wider">
              Tap any date on the calendar grid to inspect its deliverables
            </p>
          </div>
        </div>
      )}

      {/* Upcoming Deadlines (Next 7 Days) */}
      <div className="bg-[#050505] border border-[var(--color-border)] overflow-hidden">
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10.5px] font-mono font-bold uppercase tracking-wider text-[var(--color-text)]">
            <Clock size={13} className="text-[var(--color-text-muted)]" />
            <span>Upcoming (Next 7 Days)</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--color-text-dim)] font-semibold">
            {upcomingPosts.length} {upcomingPosts.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="p-3 sm:p-4">
          {upcomingPosts.length > 0 ? (
            <div className="flex flex-col divide-y divide-[#171717]">
              {upcomingPosts.map((post) => (
                <QueueItem
                  key={post.id}
                  post={post}
                  isAdmin={isAdmin}
                  onSelectDate={onSelectDate}
                />
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-[var(--color-text-dim)] font-mono text-[11px]">
              No upcoming deadlines scheduled in the next 7 days.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InspectorCard({ post, isAdmin }) {
  const dueDate = new Date(post.due_date);
  const now = new Date();
  const hoursLeft = differenceInHours(dueDate, now);
  const isArchived = post.status === 'archived';
  const isDraft = post.status === 'draft';
  const isOverdue = !isDraft && isPast(dueDate);
  const isFaded = isArchived || isOverdue;
  const isUrgent = !isFaded && !isDraft && hoursLeft < 24;
  const subjectName = post.subjects?.name || post.subjects?.code || '';
  const subjectCode = post.subjects?.code || '';
  const typeConfig = CONTENT_TYPES[post.type];
  const links = post.links || [];

  // Countdown text
  let countdownText = '';
  if (isArchived) {
    countdownText = 'Archived';
  } else if (isDraft) {
    countdownText = 'Draft';
  } else if (isOverdue) {
    countdownText = 'Past Due';
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
          ? 'bg-[#140a0a] border-[#7f1d1d] shadow-sm'
          : isFaded
            ? 'bg-[#07070a]/70 border border-[#1e1e24]/60 opacity-55 hover:opacity-100'
            : isDraft
              ? 'bg-[#14120a] border-[#453610]'
              : 'bg-[#0c0c0e] border-[var(--color-border-light)]'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)] flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isUrgent && (
            <span className="px-2 py-0.5 bg-red-950 border border-red-700 text-red-300 text-[9px] font-mono font-bold uppercase tracking-wider">
              URGENT
            </span>
          )}
          {isArchived && (
            <span className="px-2 py-0.5 bg-[#121218] border border-[#272733] text-[#71717a] text-[9px] font-mono font-bold uppercase tracking-wider">
              ARCHIVED
            </span>
          )}
          {isDraft && (
            <span className="px-2 py-0.5 bg-amber-950 border border-amber-700 text-amber-300 text-[9px] font-mono font-bold uppercase tracking-wider">
              DRAFT
            </span>
          )}
          {!isArchived && !isDraft && isOverdue && (
            <span className="px-2 py-0.5 bg-[#1a0f0f] border border-[#3b1a1a] text-[#8e5252] text-[9px] font-mono font-bold uppercase tracking-wider">
              PAST DUE
            </span>
          )}
          <span
            className={`text-[10px] font-mono font-medium ${
              isFaded ? 'text-[#52525b]' : 'text-[var(--color-text-muted)]'
            }`}
          >
            {isArchived || isOverdue
              ? `Ended ${format(dueDate, 'h:mm a')}`
              : `Due at ${format(dueDate, 'h:mm a')}`}
          </span>
        </div>
        <span
          className={`text-[10px] font-mono font-bold ${
            isUrgent
              ? 'text-red-400'
              : isFaded
                ? 'text-[#52525b]'
                : isDraft
                  ? 'text-amber-400'
                  : 'text-[var(--color-text-muted)]'
          }`}
        >
          {countdownText}
        </span>
      </div>

      {/* Content */}
      <div className="mb-3.5">
        {(subjectCode || subjectName) && (
          <span
            className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
              isFaded ? 'text-[#52525b]' : 'text-[var(--color-text-dim)]'
            }`}
          >
            {subjectCode}{subjectName && subjectCode ? ' · ' : ''}{subjectName}
          </span>
        )}
        <h3
          className={`font-display text-base sm:text-lg leading-snug mt-1 font-semibold ${
            isFaded ? 'text-[#888896]' : 'text-white'
          }`}
        >
          {post.title}
        </h3>
        {cleanSnippet && (
          <p
            className={`text-[var(--text-xs)] mt-2 leading-relaxed line-clamp-3 ${
              isFaded ? 'text-[#52525b]' : 'text-[var(--color-text-muted)]'
            }`}
          >
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
              className={`flex items-center justify-between p-2.5 sm:p-3 min-h-[38px] border transition-colors ${
                isFaded
                  ? 'bg-[#0b0b0e] border-[#1f1f26] text-[#71717a] hover:text-white hover:border-[#383845]'
                  : 'bg-[var(--color-surface-3)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] active:bg-[var(--color-surface-2)] text-[var(--text-xs)] text-[var(--color-text)]'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-[10px] font-mono text-[var(--color-text-dim)]">↗</span>
                <span className="truncate font-medium">{link.label}</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Footer & Actions */}
      <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-2 flex-wrap">
        <span
          className={`text-[10px] font-mono uppercase tracking-wider ${
            isFaded ? 'text-[#52525b]' : 'text-[var(--color-text-dim)]'
          }`}
        >
          {typeConfig?.label || post.type}
        </span>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              to={`/admin/edit/${post.id}`}
              className={`px-3 py-1.5 min-h-[34px] flex items-center gap-1.5 text-[var(--text-xs)] font-mono font-semibold border transition-colors ${
                isFaded
                  ? 'bg-[#0f0f14] border-[#22222a] text-[#71717a] hover:text-white hover:border-white'
                  : 'bg-[var(--color-surface-3)] border border-[var(--color-border-light)] hover:border-white text-[var(--color-text)] hover:text-white'
              }`}
            >
              <Edit3 size={12} />
              <span>Edit Post</span>
            </Link>
          )}

          <Link
            to={`/post/${post.id}`}
            className={`px-3.5 py-1.5 min-h-[34px] flex items-center justify-center font-semibold text-[var(--text-xs)] transition-colors ${
              isFaded
                ? 'bg-[#14141a] text-[#a1a1aa] hover:text-white hover:bg-[var(--color-surface-2)] border border-[#272732]'
                : 'bg-white text-black hover:bg-[#e5e5e5]'
            }`}
          >
            <span>View Details</span>
            <ArrowRight size={13} className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function QueueItem({ post, isAdmin, isPastOrArchived = false, onSelectDate }) {
  const dueDate = new Date(post.due_date);
  const isArchived = post.status === 'archived';
  const isDraft = post.status === 'draft';
  const isOverdue = !isDraft && isPast(dueDate);
  const isFaded = isArchived || isOverdue;
  const subjectCode = post.subjects?.code || post.subjects?.name || '';
  const typeConfig = CONTENT_TYPES[post.type];
  const dateKey = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;

  const handleClick = () => {
    if (onSelectDate) {
      onSelectDate(dateKey);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`py-3 first:pt-1 last:pb-1 block transition-colors cursor-pointer group px-1 ${
        isFaded ? 'opacity-55 hover:opacity-100 hover:bg-[var(--color-surface-2)]/30' : 'hover:bg-[var(--color-surface-2)]/40'
      }`}
    >
      <div className="flex items-center justify-between text-[9px] font-mono mb-1 gap-1">
        <div className="flex items-center gap-1.5 truncate">
          {isArchived ? (
            <span className="px-1.5 py-0.2 bg-[#121218] border border-[#272733] text-[#71717a] font-bold uppercase">
              ARCHIVED
            </span>
          ) : isDraft ? (
            <span className="px-1.5 py-0.2 bg-amber-950/80 border border-amber-800 text-amber-300 font-bold uppercase">
              DRAFT
            </span>
          ) : isOverdue ? (
            <span className="px-1.5 py-0.2 bg-[#1a0f0f] border border-[#3b1a1a] text-[#8e5252] font-bold uppercase">
              PAST DUE
            </span>
          ) : null}

          <span
            className={`font-medium truncate ${
              isFaded ? 'text-[#52525b]' : 'text-[var(--color-text-muted)]'
            }`}
          >
            {subjectCode}{subjectCode && ' · '}{typeConfig?.label || post.type}
          </span>
        </div>

        <span
          className={`shrink-0 transition-colors ${
            isFaded ? 'text-[#3f3f46] group-hover:text-[#a1a1aa]' : 'text-[var(--color-text-dim)] group-hover:text-[var(--color-text)]'
          }`}
        >
          {format(dueDate, 'MMM d, h:mm a')}
        </span>
      </div>

      <p
        className={`text-[var(--text-xs)] truncate transition-colors ${
          isFaded ? 'text-[#71717a] font-normal group-hover:text-white' : 'text-white font-medium'
        }`}
      >
        {post.title}
      </p>

      <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-[var(--color-text-dim)]">
        <span className={isFaded ? 'text-[#3f3f46]' : 'text-[var(--color-text-dim)]'}>
          {isPastOrArchived || isOverdue
            ? `${formatDistanceToNow(dueDate, { addSuffix: true })}`
            : `${formatDistanceToNow(dueDate, { addSuffix: true })}`}
        </span>

        {isAdmin && (
          <Link
            to={`/admin/edit/${post.id}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-white underline underline-offset-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit3 size={10} />
            <span>Edit</span>
          </Link>
        )}
      </div>
    </div>
  );
}
