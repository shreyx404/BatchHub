import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ChevronRight } from 'lucide-react';
import { format, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { CONTENT_TYPES } from '../../lib/constants';

function useCountdown(targetDate) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const target = new Date(targetDate);
  const totalMinutes = Math.max(0, differenceInMinutes(target, now));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes, isPast: totalMinutes <= 0 };
}

function CountdownUnit({ value, label, urgent }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`font-sans font-light text-[1.5rem] sm:text-[1.75rem] md:text-[2rem] leading-none tracking-[-0.02em] tabular-nums ${
          urgent ? 'text-[var(--color-amber)]' : 'text-[var(--color-text)]'
        }`}
        style={{ fontFeatureSettings: "'tnum' 1" }}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.1em] text-[var(--color-text-dim)] mt-1">
        {label}
      </span>
    </div>
  );
}

function CountdownCard({ item }) {
  const { days, hours, minutes, isPast } = useCountdown(item.due_date);
  const isUrgent = !isPast && (days === 0 && hours < 48);
  const typeConfig = CONTENT_TYPES[item.type];
  const TypeIcon = typeConfig?.icon || CalendarClock;

  return (
    <Link
      to={`/post/${item.id}`}
      className={`shrink-0 group flex flex-col gap-3 sm:gap-4 px-4 sm:px-5 md:px-6 py-4 sm:py-5 border transition-all duration-300 min-w-[160px] sm:min-w-[190px] md:min-w-[220px] active:scale-[0.99] ${
        isUrgent
          ? 'bg-[var(--color-amber-dim)] border-[var(--color-amber)] hover:bg-[var(--color-amber-glow)]'
          : 'bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-border-light)]'
      }`}
    >
      {/* Countdown numbers */}
      <div className="flex items-center gap-2 sm:gap-3">
        <CountdownUnit value={days} label="days" urgent={isUrgent} />
        <span className={`text-lg sm:text-xl font-light self-start mt-0.5 ${isUrgent ? 'text-[var(--color-amber)]' : 'text-[var(--color-text-dim)]'}`}>:</span>
        <CountdownUnit value={hours} label="hrs" urgent={isUrgent} />
        <span className={`text-lg sm:text-xl font-light self-start mt-0.5 ${isUrgent ? 'text-[var(--color-amber)]' : 'text-[var(--color-text-dim)]'}`}>:</span>
        <CountdownUnit value={minutes} label="min" urgent={isUrgent} />
      </div>

      {/* Title & meta */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <TypeIcon size={11} className="shrink-0 text-[var(--color-text-dim)]" />
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.06em] text-[var(--color-text-dim)]">
              {typeConfig?.label}
            </span>
          </div>
          <p className={`text-[var(--text-xs)] sm:text-[var(--text-sm)] font-medium truncate max-w-[180px] sm:max-w-[220px] tracking-[-0.005em] ${
            isUrgent ? 'text-[var(--color-amber)]' : 'text-[var(--color-text)]'
          }`}>
            {item.title}
          </p>
          <p className="text-[9px] sm:text-[10px] font-mono text-[var(--color-text-dim)] mt-1 tracking-[0.02em]">
            {format(new Date(item.due_date), 'dd MMM · h:mm a')}
          </p>
        </div>
        <ChevronRight
          size={14}
          className="shrink-0 text-[var(--color-text-dim)] group-hover:text-[var(--color-amber)] transition-colors mt-1"
        />
      </div>
    </Link>
  );
}

export default function DeadlineBanner({ deadlines }) {
  if (!deadlines || deadlines.length === 0) return null;

  return (
    <div className="animate-fade-in">
      <div className="section-divider mb-4 sm:mb-5">
        <span>Upcoming Deadlines</span>
      </div>

      <div className="flex gap-3 sm:gap-4 overflow-x-auto touch-scroll py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {deadlines.map((item) => (
          <CountdownCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
