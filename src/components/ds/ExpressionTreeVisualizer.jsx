import { useState, useMemo } from 'react';
import { Binary, Calculator, Sparkles, RefreshCw } from 'lucide-react';
import { ExpressionTree, infixToPostfix } from '../../lib/ds';

const PRESETS = [
  '(3 + 4) * 2',
  '5 * 2 + 8 / 4',
  '(10 - 4) * (2 + 3)',
  '2 ^ 3 + 4 * 5',
];

export default function ExpressionTreeVisualizer() {
  const [expression, setExpression] = useState(PRESETS[0]);
  const [errorMsg, setErrorMsg] = useState(null);

  // Compute Expression Tree from infix
  const parsedData = useMemo(() => {
    try {
      setErrorMsg(null);
      const postfixObj = infixToPostfix(expression);
      // Tokenize postfix tokens
      const tokens = postfixObj.postfix.trim().split(/\s+/).filter(Boolean);
      const { tree, steps } = ExpressionTree.fromPostfix(tokens);
      const treeJSON = tree.toJSON();
      const evalObj = tree.evaluate();
      const reconstructedInfix = tree.toInfix();
      return { tree, treeJSON, steps, evalResult: evalObj.result, reconstructedInfix, postfix: postfixObj.postfix };
    } catch (e) {
      setErrorMsg(e.message);
      return null;
    }
  }, [expression]);

  /* --- Tree Coordinate Layout Engine (SVG) --- */
  const renderTreeSVG = () => {
    if (!parsedData || !parsedData.treeJSON) {
      return (
        <div className="text-center py-10 text-[var(--text-xs)] text-[var(--color-text-dim)]">
          {errorMsg ? `Error: ${errorMsg}` : 'Enter an expression to build tree'}
        </div>
      );
    }

    const NODE_RADIUS = 18;
    const LEVEL_HEIGHT = 50;
    const WIDTH = 540;
    const HEIGHT = 240;

    const nodes = [];
    const links = [];

    const layout = (node, x, y, dx) => {
      if (!node) return;
      nodes.push({ value: node.value, isOperator: node.isOperator, x, y });

      if (node.left) {
        const childX = x - dx;
        const childY = y + LEVEL_HEIGHT;
        links.push({ x1: x, y1: y, x2: childX, y2: childY });
        layout(node.left, childX, childY, dx / 2);
      }

      if (node.right) {
        const childX = x + dx;
        const childY = y + LEVEL_HEIGHT;
        links.push({ x1: x, y1: y, x2: childX, y2: childY });
        layout(node.right, childX, childY, dx / 2);
      }
    };

    layout(parsedData.treeJSON, WIDTH / 2, 35, WIDTH / 4);

    return (
      <div className="overflow-x-auto w-full">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full max-w-[540px] mx-auto select-none"
          style={{ minWidth: '380px' }}
        >
          {/* Links */}
          {links.map((link, i) => (
            <line
              key={i}
              x1={link.x1}
              y1={link.y1}
              x2={link.x2}
              y2={link.y2}
              stroke="var(--color-border-light)"
              strokeWidth="2"
            />
          ))}

          {/* Nodes */}
          {nodes.map((n, i) => (
            <g key={i}>
              <circle
                cx={n.x}
                cy={n.y}
                r={NODE_RADIUS}
                fill={n.isOperator ? 'var(--color-surface-2)' : 'var(--color-amber-glow)'}
                stroke={n.isOperator ? 'var(--color-border-light)' : 'var(--color-amber)'}
                strokeWidth={2}
              />
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fontFamily="monospace"
                fill={n.isOperator ? 'var(--color-text)' : 'var(--color-amber)'}
              >
                {n.value}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Binary size={16} className="text-[var(--color-amber)]" />
          <h3 className="font-display text-[var(--text-lg)] font-semibold">
            Expression Tree (Binary Syntax Tree)
          </h3>
        </div>
        <p className="text-[var(--text-xs)] text-[var(--color-text-dim)]">
          Binary tree representing mathematical or logical expressions where internal nodes are operators and leaf nodes are operands.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[var(--text-xs)] text-[var(--color-text-dim)]">Presets:</span>
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => setExpression(p)}
            className={`px-2.5 py-1 text-[11px] font-mono border transition-colors ${
              expression === p
                ? 'border-[var(--color-amber)] text-[var(--color-amber)] bg-[var(--color-surface-2)]'
                : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="flex gap-2">
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="e.g. (3 + 4) * 2"
          className="flex-1 px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[var(--text-xs)] text-[var(--color-text)] focus:outline-none"
        />
      </div>

      {/* Visual Canvas & Pipeline Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Tree SVG */}
        <div className="lg:col-span-7 p-4 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-muted)]">
              Tree Topology <span className="text-[10px] text-[var(--color-text-dim)]">(Golden leaves = Operands, Circle = Operator)</span>
            </span>
          </div>

          <div className="border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 p-2">
            {renderTreeSVG()}
          </div>
        </div>

        {/* Right: Evaluation & Pipeline Breakdown */}
        <div className="lg:col-span-5 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
          <span className="text-[var(--text-xs)] font-semibold text-[var(--color-text)]">
            Expression Tree Properties
          </span>

          {parsedData ? (
            <div className="space-y-2 text-[var(--text-xs)]">
              <div className="p-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                <div className="text-[10px] uppercase text-[var(--color-text-dim)]">Infix Input</div>
                <div className="font-mono text-[var(--color-text)] font-semibold">{expression}</div>
              </div>

              <div className="p-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                <div className="text-[10px] uppercase text-[var(--color-text-dim)]">RPN Postfix Tokens</div>
                <div className="font-mono text-[var(--color-amber)]">{parsedData.postfix}</div>
              </div>

              <div className="p-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                <div className="text-[10px] uppercase text-[var(--color-text-dim)]">Evaluated Value</div>
                <div className="font-mono text-emerald-400 font-bold text-[var(--text-sm)]">
                  {parsedData.evalResult}
                </div>
              </div>

              <div className="p-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                <div className="text-[10px] uppercase text-[var(--color-text-dim)]">Infix Reconstructed via In-Order</div>
                <div className="font-mono text-[var(--color-text-muted)] text-[11px] truncate">
                  {parsedData.reconstructedInfix}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-[var(--text-xs)] text-red-400 p-3 bg-red-950/20 border border-red-900/40">
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Used in BatchHub Callout */}
      <div className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] border-l-2 border-l-[var(--color-amber)] flex items-start gap-3">
        <Sparkles size={16} className="text-[var(--color-amber)] shrink-0 mt-0.5" />
        <div className="text-[var(--text-xs)]">
          <span className="font-semibold text-[var(--color-text)]">Where it's used in BatchHub: </span>
          <span className="text-[var(--color-text-muted)]">
            <strong>Compound Filter Expression Trees:</strong> Used when parsing advanced search queries with boolean logic (e.g., <code className="text-[var(--color-amber)]">tag:exam AND (subject:OS OR subject:FDS)</code>). The expression tree structures the precedence of nested conditions into an executable evaluation graph.
          </span>
        </div>
      </div>
    </div>
  );
}
