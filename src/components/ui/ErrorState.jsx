import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <AlertTriangle size={26} className="text-red-400" />
      </div>
      <h3 className="text-lg font-display font-medium text-[var(--color-text)] mb-1 tracking-[-0.01em]">
        Oops!
      </h3>
      <p className="text-[var(--text-sm)] font-light text-[var(--color-text-muted)] text-center max-w-xs mb-4 tracking-[0.01em] leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--text-sm)] font-medium text-[var(--color-text)] hover:border-[var(--color-border-light)] transition-colors duration-300 tracking-[0.005em]"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}
