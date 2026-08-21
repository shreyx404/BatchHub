import { CONTENT_TYPES } from '../../lib/constants';

export default function Badge({ type, subject, className = '' }) {
  if (type) {
    const config = CONTENT_TYPES[type];
    if (!config) return null;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium tracking-[0.04em] uppercase border ${config.bgClass} ${className}`}
      >
        {Icon && <Icon size={10} className="shrink-0" />}
        <span>{config.label}</span>
      </span>
    );
  }

  if (subject) {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium tracking-[0.05em] uppercase bg-transparent text-[var(--color-text-dim)] border border-[var(--color-border-light)] ${className}`}
      >
        {subject.code || subject.name}
      </span>
    );
  }

  return null;
}
