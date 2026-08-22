import { Link } from 'react-router-dom';
import { format, formatDistanceToNow, differenceInHours, isPast, addDays } from 'date-fns';
import { CONTENT_TYPES } from '../../lib/constants';
import { CalendarClock } from 'lucide-react';

export default function CalendarSidebar({ selectedDate, selectedPosts, allPosts }) {
  // Upcoming in 7 days from today
  const now = new Date();
  const weekFromNow = addDays(now, 7);
  const upcomingPosts = allPosts
    .filter((p) => {
      const d = new Date(p.due_date);
      return d > now && d <= weekFromNow;
    })
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  // Selected date post for inspector
  const inspectedPost = selectedPosts?.[0] || null;

  return (
    <div className="flex flex-col gap-5">
      {/* Focus Card — Selected Deadline Details */}
      {inspectedPost ? (
        <InspectorCard post={inspectedPost} selectedDate={selectedDate} totalOnDate={selectedPosts.length} />
      ) : (
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-5">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CalendarClock size={28} className="text-[var(--color-text-dim)] mb-3" />
            <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-muted)]">
              Select a date
            </p>
            <p className="text-[10px] text-[var(--color-text-dim)] mt-1 font-mono tracking-wider">
              Click a date with deadlines to view details
            </p>
          </div>
        </div>
      )}

      {/* Additional posts on selected date */}
      {selectedPosts && selectedPosts.length > 1 && (
        <div className="bg-[#050505] border border-[var(--color-border)] p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
            <h3 className="font-display text-[var(--text-sm)] font-semibold text-[var(--color-text)]">
              Also on this date
            </h3>
            <span className="text-[10px] font-mono text-[var(--color-text-dim)]">
              {selectedPosts.length - 1} more
            </span>
          </div>
          <div className="flex flex-col divide-y divide-[#171717]">
            {selectedPosts.slice(1).map((post) => (
              <UpcomingItem key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming in 7 Days Queue */}
      {upcomingPosts.length > 0 && (
        <div className="bg-[#050505] border border-[var(--color-border)] p-5">
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

function InspectorCard({ post, selectedDate, totalOnDate }) {
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
    countdownText = `${hoursLeft}h left`;
  } else {
    countdownText = formatDistanceToNow(dueDate, { addSuffix: false }) + ' left';
  }

  return (
    <div className="bg-[#0c0c0e] border border-[var(--color-border-light)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          {isUrgent && (
            <span className="px-2 py-0.5 bg-red-950/60 border border-red-800/80 text-red-300 text-[9px] font-mono font-semibold uppercase tracking-wider">
              URGENT
            </span>
          )}
          {isOverdue && (
            <span className="px-2 py-0.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-dim)] text-[9px] font-mono font-semibold uppercase tracking-wider">
              OVERDUE
            </span>
          )}
          <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
            {format(dueDate, 'MMM d')} · {format(dueDate, 'h:mm a')}
          </span>
        </div>
        <span className={`text-[10px] font-mono font-bold ${isUrgent ? 'text-red-400' : isOverdue ? 'text-[var(--color-text-dim)]' : 'text-[var(--color-text-muted)]'}`}>
          {countdownText}
        </span>
      </div>

      {/* Content */}
      <div className="mb-3">
        {(subjectCode || subjectName) && (
          <span className="text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider">
            {subjectCode}{subjectName && subjectCode ? ' · ' : ''}{subjectName}
          </span>
        )}
        <h3 className="font-display text-xl font-bold text-[var(--color-text)] mt-1 leading-snug">
          {post.title}
        </h3>
        {post.content && (
          <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] mt-2 leading-relaxed line-clamp-3">
            {post.content.replace(/[#*`_~>|\-]/g, '').replace(/\s+/g, ' ').trim().substring(0, 200)}
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
              className="flex items-center justify-between p-2.5 bg-[var(--color-surface-3)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] text-[var(--text-xs)] text-[var(--color-text)] transition-colors"
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
      <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
        <span className="text-[10px] font-mono text-[var(--color-text-dim)]">
          {typeConfig?.label || post.type}
        </span>
        <Link
          to={`/post/${post.id}`}
          className="px-3 py-1.5 bg-[var(--color-text)] text-black font-medium text-[var(--text-xs)] hover:bg-[var(--color-accent-hover)] transition-colors"
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
    <Link to={`/post/${post.id}`} className="py-3 first:pt-0 last:pb-0 block hover:bg-[var(--color-surface-2)]/30 transition-colors">
      <div className="flex items-center justify-between text-[9px] font-mono mb-1">
        <span className="text-[var(--color-text-muted)]">
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
