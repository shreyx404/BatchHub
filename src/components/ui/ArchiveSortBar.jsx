import { Link } from 'react-router-dom';
import { Binary, Sparkles } from 'lucide-react';
import { ARCHIVE_SORT_OPTIONS } from '../../lib/constants';

const ALGORITHMS = [
  { key: 'native', label: 'Default (Array.sort)' },
  { key: 'quick', label: 'Quick Sort (O(n log n))' },
  { key: 'merge', label: 'Merge Sort (O(n log n))' },
  { key: 'insertion', label: 'Insertion Sort (O(n²))' },
  { key: 'selection', label: 'Selection Sort (O(n²))' },
  { key: 'bubble', label: 'Bubble Sort (O(n²))' },
];

export default function ArchiveSortBar({
  sortBy,
  onSortChange,
  totalCount,
  loading,
  sortAlgorithm = 'native',
  onAlgorithmChange,
  stats,
}) {
  return (
    <div className="space-y-2">
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
                    ? 'badge-inverse border border-[var(--color-text)] font-semibold'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] font-normal hover:border-[var(--color-border-light)] hover:text-[var(--color-text)]'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Algorithm selector + Result count */}
        <div className="flex items-center gap-3">
          {onAlgorithmChange && (
            <div className="flex items-center gap-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-0.5">
              <Binary size={12} className="text-[var(--color-amber)]" />
              <label htmlFor="ds-sort-select" className="text-[10px] font-mono text-[var(--color-text-dim)] uppercase">
                FDS Algo:
              </label>
              <select
                id="ds-sort-select"
                value={sortAlgorithm}
                onChange={(e) => onAlgorithmChange(e.target.value)}
                className="bg-transparent text-[11px] font-mono text-[var(--color-text)] focus:outline-none cursor-pointer"
              >
                {ALGORITHMS.map(a => (
                  <option key={a.key} value={a.key} className="bg-[var(--color-surface-2)] text-[var(--color-text)]">
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!loading && (
            <span className="shrink-0 text-[10px] font-mono tracking-[0.06em] uppercase text-[var(--color-text-dim)]">
              {totalCount} archived
            </span>
          )}
        </div>
      </div>

      {/* If a custom DS sorting algorithm is selected, display live comparison & swap telemetry */}
      {stats && sortAlgorithm !== 'native' && (
        <div className="flex items-center justify-between text-[11px] font-mono p-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-dim)]">
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-amber)] font-bold">
              {stats.algorithmName} ({stats.complexity})
            </span>
            <span>·</span>
            <span>{stats.comparisons} comparisons</span>
            <span>·</span>
            <span>{stats.swaps} swaps</span>
          </div>
          <Link
            to="/ds"
            className="text-[10px] text-[var(--color-amber)] hover:underline flex items-center gap-1"
          >
            <Sparkles size={11} />
            <span>View Algorithm Visualizer</span>
          </Link>
        </div>
      )}
    </div>
  );
}
