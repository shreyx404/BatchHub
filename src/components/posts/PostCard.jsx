import { Link } from 'react-router-dom';
import { Clock, Link as LinkIcon, ArrowUpRight, Pin } from 'lucide-react';
import { formatDistanceToNow, format, isPast, differenceInHours } from 'date-fns';
import Badge from '../ui/Badge';
import { CONTENT_TYPES } from '../../lib/constants';

export default function PostCard({ post }) {
  const typeConfig = CONTENT_TYPES[post.type];
  const hasDueDate = !!post.due_date;
  const dueDate = hasDueDate ? new Date(post.due_date) : null;
  const isOverdue = dueDate && isPast(dueDate);
  const isUrgent = dueDate && !isOverdue && differenceInHours(dueDate, new Date()) < 48;
  const linkCount = post.links?.length || 0;

  // Determine ledger line color based on type
  const typeColorVar = `var(--color-${post.type})`;

  const cleanPreview = post.content
    ? post.content
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/[#*`_~>|\-]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 150)
    : '';

  return (
    <Link
      to={`/post/${post.id}`}
      className="group block relative pl-6 py-6 border-l border-[var(--color-border)] transition-all duration-500 hover:bg-[var(--color-surface-2)] hover:-translate-y-0.5 hover:translate-x-0.5"
      style={{ '--hover-border-color': typeColorVar }}
    >
      {/* Ledger Node Marker */}
      <div 
        className="absolute left-[-4px] top-[30px] w-[7px] h-[7px] bg-[var(--color-border-light)] transition-colors duration-500 group-hover:bg-[var(--hover-border-color)]"
        style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
      />
      {/* Ledger glowing line overlay */}
      <div 
        className="absolute left-[-1px] top-0 bottom-0 w-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ backgroundColor: typeColorVar, boxShadow: `0 0 8px ${typeColorVar}` }}
      />

      <div className="flex flex-col gap-3.5">
        {/* Timestamp & Badges row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-[10px] tracking-wider text-[var(--color-text-dim)] uppercase">
            Posted: {format(new Date(post.created_at || new Date()), 'dd-MM-yyyy / HH:mm')}
          </span>
          <Badge type={post.type} />
          {post.subjects && <Badge subject={post.subjects} />}
          {post.is_pinned && (
            <span className="flex items-center gap-1 text-[10px] font-medium tracking-[0.08em] uppercase text-[var(--color-accent)]">
              <Pin size={10} className="rotate-45" />
              Pinned
            </span>
          )}
        </div>

        {/* Title — Playfair Display, generous size, tight leading */}
        <h3 className="font-display font-medium text-[1.5rem] sm:text-[1.75rem] text-[var(--color-text)] transition-colors duration-500 leading-[1.15] tracking-[-0.015em] group-hover:text-[var(--hover-border-color)]">
          {post.title}
        </h3>

        {/* Content preview — Inter light, relaxed reading */}
        {cleanPreview && (
          <p className="text-[var(--text-sm)] font-light text-[var(--color-text-muted)] line-clamp-2 leading-[1.7] tracking-[0.005em]">
            {cleanPreview}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between mt-1 pt-3 border-t border-[var(--color-border)] border-dashed">
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--color-text-dim)]">
            {/* Due date & Time */}
            {hasDueDate && (
              <span
                className={`flex items-center gap-1.5 ${
                  isOverdue || isUrgent
                    ? 'text-[var(--color-deadline)] font-semibold'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                <Clock size={11} />
                {isOverdue
                  ? `Overdue: ${format(dueDate, 'dd-MM-yyyy · h:mm a')}`
                  : `Due: ${format(dueDate, 'dd-MM-yyyy · h:mm a')} (${formatDistanceToNow(dueDate, { addSuffix: true })})`}
              </span>
            )}

            {/* Links count */}
            {linkCount > 0 && (
              <span className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                <LinkIcon size={11} />
                {linkCount} Link{linkCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <ArrowUpRight
            size={14}
            className="text-[var(--color-border-light)] group-hover:text-[var(--hover-border-color)] transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </div>
    </Link>
  );
}
