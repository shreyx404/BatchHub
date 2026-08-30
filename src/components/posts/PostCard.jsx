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

  const subjectColor = post.subjects?.color || null;
  const hoverBorderColor = subjectColor || 'var(--color-text)';
  const hoverGlowColor = subjectColor ? `${subjectColor}55` : 'rgba(245, 245, 244, 0.15)';

  const cleanPreview = post.content
    ? post.content
        .replace(/```[\s\S]*?```/g, '') // remove multi-line code blocks
        .replace(/`([^`]+)`/g, '$1') // remove inline code formatting
        .replace(/!\[.*?\]\(.*?\)/g, '') // remove images
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // remove links keep text
        .replace(/^[#>*_\-+]+\s+/gm, '') // remove heading/quote/bullet starts
        .replace(/^\d+\.\s+/gm, '') // remove numbered list prefixes
        .replace(/[*_~`#|]/g, '') // remove inline markdown symbols
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 160)
    : '';

  return (
    <Link
      to={`/post/${post.id}`}
      className="group block relative pl-4 sm:pl-6 py-4 sm:py-6 border-l border-[var(--color-border)] transition-all duration-300 hover:bg-[var(--color-surface-2)] hover:-translate-y-0.5 hover:translate-x-0.5 active:bg-[var(--color-surface-3)]"
      style={{
        '--hover-border-color': hoverBorderColor,
        '--hover-glow-color': hoverGlowColor,
      }}
    >
      {/* Ledger Node Marker */}
      <div 
        className="absolute left-[-4px] top-[22px] sm:top-[30px] w-[7px] h-[7px] bg-[var(--color-border-light)] transition-colors duration-300 group-hover:bg-[var(--hover-border-color)]"
        style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
      />
      {/* Ledger glowing line overlay */}
      <div 
        className="absolute left-[-1px] top-0 bottom-0 w-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          backgroundColor: hoverBorderColor,
          boxShadow: subjectColor ? `0 0 8px ${subjectColor}` : '0 0 6px rgba(245, 245, 244, 0.3)',
        }}
      />

      <div className="flex flex-col gap-2.5 sm:gap-3.5">
        {/* Timestamp & Badges row */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="font-mono text-[9.5px] sm:text-[10px] tracking-wider text-[var(--color-text-dim)] uppercase">
            Posted: {format(new Date(post.created_at || new Date()), 'dd-MM-yyyy / HH:mm')}
          </span>
          <Badge type={post.type} />
          {post.subjects && <Badge subject={post.subjects} />}
          {post.is_pinned && (
            <span className="flex items-center gap-1 text-[9.5px] sm:text-[10px] font-medium tracking-[0.08em] uppercase text-[var(--color-accent)]">
              <Pin size={10} className="rotate-45" />
              Pinned
            </span>
          )}
        </div>

        {/* Title — Playfair Display, generous size, tight leading */}
        <h3 className="font-display font-medium text-[1.25rem] xs:text-[1.4rem] sm:text-[1.75rem] text-[var(--color-text)] transition-colors duration-500 leading-[1.15] tracking-[-0.015em] group-hover:text-[var(--hover-border-color)]">
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
