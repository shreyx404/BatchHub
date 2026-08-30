import { useMemo } from 'react';
import {
  format,
  differenceInHours,
  isPast,
  isToday,
  isTomorrow,
  formatDistanceToNow,
} from 'date-fns';
import { Link } from 'react-router-dom';
import { CONTENT_TYPES } from '../../lib/constants';
import { CalendarClock, CalendarX, ExternalLink, ArrowRight } from 'lucide-react';

export default function CalendarAgendaView({
  posts,
  selectedSubject,
  onSubjectChange,
  isAdmin = false,
}) {
  // Sort and group posts with due_date by day (YYYY-MM-DD)
  const groupedByDate = useMemo(() => {
    const validPosts = posts
      .filter((p) => Boolean(p.due_date))
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    const groups = {};
    for (const post of validPosts) {
      const d = new Date(post.due_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!groups[key]) {
        groups[key] = {
          date: d,
          dateKey: key,
          posts: [],
        };
      }
      groups[key].posts.push(post);
    }

    return Object.values(groups);
  }, [posts]);

  if (groupedByDate.length === 0) {
    return (
      <div className="border border-[var(--color-border)] bg-[#050505] p-8 sm:p-12 text-center flex flex-col items-center justify-center animate-fade-in">
        <CalendarX size={36} className="text-[var(--color-text-dim)] mb-3" />
        <h3 className="font-display text-lg sm:text-xl font-semibold text-[var(--color-text)] mb-1">
          No Deadlines Found
        </h3>
        <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] max-w-sm mb-4 leading-relaxed">
          {selectedSubject
            ? 'There are no deadlines found for this subject filter in the current schedule.'
            : 'There are no deadlines scheduled for this period.'}
        </p>
        {selectedSubject && (
          <button
            onClick={() => onSubjectChange(null)}
            className="px-3.5 py-2 min-h-[38px] text-[var(--text-xs)] font-mono bg-white text-black font-semibold hover:bg-[#e5e5e5] transition-colors"
          >
            Clear Subject Filter
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {groupedByDate.map((group) => {
        const todayGroup = isToday(group.date);
        const tomorrowGroup = isTomorrow(group.date);

        return (
          <div key={group.dateKey} className="space-y-2.5">
            {/* Date Group Header */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-[var(--text-xs)] font-mono font-bold uppercase tracking-wider text-[var(--color-text)]">
                  {format(group.date, 'EEEE, MMMM d, yyyy')}
                </span>
                {todayGroup && (
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-white text-black uppercase">
                    TODAY
                  </span>
                )}
                {tomorrowGroup && (
                  <span className="px-2 py-0.5 text-[9px] font-mono font-medium bg-[var(--color-surface-3)] text-[var(--color-text)] border border-[var(--color-border)] uppercase">
                    TOMORROW
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-[var(--color-text-dim)]">
                {group.posts.length} {group.posts.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* List of Deadlines for this date */}
            <div className="flex flex-col gap-3">
              {group.posts.map((post) => (
                <AgendaPostCard key={post.id} post={post} isAdmin={isAdmin} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AgendaPostCard({ post, isAdmin }) {
  const dueDate = new Date(post.due_date);
  const now = new Date();
  const hoursLeft = differenceInHours(dueDate, now);
  const isArchived = post.status === 'archived';
  const isDraft = post.status === 'draft';
  const isOverdue = !isDraft && isPast(dueDate);
  const isFaded = isArchived || isOverdue;
  const isUrgent = !isFaded && !isDraft && hoursLeft < 24;
  const subjectName = post.subjects?.name || '';
  const subjectCode = post.subjects?.code || subjectName || '';
  const typeConfig = CONTENT_TYPES[post.type];
  const links = post.links || [];

  // Countdown text & badge style
  let countdownText = '';
  if (isArchived) {
    countdownText = 'ARCHIVED';
  } else if (isDraft) {
    countdownText = 'DRAFT';
  } else if (isOverdue) {
    countdownText = 'PAST DUE';
  } else if (hoursLeft < 1) {
    countdownText = 'Due soon';
  } else if (hoursLeft < 24) {
    countdownText = `⏳ In ${hoursLeft}h`;
  } else {
    countdownText = `${formatDistanceToNow(dueDate, { addSuffix: false })} left`;
  }

  // Clean Markdown content snippet
  const cleanContent = post.content
    ? post.content.replace(/[#*`_~>|\-]/g, '').replace(/\s+/g, ' ').trim().substring(0, 180)
    : '';

  return (
    <div
      className={`border p-4 sm:p-5 transition-all ${
        isUrgent
          ? 'bg-[#140a0a] border-[#7f1d1d]'
          : isFaded
            ? 'bg-[#060608]/70 border border-[#1a1a22]/60 opacity-45 hover:opacity-100'
            : isDraft
              ? 'bg-[#14120a] border-[#453610]'
              : 'bg-[#0c0c0f] border border-[var(--color-border-light)]'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        {/* Main Column */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2">
            {subjectCode && (
              <span
                className={`px-2 py-0.5 border text-[10px] font-mono uppercase tracking-wider ${
                  isFaded
                    ? 'bg-[#0f0f14] border-[#22222a] text-[#71717a]'
                    : 'bg-[var(--color-surface-3)] border-[var(--color-border)] text-[var(--color-text)] font-semibold'
                }`}
              >
                {subjectCode}
              </span>
            )}
            <span
              className={`text-[10px] font-mono uppercase tracking-wider ${
                isFaded ? 'text-[#52525b]' : 'text-[var(--color-text-dim)]'
              }`}
            >
              {typeConfig?.label || post.type}
            </span>
            <span className="text-[10px] font-mono text-[#3f3f46]">·</span>
            <span
              className={`text-[10px] font-mono ${
                isFaded ? 'text-[#52525b]' : 'text-[var(--color-text-muted)]'
              }`}
            >
              {format(dueDate, 'h:mm a')}
            </span>

            {/* Countdown / Status Badge */}
            <span
              className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ml-auto lg:ml-0 ${
                isUrgent
                  ? 'bg-red-950 border border-red-800 text-red-300'
                  : isArchived
                    ? 'bg-[#121218] border border-[#272733] text-[#71717a]'
                    : isDraft
                      ? 'bg-amber-950 border border-amber-800 text-amber-300'
                      : isOverdue
                        ? 'bg-[#1a0f0f] border border-[#3b1a1a] text-[#8e5252]'
                        : 'bg-[#141416] border border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}
            >
              {countdownText}
            </span>
          </div>

          {/* Title */}
          <h3
            className={`font-display text-base sm:text-lg leading-snug ${
              isFaded ? 'text-[#888896] font-medium' : 'text-white font-semibold'
            }`}
          >
            {post.title}
          </h3>

          {/* Content snippet */}
          {cleanContent && (
            <p
              className={`text-[var(--text-xs)] leading-relaxed line-clamp-2 ${
                isFaded ? 'text-[#52525b]' : 'text-[var(--color-text-muted)]'
              }`}
            >
              {cleanContent}
            </p>
          )}

          {/* Attached links */}
          {links.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 min-h-[32px] border text-[11px] transition-colors ${
                    isFaded
                      ? 'bg-[#0c0c10] border-[#1f1f26] text-[#71717a] hover:text-white hover:border-[#383845]'
                      : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  <span className="text-[9px] font-mono text-[var(--color-text-dim)]">↗</span>
                  <span className="truncate max-w-[200px]">{link.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 flex items-center gap-2 lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--color-border)]">
          {isAdmin && (
            <Link
              to={`/admin/edit/${post.id}`}
              className={`px-3 py-2 min-h-[38px] flex items-center justify-center gap-1 text-[var(--text-xs)] font-mono font-semibold border transition-colors ${
                isFaded
                  ? 'bg-[#0f0f14] border-[#22222a] text-[#71717a] hover:text-white hover:border-white'
                  : 'bg-[var(--color-surface-3)] border border-[var(--color-border-light)] hover:border-white text-[var(--color-text)] hover:text-white'
              }`}
            >
              <span>Edit</span>
            </Link>
          )}
          <Link
            to={`/post/${post.id}`}
            className={`px-4 py-2 min-h-[38px] flex items-center justify-center gap-1.5 text-[var(--text-xs)] transition-colors ${
              isFaded
                ? 'bg-[#14141a] text-[#a1a1aa] hover:text-white hover:bg-[var(--color-surface-2)] border border-[#272732]'
                : 'bg-white text-black font-semibold hover:bg-[#e5e5e5] active:bg-[#cccccc]'
            }`}
          >
            <span>View Details</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
