import { Link } from 'react-router-dom';
import { CalendarClock, ChevronRight, Clock } from 'lucide-react';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import { CONTENT_TYPES } from '../../lib/constants';

export default function DeadlineBanner({ deadlines }) {
  if (!deadlines || deadlines.length === 0) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <CalendarClock size={16} className="text-[var(--color-text)]" />
        <h2 className="text-[10px] font-medium text-[var(--color-text)] tracking-[0.1em] uppercase">
          Upcoming Deadlines
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {deadlines.map((item) => {
          const dueDate = new Date(item.due_date);
          const hoursLeft = differenceInHours(dueDate, new Date());
          const isUrgent = hoursLeft < 48;
          const typeConfig = CONTENT_TYPES[item.type];
          const TypeIcon = typeConfig?.icon || CalendarClock;

          return (
            <Link
              key={item.id}
              to={`/post/${item.id}`}
              className={`shrink-0 group flex items-center gap-3 px-4 py-3 border transition-all duration-200 hover:shadow-md
                ${
                  isUrgent
                    ? 'bg-[var(--color-text)] border-[var(--color-text)] hover:bg-[var(--color-accent-hover)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-light)]'
                }
              `}
            >
              <div
                className={`w-9 h-9 flex items-center justify-center shrink-0 border border-current/20 ${isUrgent ? 'bg-[var(--color-bg)] text-[var(--color-text)]' : 'bg-[var(--color-surface-2)] text-[var(--color-text)]'}`}
              >
                <TypeIcon size={16} />
              </div>

              <div className="min-w-0">
                <p className={`text-[var(--text-sm)] font-medium truncate max-w-[200px] transition-colors tracking-[-0.005em] ${isUrgent ? 'text-black' : 'text-[var(--color-text)]'}`}>
                  {item.title}
                </p>
                <p className={`text-[10px] font-medium flex items-center gap-1 mt-0.5 tracking-[0.02em] ${
                  isUrgent ? 'text-black/80' : 'text-[var(--color-text-muted)]'
                }`}>
                  <Clock size={10} />
                  {formatDistanceToNow(dueDate, { addSuffix: true })}
                  <span className={isUrgent ? 'text-black/60' : 'text-[var(--color-text-dim)]'}>
                    · {format(dueDate, 'dd-MM-yyyy · h:mm a')}
                  </span>
                </p>
              </div>

              <ChevronRight
                size={14}
                className={`shrink-0 transition-colors ${isUrgent ? 'text-black/60 group-hover:text-black' : 'text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)]'}`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
