import { useState, useMemo } from 'react';
import { Grid, RefreshCw, ArrowRightLeft, Sparkles } from 'lucide-react';
import { SparseMatrix } from '../../lib/ds';

const ROWS = 5;
const COLS = 6;

const PRESET_DEADLINES = [
  { r: 0, c: 1, v: 2 },
  { r: 1, c: 4, v: 1 },
  { r: 2, c: 2, v: 3 },
  { r: 3, c: 0, v: 1 },
  { r: 4, c: 5, v: 2 },
];

export default function SparseMatrixVisualizer() {
  const [matrix, setMatrix] = useState(() => {
    const sm = new SparseMatrix(ROWS, COLS);
    PRESET_DEADLINES.forEach(({ r, c, v }) => sm.set(r, c, v));
    return sm;
  });

  const [inputRow, setInputRow] = useState(0);
  const [inputCol, setInputCol] = useState(0);
  const [inputValue, setInputValue] = useState(1);

  const grid = useMemo(() => matrix.toDisplayGrid(), [matrix]);
  const triplets = useMemo(() => matrix.getTriplets(), [matrix]);
  const stats = useMemo(() => {
    const total = matrix.rows * matrix.cols;
    const nz = matrix.nonZeroCount;
    const sparsity = total > 0 ? (((total - nz) / total) * 100).toFixed(1) : '0';
    // Triplet format: each triplet has 3 numbers + 1 header triplet
    const denseBytes = total * 4;
    const sparseBytes = (nz + 1) * 3 * 4;
    const memorySaved = denseBytes > 0 ? Math.max(0, Math.round((1 - sparseBytes / denseBytes) * 100)) : 0;
    return { total, nz, sparsity, denseBytes, sparseBytes, memorySaved };
  }, [matrix]);

  const handleCellClick = (r, c) => {
    const current = matrix.get(r, c);
    const nextVal = (current + 1) % 4; // cycles 0 -> 1 -> 2 -> 3 -> 0
    const newM = new SparseMatrix(matrix.rows, matrix.cols);
    for (const [tr, tc, tv] of triplets) {
      if (tr !== r || tc !== c) newM.set(tr, tc, tv);
    }
    if (nextVal > 0) {
      newM.set(r, c, nextVal);
    }
    setMatrix(newM);
  };

  const handleSetEntry = (e) => {
    e.preventDefault();
    const r = Number(inputRow);
    const c = Number(inputCol);
    const v = Number(inputValue);
    if (r >= 0 && r < matrix.rows && c >= 0 && c < matrix.cols) {
      const newM = new SparseMatrix(matrix.rows, matrix.cols);
      for (const [tr, tc, tv] of triplets) {
        if (tr !== r || tc !== c) newM.set(tr, tc, tv);
      }
      if (v > 0) newM.set(r, c, v);
      setMatrix(newM);
    }
  };

  const handleTranspose = () => {
    setMatrix(matrix.transpose());
  };

  const handleReset = () => {
    const sm = new SparseMatrix(ROWS, COLS);
    PRESET_DEADLINES.forEach(({ r, c, v }) => sm.set(r, c, v));
    setMatrix(sm);
  };

  const handleClear = () => {
    setMatrix(new SparseMatrix(ROWS, COLS));
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Grid size={16} className="text-[var(--color-amber)]" />
          <h3 className="font-display text-[var(--text-lg)] font-semibold">
            Sparse Matrix (Triplet Representation)
          </h3>
        </div>
        <p className="text-[var(--text-xs)] text-[var(--color-text-dim)]">
          Real college batches have sparse deadline density (most calendar slots have 0 deadlines). Storing only non-zero coordinates saves space: O(k) vs O(m×n).
        </p>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[var(--text-xs)]">
        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-[var(--color-text-dim)] uppercase tracking-wider text-[10px] mb-1">Dimensions</div>
          <div className="font-mono text-[var(--text-sm)] font-semibold text-[var(--color-text)]">
            {matrix.rows} × {matrix.cols} <span className="text-[var(--color-text-dim)] font-normal text-[11px]">({stats.total} cells)</span>
          </div>
        </div>
        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-[var(--color-text-dim)] uppercase tracking-wider text-[10px] mb-1">Non-Zero (k)</div>
          <div className="font-mono text-[var(--text-sm)] font-semibold text-[var(--color-amber)]">
            {stats.nz} <span className="text-[var(--color-text-dim)] font-normal text-[11px]">({stats.sparsity}% sparse)</span>
          </div>
        </div>
        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-[var(--color-text-dim)] uppercase tracking-wider text-[10px] mb-1">Dense Space</div>
          <div className="font-mono text-[var(--text-sm)] text-[var(--color-text-muted)]">
            {stats.denseBytes} bytes <span className="text-[10px] text-[var(--color-text-dim)]">O(m·n)</span>
          </div>
        </div>
        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-[var(--color-text-dim)] uppercase tracking-wider text-[10px] mb-1">Sparse Triplet Space</div>
          <div className="font-mono text-[var(--text-sm)] text-[var(--color-amber)] font-medium">
            {stats.sparseBytes} bytes <span className="text-[10px] text-[var(--color-text-dim)]">O(k)</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: 2D Matrix Grid */}
        <div className="lg:col-span-7 p-4 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-muted)]">
              2D Density Grid <span className="text-[10px] text-[var(--color-text-dim)]">(Click any cell to toggle value)</span>
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={handleTranspose}
                className="flex items-center gap-1 px-2 py-1 text-[11px] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors"
                title="Transpose (swap row and column)"
              >
                <ArrowRightLeft size={11} />
                <span>Transpose</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2 py-1 text-[11px] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors"
                title="Reset to batch deadlines preset"
              >
                <RefreshCw size={11} />
                <span>Preset</span>
              </button>
              <button
                onClick={handleClear}
                className="px-2 py-1 text-[11px] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Grid Render */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-center font-mono text-[var(--text-xs)]">
              <thead>
                <tr>
                  <th className="p-1.5 text-[10px] text-[var(--color-text-dim)] border border-[var(--color-border)] bg-[var(--color-surface-2)]">
                    R\C
                  </th>
                  {Array.from({ length: matrix.cols }).map((_, c) => (
                    <th key={c} className="p-1.5 text-[10px] text-[var(--color-text-dim)] border border-[var(--color-border)] bg-[var(--color-surface-2)]">
                      C{c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.map((rowArr, r) => (
                  <tr key={r}>
                    <td className="p-1.5 text-[10px] text-[var(--color-text-dim)] border border-[var(--color-border)] bg-[var(--color-surface-2)] font-semibold">
                      R{r}
                    </td>
                    {rowArr.map((val, c) => {
                      const isNonZero = val > 0;
                      return (
                        <td
                          key={c}
                          onClick={() => handleCellClick(r, c)}
                          className={`p-2 border border-[var(--color-border)] cursor-pointer select-none transition-all ${
                            isNonZero
                              ? 'bg-[var(--color-amber-glow)] font-bold text-[var(--color-amber)] hover:brightness-125'
                              : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text-dim)]'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSetEntry} className="mt-4 pt-3 border-t border-[var(--color-border)] flex flex-wrap items-center gap-2 text-[var(--text-xs)]">
            <span className="text-[var(--color-text-dim)]">Set cell:</span>
            <div className="flex items-center gap-1">
              <label className="text-[10px] text-[var(--color-text-dim)]">Row</label>
              <input
                type="number"
                min={0}
                max={matrix.rows - 1}
                value={inputRow}
                onChange={(e) => setInputRow(e.target.value)}
                className="w-12 px-1.5 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[var(--color-text)] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-[10px] text-[var(--color-text-dim)]">Col</label>
              <input
                type="number"
                min={0}
                max={matrix.cols - 1}
                value={inputCol}
                onChange={(e) => setInputCol(e.target.value)}
                className="w-12 px-1.5 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[var(--color-text)] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-[10px] text-[var(--color-text-dim)]">Val</label>
              <input
                type="number"
                min={0}
                max={99}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-14 px-1.5 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[var(--color-text)] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-2.5 py-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border-light)] text-[var(--color-text)] transition-colors"
            >
              Update
            </button>
          </form>
        </div>

        {/* Right: Triplet Table (FDS Syllabus Coordinate Form) */}
        <div className="lg:col-span-5 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-muted)]">
              Syllabus Triplet Form <span className="font-mono text-[10px] text-[var(--color-amber)]">T(k+1, 3)</span>
            </span>
            <span className="text-[10px] text-[var(--color-text-dim)]">
              Row 0 = Meta header
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[300px]">
            <table className="w-full border-collapse text-left font-mono text-[var(--text-xs)]">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                  <th className="p-1.5 text-[10px] text-[var(--color-text-dim)]">Index</th>
                  <th className="p-1.5 text-[10px] text-[var(--color-text-dim)]">Row</th>
                  <th className="p-1.5 text-[10px] text-[var(--color-text-dim)]">Col</th>
                  <th className="p-1.5 text-[10px] text-[var(--color-text-dim)]">Value</th>
                </tr>
              </thead>
              <tbody>
                {/* Header Row (Syllabus standard for Triplet rep: [rows, cols, nonZeroCount]) */}
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-amber-glow)] font-bold text-[var(--color-amber)]">
                  <td className="p-1.5 text-[10px] text-[var(--color-amber)]">0 (Meta)</td>
                  <td className="p-1.5">{matrix.rows}</td>
                  <td className="p-1.5">{matrix.cols}</td>
                  <td className="p-1.5">{stats.nz}</td>
                </tr>
                {triplets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-3 text-center text-[var(--color-text-dim)] text-[11px]">
                      No non-zero entries (all cells are 0)
                    </td>
                  </tr>
                ) : (
                  triplets.map(([r, c, v], idx) => (
                    <tr key={`${r}-${c}`} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors">
                      <td className="p-1.5 text-[10px] text-[var(--color-text-dim)]">{idx + 1}</td>
                      <td className="p-1.5 text-[var(--color-text)]">{r}</td>
                      <td className="p-1.5 text-[var(--color-text)]">{c}</td>
                      <td className="p-1.5 font-bold text-[var(--color-amber)]">{v}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-dim)]">
            <span className="font-semibold text-[var(--color-text)]">FDS Concept: </span>
            Row 0 encodes <span className="font-mono text-[var(--color-amber)]">(rows, cols, non_zeros)</span> followed by each non-zero coordinate triplet.
          </div>
        </div>
      </div>

      {/* Used in BatchHub Callout */}
      <div className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] border-l-2 border-l-[var(--color-amber)] flex items-start gap-3">
        <Sparkles size={16} className="text-[var(--color-amber)] shrink-0 mt-0.5" />
        <div className="text-[var(--text-xs)]">
          <span className="font-semibold text-[var(--color-text)]">Where it's used in BatchHub: </span>
          <span className="text-[var(--color-text-muted)]">
            Calendar deadline & schedule density. Because only a small fraction of days have active deadlines, storing schedule attendance and deadline clusters in a SparseMatrix avoids allocating large dense matrices for unoccupied months.
          </span>
        </div>
      </div>
    </div>
  );
}
