import { CONTENT_TYPES } from '../../lib/constants';

export default function Badge({ type, subject, className = '' }) {
  if (type) {
    const config = CONTENT_TYPES[type];
    if (!config) return null;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-[0.02em] border ${config.bgClass} ${className}`}
      >
        <span>{config.emoji}</span>
        <span>{config.label}</span>
      </span>
    );
  }

  if (subject) {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium tracking-[0.02em] bg-transparent text-[var(--color-text-dim)] border border-[var(--color-border-light)] ${className}`}
      >
        {subject.code || subject.name}
      </span>
    );
  }

  return null;
}
