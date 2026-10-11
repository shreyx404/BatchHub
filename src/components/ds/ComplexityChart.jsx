import { useState, useMemo } from 'react';
import { COMPLEXITY_LEVELS, GROWTH_FUNCTIONS, COMPLEXITY_TABLE } from '../../lib/ds';

const MAX_N = 50;

export default function ComplexityChart() {
  const [inputSize, setInputSize] = useState(20);
  const [selectedLevels, setSelectedLevels] = useState(
    COMPLEXITY_LEVELS.map(l => l.notation)
  );

  const toggleLevel = (notation) => {
    setSelectedLevels(prev =>
      prev.includes(notation)
        ? prev.filter(l => l !== notation)
        : [...prev, notation]
    );
  };

  // Generate chart data
  const chartData = useMemo(() => {
    const points = 40;
    return selectedLevels.map(notation => {
      const fn = GROWTH_FUNCTIONS[notation];
      const level = COMPLEXITY_LEVELS.find(l => l.notation === notation);
      const data = [];
      for (let i = 1; i <= points; i++) {
        const x = Math.max(1, Math.round((inputSize / points) * i));
        data.push({ x, y: fn(x) });
      }
      return { notation, color: level?.color || '#888', label: level?.label || '', data };
    });
  }, [inputSize, selectedLevels]);

  // Find max Y for scaling (cap at a reasonable value for display)
  const maxY = useMemo(() => {
    let max = 1;
    for (const series of chartData) {
      for (const pt of series.data) {
        if (pt.y > max && pt.y < Infinity) max = pt.y;
      }
    }
    return Math.min(max, inputSize * inputSize * 2);
  }, [chartData, inputSize]);

  // SVG dimensions
  const W = 600, H = 300, PAD = 40;

  // Group complexity table by category
  const groupedTable = useMemo(() => {
    const groups = {};
    for (const [name, info] of Object.entries(COMPLEXITY_TABLE)) {
      const cat = info.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ name, ...info });
    }
    return groups;
  }, []);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="font-display text-[var(--text-lg)] font-semibold mb-1">
          Growth Rate Comparison
        </h3>
        <p className="text-[var(--text-xs)] text-[var(--color-text-dim)] leading-relaxed">
          See how different time complexities scale as input size increases. Toggle curves on/off and adjust n.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-[var(--text-xs)] text-[var(--color-text-dim)]">n =</label>
          <input
            type="range"
            min="5"
            max={MAX_N}
            value={inputSize}
            onChange={(e) => setInputSize(Number(e.target.value))}
            className="w-28 accent-[var(--color-amber)]"
          />
          <span className="text-[var(--text-sm)] font-mono w-6 text-right">{inputSize}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMPLEXITY_LEVELS.map(level => {
            const active = selectedLevels.includes(level.notation);
            return (
              <button
                key={level.notation}
                onClick={() => toggleLevel(level.notation)}
                className={`px-2 py-1 text-[10px] font-mono border transition-all ${
                  active
                    ? 'border-current text-[var(--color-text)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-dim)] opacity-40'
                }`}
                style={active ? { borderColor: level.color, color: level.color } : {}}
              >
                {level.notation}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[600px]" style={{ minWidth: 320 }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(frac => {
            const y = PAD + (H - 2 * PAD) * (1 - frac);
            return (
              <g key={frac}>
                <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="var(--color-border)" strokeWidth="0.5" />
                <text x={PAD - 4} y={y + 3} textAnchor="end" fill="var(--color-text-dim)" fontSize="8" fontFamily="monospace">
                  {Math.round(maxY * frac)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(frac => {
            const x = PAD + (W - 2 * PAD) * frac;
            return (
              <text key={frac} x={x} y={H - PAD + 14} textAnchor="middle" fill="var(--color-text-dim)" fontSize="8" fontFamily="monospace">
                {Math.round(inputSize * frac) || 1}
              </text>
            );
          })}

          {/* Axis labels */}
          <text x={W / 2} y={H - 6} textAnchor="middle" fill="var(--color-text-dim)" fontSize="9" fontFamily="monospace">
            Input Size (n)
          </text>
          <text x={12} y={H / 2} textAnchor="middle" fill="var(--color-text-dim)" fontSize="9" fontFamily="monospace" transform={`rotate(-90, 12, ${H / 2})`}>
            Operations
          </text>

          {/* Data curves */}
          {chartData.map(series => {
            const pathData = series.data
              .map((pt, i) => {
                const x = PAD + ((pt.x / inputSize) * (W - 2 * PAD));
                const y = PAD + (H - 2 * PAD) * (1 - Math.min(pt.y / maxY, 1));
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              })
              .join(' ');

            return (
              <g key={series.notation}>
                <path d={pathData} fill="none" stroke={series.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
                {/* Label at end of line */}
                {series.data.length > 0 && (() => {
                  const last = series.data[series.data.length - 1];
                  const x = PAD + ((last.x / inputSize) * (W - 2 * PAD));
                  const y = PAD + (H - 2 * PAD) * (1 - Math.min(last.y / maxY, 1));
                  return (
                    <text x={x + 4} y={y + 3} fill={series.color} fontSize="7" fontFamily="monospace" fontWeight="600">
                      {series.notation}
                    </text>
                  );
                })()}
              </g>
            );
          })}
        </svg>
      </div>

      {/* BatchHub Integration Callout */}
      <div className="border border-[var(--color-amber-dim)] bg-[var(--color-amber-dim)] px-4 py-3">
        <p className="text-[var(--text-xs)] font-medium text-[var(--color-amber)] mb-1">⬥ Used in BatchHub</p>
        <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] leading-relaxed">
          Complexity annotations appear on every data structure visualization in this showcase. 
          Each operation is labelled with its Big-O time & space complexity — directly from the syllabus.
        </p>
      </div>

      {/* Complexity Reference Table */}
      <div>
        <h3 className="font-display text-[var(--text-lg)] font-semibold mb-3">
          Operations Complexity Reference
        </h3>
        <div className="space-y-4">
          {Object.entries(groupedTable).map(([category, items]) => (
            <div key={category}>
              <p className="text-[var(--text-xs)] tracking-[0.1em] uppercase text-[var(--color-text-dim)] mb-2 font-medium">
                {category}
              </p>
              <div className="border border-[var(--color-border)] overflow-x-auto">
                <table className="w-full text-[var(--text-xs)]">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                      <th className="text-left px-3 py-2 font-medium text-[var(--color-text-muted)]">Structure</th>
                      <th className="text-left px-3 py-2 font-medium text-[var(--color-text-muted)]">Best</th>
                      <th className="text-left px-3 py-2 font-medium text-[var(--color-text-muted)]">Average</th>
                      <th className="text-left px-3 py-2 font-medium text-[var(--color-text-muted)]">Worst</th>
                      <th className="text-left px-3 py-2 font-medium text-[var(--color-text-muted)]">Space</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.name} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] transition-colors">
                        <td className="px-3 py-2 font-medium">{item.name}</td>
                        <td className="px-3 py-2 font-mono text-[10px]" style={{ color: COMPLEXITY_LEVELS.find(l => l.notation === item.best)?.color }}>
                          {item.best || item.time || '—'}
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px]" style={{ color: COMPLEXITY_LEVELS.find(l => l.notation === item.average)?.color }}>
                          {item.average || '—'}
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px]" style={{ color: COMPLEXITY_LEVELS.find(l => l.notation === item.worst)?.color }}>
                          {item.worst || '—'}
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px]">{item.space || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
