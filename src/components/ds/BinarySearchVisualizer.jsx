import { useState, useCallback } from 'react';
import { Search, Play } from 'lucide-react';
import { binarySearch, linearSearch } from '../../lib/ds';

const DEFAULT_ARRAY = [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 42, 46, 50, 54, 58, 62, 67, 71, 78, 84];

export default function BinarySearchVisualizer() {
  const [array] = useState(DEFAULT_ARRAY);
  const [target, setTarget] = useState('');
  const [mode, setMode] = useState('binary');
  const [result, setResult] = useState(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);

  const runSearch = useCallback(() => {
    const t = parseInt(target, 10);
    if (isNaN(t)) return;

    const searchFn = mode === 'binary' ? binarySearch : linearSearch;
    const res = searchFn(array, t);
    setResult(res);
    setCurrentStepIdx(res.steps.length - 1);
  }, [array, target, mode]);

  const step = result && currentStepIdx >= 0 && currentStepIdx < result.steps.length
    ? result.steps[currentStepIdx]
    : null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-[var(--text-lg)] font-semibold mb-1">
          Binary Search vs Linear Search
        </h3>
        <p className="text-[var(--text-xs)] text-[var(--color-text-dim)]">
          Search for a value in a sorted array. Compare the number of steps between O(n) linear and O(log n) binary search.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center border border-[var(--color-border)] overflow-hidden">
          <button
            onClick={() => { setMode('binary'); setResult(null); }}
            className={`px-3 py-1.5 text-[var(--text-xs)] transition-colors ${mode === 'binary' ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}
          >
            Binary
          </button>
          <button
            onClick={() => { setMode('linear'); setResult(null); }}
            className={`px-3 py-1.5 text-[var(--text-xs)] border-l border-[var(--color-border)] transition-colors ${mode === 'linear' ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}
          >
            Linear
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={target}
            onChange={(e) => { setTarget(e.target.value); setResult(null); }}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder="Target value"
            className="w-24 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--text-xs)] px-2 py-1.5 text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-border-light)]"
          />
          <button
            onClick={runSearch}
            className="p-1.5 border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
            title="Search"
          >
            <Play size={13} />
          </button>
        </div>

        {result && (
          <div className="flex items-center gap-1.5">
            <input
              type="range"
              min="0"
              max={result.steps.length - 1}
              value={currentStepIdx}
              onChange={(e) => setCurrentStepIdx(Number(e.target.value))}
              className="w-24 accent-[var(--color-amber)]"
            />
            <span className="text-[10px] font-mono text-[var(--color-text-dim)]">
              Step {currentStepIdx + 1}/{result.steps.length}
            </span>
          </div>
        )}
      </div>

      {/* Array Visualization */}
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4 overflow-x-auto">
        <div className="flex gap-1" style={{ minWidth: array.length * 36 }}>
          {array.map((val, idx) => {
            let bg = 'var(--color-surface-2)';
            let border = 'var(--color-border)';
            let textColor = 'var(--color-text-dim)';

            if (step) {
              const inRange = idx >= step.low && idx <= step.high;
              const isMid = idx === step.mid;

              if (step.comparison === 'equal' && isMid) {
                bg = '#10b981';
                border = '#10b981';
                textColor = '#000';
              } else if (isMid) {
                bg = 'var(--color-amber)';
                border = 'var(--color-amber)';
                textColor = '#000';
              } else if (inRange) {
                bg = 'var(--color-surface-3)';
                border = 'var(--color-border-light)';
                textColor = 'var(--color-text)';
              } else {
                bg = 'var(--color-surface)';
                textColor = 'var(--color-text-dim)';
              }
            }

            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-1 transition-all duration-200"
              >
                <div
                  className="w-8 h-8 flex items-center justify-center text-[10px] font-mono border transition-all duration-200"
                  style={{ backgroundColor: bg, borderColor: border, color: textColor }}
                >
                  {val}
                </div>
                <span className="text-[8px] font-mono text-[var(--color-text-dim)]">{idx}</span>
              </div>
            );
          })}
        </div>

        {/* Low / Mid / High markers */}
        {step && (
          <div className="flex gap-3 mt-3 text-[10px] font-mono">
            <span className="text-[var(--color-text-muted)]">low={step.low}</span>
            <span className="text-[var(--color-amber)]">mid={step.mid}</span>
            <span className="text-[var(--color-text-muted)]">high={step.high}</span>
          </div>
        )}
      </div>

      {/* Step Description */}
      {step && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[var(--text-xs)] font-mono text-[var(--color-text-muted)]">
            {step.description}
          </p>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-[var(--color-text-dim)]">
              Comparisons: <span className="text-[#3b82f6]">{result.comparisons}</span>
            </span>
            <span className={`px-1.5 py-0.5 ${result.found ? 'text-[#10b981] bg-[rgba(16,185,129,0.1)]' : 'text-[#ef4444] bg-[rgba(239,68,68,0.1)]'}`}>
              {result.found ? `FOUND at index ${result.index}` : 'NOT FOUND'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
