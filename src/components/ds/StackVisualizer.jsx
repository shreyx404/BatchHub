import { useState } from 'react';
import { Layers, ArrowDown, ArrowUp, Calculator, Sparkles, RefreshCw } from 'lucide-react';
import { Stack, infixToPostfix, evaluatePostfix } from '../../lib/ds';

const SAMPLE_EXPRESSIONS = [
  '(3 + 4) * 2',
  '5 + 2 * 3 - 4 / 2',
  '2 ^ 3 + 4 * 5',
  '10 + 20 * (3 - 1)',
];

export default function StackVisualizer() {
  // Stack state
  const [stack] = useState(() => {
    const s = new Stack();
    ['Lab-1', 'Assignment-2', 'Exam-Notice'].forEach(item => s.push(item));
    return s;
  });
  const [stackItems, setStackItems] = useState(() => stack.toArray());
  const [pushValue, setPushValue] = useState('');
  const [stackMessage, setStackMessage] = useState('Initialized with 3 items');

  // Expression conversion state
  const [infixInput, setInfixInput] = useState(SAMPLE_EXPRESSIONS[0]);
  const [conversionResult, setConversionResult] = useState(() => infixToPostfix(SAMPLE_EXPRESSIONS[0]));
  const [evalResult, setEvalResult] = useState(() => {
    try {
      return evaluatePostfix(infixToPostfix(SAMPLE_EXPRESSIONS[0]).postfix);
    } catch {
      return null;
    }
  });

  const handlePush = () => {
    const val = pushValue.trim() || `Item #${stackItems.length + 1}`;
    stack.push(val);
    setStackItems(stack.toArray());
    setPushValue('');
    setStackMessage(`Pushed "${val}" to top of stack — O(1)`);
  };

  const handlePop = () => {
    try {
      const popped = stack.pop();
      setStackItems(stack.toArray());
      setStackMessage(`Popped "${popped}" from top of stack — O(1)`);
    } catch (e) {
      setStackMessage(e.message);
    }
  };

  const handleClearStack = () => {
    stack.clear();
    setStackItems([]);
    setStackMessage('Stack cleared');
  };

  const handleConvert = (expr = infixInput) => {
    try {
      const res = infixToPostfix(expr);
      setConversionResult(res);
      try {
        const ev = evaluatePostfix(res.postfix);
        setEvalResult(ev);
      } catch {
        setEvalResult(null);
      }
    } catch (e) {
      setConversionResult({ postfix: 'Error: ' + e.message, steps: [] });
      setEvalResult(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Layers size={16} className="text-[var(--color-amber)]" />
          <h3 className="font-display text-[var(--text-lg)] font-semibold">
            Stack (LIFO) & Shunting-Yard Application
          </h3>
        </div>
        <p className="text-[var(--text-xs)] text-[var(--color-text-dim)]">
          Last-In, First-Out abstract data type with O(1) Push/Pop operations. Essential for parsing expressions and tracking nested histories.
        </p>
      </div>

      {/* Part 1: Interactive Stack Viewport */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Stack Column */}
        <div className="md:col-span-5 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-muted)]">
              Stack Chamber <span className="font-mono text-[10px] text-[var(--color-amber)]">(Top is Open)</span>
            </span>
            <span className="text-[10px] font-mono text-[var(--color-text-dim)]">
              Size: {stackItems.length}
            </span>
          </div>

          {/* Vertical Stack Tube */}
          <div className="flex-1 flex flex-col-reverse justify-start border-x-2 border-b-2 border-[var(--color-border-light)] p-2 min-h-[220px] bg-[var(--color-surface-2)]/40 gap-1.5">
            {stackItems.length === 0 ? (
              <div className="text-center my-auto text-[var(--text-xs)] text-[var(--color-text-dim)]">
                Stack Underflow (Empty)
              </div>
            ) : (
              stackItems.map((item, idx) => {
                const isTop = idx === stackItems.length - 1;
                return (
                  <div
                    key={idx}
                    className={`p-2 text-center text-[var(--text-xs)] font-mono border transition-all ${
                      isTop
                        ? 'border-[var(--color-amber)] bg-[var(--color-amber-glow)] font-bold text-[var(--color-amber)] shadow-sm'
                        : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-[var(--color-text-dim)]">[{idx}]</span>
                      <span className="truncate mx-2">{item}</span>
                      {isTop && (
                        <span className="text-[9px] uppercase tracking-wider text-[var(--color-amber)] font-bold">
                          TOP
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-2 text-[10px] font-mono text-[var(--color-text-dim)] text-center">
            ← Bottom of Stack (Closed)
          </div>
        </div>

        {/* Right: Stack Operations */}
        <div className="md:col-span-7 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="text-[var(--text-xs)] font-semibold text-[var(--color-text)]">
              LIFO Stack Operations
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={pushValue}
                onChange={(e) => setPushValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePush()}
                placeholder="Item to push..."
                className="flex-1 px-2.5 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--text-xs)] text-[var(--color-text)] focus:outline-none"
              />
              <button
                onClick={handlePush}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] text-[var(--text-xs)] font-medium transition-colors"
              >
                <ArrowDown size={13} className="text-[var(--color-amber)]" />
                <span>Push</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePop}
                disabled={stackItems.length === 0}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 text-[var(--color-text)] text-[var(--text-xs)] transition-colors"
              >
                <ArrowUp size={13} className="text-red-400" />
                <span>Pop Top Item</span>
              </button>
              <button
                onClick={handleClearStack}
                disabled={stackItems.length === 0}
                className="px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 text-[var(--color-text-dim)] hover:text-[var(--color-text)] text-[var(--text-xs)] transition-colors"
              >
                Clear Stack
              </button>
            </div>

            <div className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--text-xs)]">
              <div className="text-[10px] uppercase text-[var(--color-text-dim)] font-semibold mb-1">Active Output</div>
              <div className="font-mono text-[var(--color-amber)]">{stackMessage}</div>
            </div>
          </div>

          <div className="text-[11px] text-[var(--color-text-dim)] leading-relaxed border-t border-[var(--color-border)] pt-2">
            Time Complexity: <span className="text-[var(--color-amber)] font-mono">O(1)</span> Push, <span className="text-[var(--color-amber)] font-mono">O(1)</span> Pop, <span className="text-[var(--color-amber)] font-mono">O(1)</span> Peek. Space Complexity: <span className="text-[var(--color-amber)] font-mono">O(n)</span>.
          </div>
        </div>
      </div>

      {/* Part 2: Infix to Postfix Converter (Shunting-Yard Algorithm) */}
      <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calculator size={15} className="text-[var(--color-amber)]" />
            <h4 className="font-display text-[var(--text-md)] font-semibold text-[var(--color-text)]">
              Application: Infix to Postfix & Evaluation (Shunting-Yard)
            </h4>
          </div>
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1">
            {SAMPLE_EXPRESSIONS.map((expr, i) => (
              <button
                key={i}
                onClick={() => {
                  setInfixInput(expr);
                  handleConvert(expr);
                }}
                className={`px-2 py-0.5 text-[10px] font-mono border transition-colors ${
                  infixInput === expr
                    ? 'border-[var(--color-amber)] text-[var(--color-amber)] bg-[var(--color-surface-2)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
                }`}
              >
                Ex {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Input bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={infixInput}
            onChange={(e) => setInfixInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
            placeholder="Type infix expression, e.g. (3 + 4) * 2"
            className="flex-1 px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[var(--text-xs)] text-[var(--color-text)] focus:outline-none"
          />
          <button
            onClick={() => handleConvert()}
            className="px-4 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] text-[var(--text-xs)] font-medium text-[var(--color-text)] transition-colors"
          >
            Convert
          </button>
        </div>

        {/* Conversion Output Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[var(--text-xs)]">
          <div className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <div className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-wider mb-1">
              Postfix Result (RPN)
            </div>
            <div className="font-mono text-[var(--text-sm)] font-bold text-[var(--color-amber)]">
              {conversionResult.postfix}
            </div>
          </div>
          <div className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <div className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-wider mb-1">
              Evaluated Value (via Postfix Stack)
            </div>
            <div className="font-mono text-[var(--text-sm)] font-bold text-emerald-400">
              {evalResult !== null && evalResult.result !== undefined ? evalResult.result : 'N/A (Symbolic)'}
            </div>
          </div>
        </div>

        {/* Step-by-Step Table */}
        {conversionResult.steps && conversionResult.steps.length > 0 && (
          <div className="mt-3">
            <div className="text-[11px] font-semibold text-[var(--color-text-muted)] mb-2">
              Step-by-Step Operator Stack Walkthrough:
            </div>
            <div className="overflow-x-auto max-h-[220px]">
              <table className="w-full border-collapse font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-dim)] text-left">
                    <th className="p-1.5">Step</th>
                    <th className="p-1.5">Token</th>
                    <th className="p-1.5">Operator Stack</th>
                    <th className="p-1.5">Output Queue</th>
                    <th className="p-1.5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {conversionResult.steps.map((st, i) => (
                    <tr key={i} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors">
                      <td className="p-1.5 text-[var(--color-text-dim)]">{i + 1}</td>
                      <td className="p-1.5 text-[var(--color-amber)] font-bold">{st.token}</td>
                      <td className="p-1.5 text-[var(--color-text-muted)]">
                        [{st.stack.join(', ')}]
                      </td>
                      <td className="p-1.5 text-[var(--color-text)]">
                        {st.output.join(' ')}
                      </td>
                      <td className="p-1.5 text-[10px] text-[var(--color-text-dim)]">
                        {st.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Used in BatchHub Callout */}
      <div className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] border-l-2 border-l-[var(--color-amber)] flex items-start gap-3">
        <Sparkles size={16} className="text-[var(--color-amber)] shrink-0 mt-0.5" />
        <div className="text-[var(--text-xs)]">
          <span className="font-semibold text-[var(--color-text)]">Where it's used in BatchHub: </span>
          <span className="text-[var(--color-text-muted)]">
            Admin Post Editor undo/redo state management uses a dual-stack mechanism (Undo Stack + Redo Stack). The Shunting-Yard engine also powers the Unit 5 Expression Tree generation.
          </span>
        </div>
      </div>
    </div>
  );
}
