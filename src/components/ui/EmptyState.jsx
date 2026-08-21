import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No posts found',
  description = 'Try adjusting your search or filters.',
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="w-14 h-14 bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center mb-4">
        <Icon size={26} className="text-[var(--color-text-dim)]" />
      </div>
      <h3 className="text-lg font-display font-medium text-[var(--color-text)] mb-1 tracking-[-0.01em]">{title}</h3>
      <p className="text-[var(--text-sm)] font-light text-[var(--color-text-muted)] text-center max-w-xs tracking-[0.01em] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
