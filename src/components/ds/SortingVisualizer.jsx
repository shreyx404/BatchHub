import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Shuffle } from 'lucide-react';
import { SORTING_ALGORITHMS, generateRandomArray } from '../../lib/ds';

export default function SortingVisualizer() {
  const [algorithm, setAlgorithm] = useState('bubble');
  const [arraySize, setArraySize] = useState(20);
  const [speed, setSpeed] = useState(50);
  const [array, setArray] = useState(() => generateRandomArray(20));
  const [currentStep, setCurrentStep] = useState(-1);
  const [steps, setSteps] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState(null);
  const timerRef = useRef(null);
  const stepsRef = useRef([]);

  const maxVal = Math.max(...array, 1);

  const generateNew = useCallback(() => {
    stopPlaying();
    const newArr = generateRandomArray(arraySize);
    setArray(newArr);
    setCurrentStep(-1);
    setSteps([]);
    setStats(null);
  }, [arraySize]);

  const runSort = useCallback(() => {
    stopPlaying();
    const algo = SORTING_ALGORITHMS[algorithm];
    if (!algo) return;
    const result = algo.fn([...array]);
    setSteps(result.steps);
    stepsRef.current = result.steps;
    setStats({ comparisons: result.comparisons, swaps: result.swaps });
    setCurrentStep(0);
    setIsPlaying(true);
  }, [algorithm, array]);

  const stopPlaying = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Playback effect
  useEffect(() => {
    if (!isPlaying || currentStep < 0) return;

    if (currentStep >= stepsRef.current.length) {
      setIsPlaying(false);
      return;
    }

    const delay = Math.max(10, 200 - speed * 2);
    timerRef.current = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, speed]);

  // Get current display state
  const displayArray = currentStep >= 0 && currentStep < steps.length
    ? steps[currentStep].array
    : array;
  const comparing = currentStep >= 0 && currentStep < steps.length
    ? steps[currentStep].comparing || []
    : [];
  const swapping = currentStep >= 0 && currentStep < steps.length
    ? steps[currentStep].swapping || []
    : [];
  const description = currentStep >= 0 && currentStep < steps.length
    ? steps[currentStep].description
    : 'Press ▶ Sort to begin';
  const displayMax = Math.max(...displayArray, 1);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-[var(--text-lg)] font-semibold mb-1">Sorting Algorithms</h3>
        <p className="text-[var(--text-xs)] text-[var(--color-text-dim)]">
          Watch each algorithm sort step-by-step. Compare bars highlight comparisons (blue), swaps flash amber.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={algorithm}
          onChange={(e) => { setAlgorithm(e.target.value); stopPlaying(); setCurrentStep(-1); setSteps([]); setStats(null); }}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--text-xs)] px-2 py-1.5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-border-light)]"
        >
          {Object.entries(SORTING_ALGORITHMS).map(([key, { name }]) => (
            <option key={key} value={key}>{name}</option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          <label className="text-[10px] text-[var(--color-text-dim)]">Size:</label>
          <input
            type="range" min="5" max="40" value={arraySize}
            onChange={(e) => setArraySize(Number(e.target.value))}
            className="w-16 accent-[var(--color-amber)]"
          />
          <span className="text-[10px] font-mono w-4">{arraySize}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-[10px] text-[var(--color-text-dim)]">Speed:</label>
          <input
            type="range" min="1" max="100" value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-16 accent-[var(--color-amber)]"
          />
        </div>

        <div className="flex items-center gap-1">
          <button onClick={generateNew} className="p-1.5 border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors" title="New Array">
            <Shuffle size={13} />
          </button>
          <button
            onClick={isPlaying ? stopPlaying : runSort}
            className="p-1.5 border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
            title={isPlaying ? 'Pause' : 'Sort'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button
            onClick={() => { stopPlaying(); setCurrentStep(-1); setSteps([]); setStats(null); }}
            className="p-1.5 border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
            title="Reset"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex items-end gap-[2px] h-40" style={{ minWidth: displayArray.length * 8 }}>
          {displayArray.map((val, idx) => {
            const heightPct = (val / displayMax) * 100;
            const isComparing = comparing.includes(idx);
            const isSwapping = swapping && swapping.includes(idx);
            let bgColor = 'var(--color-text-dim)';
            if (isSwapping) bgColor = 'var(--color-amber)';
            else if (isComparing) bgColor = '#3b82f6';

            return (
              <div
                key={idx}
                className="flex-1 min-w-[4px] max-w-[20px] transition-all duration-75"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: bgColor,
                  opacity: isComparing || isSwapping ? 1 : 0.5,
                }}
                title={`arr[${idx}] = ${val}`}
              />
            );
          })}
        </div>
      </div>

      {/* Step Description & Stats */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-xs)] font-mono text-[var(--color-text-muted)] truncate">
            {description}
          </p>
          {steps.length > 0 && (
            <p className="text-[10px] text-[var(--color-text-dim)] mt-1">
              Step {Math.min(currentStep + 1, steps.length)} / {steps.length}
            </p>
          )}
        </div>
        {stats && (
          <div className="flex gap-4 text-[10px] font-mono shrink-0">
            <span className="text-[var(--color-text-muted)]">
              Comparisons: <span className="text-[#3b82f6]">{stats.comparisons}</span>
            </span>
            <span className="text-[var(--color-text-muted)]">
              Swaps: <span className="text-[var(--color-amber)]">{stats.swaps}</span>
            </span>
          </div>
        )}
      </div>

      {/* BatchHub Integration */}
      <div className="border border-[var(--color-amber-dim)] bg-[var(--color-amber-dim)] px-4 py-3">
        <p className="text-[var(--text-xs)] font-medium text-[var(--color-amber)] mb-1">⬥ Used in BatchHub</p>
        <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] leading-relaxed">
          The Archive page uses these algorithms to sort past posts. Select an algorithm from the dropdown to see comparison & swap counts in real-time.
        </p>
      </div>
    </div>
  );
}
