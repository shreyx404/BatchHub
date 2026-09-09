import { ARCHIVE_SORT_OPTIONS } from '../../lib/constants';

export default function ArchiveSortBar({ sortBy, onSortChange, totalCount, loading }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      {/* Sort pills */}
      <div className="flex gap-1.5 overflow-x-auto touch-scroll py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
        {ARCHIVE_SORT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onSortChange(value)}
            className={`shrink-0 flex items-center gap-1.5 border transition-all duration-200 whitespace-nowrap active:scale-[0.98]
              px-2.5 py-1 text-[10.5px] sm:text-[10px] tracking-[0.03em] font-mono min-h-[32px] sm:min-h-[30px]
              ${
                sortBy === value
                  ? 'bg-white border-white text-black font-semibold'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] font-normal hover:border-[var(--color-border-light)] hover:text-[var(--color-text)]'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Result count */}
      {!loading && (
        <span className="shrink-0 text-[10px] font-mono tracking-[0.06em] uppercase text-[var(--color-text-dim)]">
          {totalCount} archived
        </span>
      )}
    </div>
  );
}
