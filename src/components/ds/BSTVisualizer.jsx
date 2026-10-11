import { useState, useMemo, useEffect, useRef } from 'react';
import { TreePine, Plus, Search, Trash2, Play, Sparkles, RefreshCw } from 'lucide-react';
import { BST } from '../../lib/ds';

const PRESET_VALUES = [50, 30, 70, 20, 40, 60, 80, 15, 25, 65, 85];

export default function BSTVisualizer() {
  const [bst, setBst] = useState(() => {
    const tree = new BST();
    PRESET_VALUES.forEach(v => tree.insert(v));
    return tree;
  });

  const [inputVal, setInputVal] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [deleteVal, setDeleteVal] = useState('');
  const [rangeMin, setRangeMin] = useState(25);
  const [rangeMax, setRangeMax] = useState(65);
  
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [activeTraversal, setActiveTraversal] = useState(null);
  const [traversalResult, setTraversalResult] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('BST ready');

  const treeJSON = useMemo(() => bst.toJSON(), [bst]);
  const treeStats = useMemo(() => ({
    size: bst.size,
    height: bst.height(),
    min: bst.min() ?? 'None',
    max: bst.max() ?? 'None',
  }), [bst]);

  // Insert handler
  const handleInsert = (e) => {
    e?.preventDefault();
    const val = parseInt(inputVal, 10);
    if (isNaN(val)) return;

    const newTree = new BST();
    // Replay current nodes or insert
    const currentNodes = bst.inOrder().values.map(v => typeof v === 'object' ? v.value : v);
    if (!currentNodes.includes(val)) {
      currentNodes.forEach(v => newTree.insert(v));
      newTree.insert(val);
      setBst(newTree);
      setHighlightedNodes([val]);
      setStatusMsg(`Inserted ${val} — O(log n) path`);
    } else {
      setStatusMsg(`Value ${val} already exists in BST`);
    }
    setInputVal('');
  };

  // Search handler
  const handleSearch = (e) => {
    e?.preventDefault();
    const val = parseInt(searchVal, 10);
    if (isNaN(val)) return;

    const res = bst.search(val);
    setHighlightedNodes(res.path);
    if (res.found) {
      setStatusMsg(`Found ${val}! Path: [${res.path.join(' → ')}] (${res.comparisons} comparisons)`);
    } else {
      setStatusMsg(`Value ${val} not found. Path explored: [${res.path.join(' → ')}]`);
    }
  };

  // Delete handler
  const handleDelete = (e) => {
    e?.preventDefault();
    const val = parseInt(deleteVal, 10);
    if (isNaN(val)) return;

    const currentNodes = bst.inOrder().values.map(v => typeof v === 'object' ? v.value : v);
    if (currentNodes.includes(val)) {
      const remaining = currentNodes.filter(v => v !== val);
      const newTree = new BST();
      remaining.forEach(v => newTree.insert(v));
      setBst(newTree);
      setHighlightedNodes([]);
      setStatusMsg(`Deleted ${val} from BST`);
    } else {
      setStatusMsg(`Value ${val} does not exist in BST`);
    }
    setDeleteVal('');
  };

  // Traversal Runner
  const runTraversal = (type) => {
    if (isAnimating) return;
    setActiveTraversal(type);
    let res;
    if (type === 'inorder') res = bst.inOrder();
    else if (type === 'preorder') res = bst.preOrder();
    else if (type === 'postorder') res = bst.postOrder();
    else res = bst.levelOrder();

    const nodeVals = res.values.map(v => typeof v === 'object' ? v.value : v);
    setTraversalResult(nodeVals);

    // Animate highlight node by node
    setIsAnimating(true);
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < nodeVals.length) {
        setHighlightedNodes([nodeVals[idx]]);
        idx++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        setHighlightedNodes(nodeVals);
        setStatusMsg(`${type.toUpperCase()} Traversal complete: [${nodeVals.join(', ')}]`);
      }
    }, 400);
  };

  // Range Query Runner
  const handleRangeQuery = () => {
    const min = parseInt(rangeMin, 10);
    const max = parseInt(rangeMax, 10);
    if (isNaN(min) || isNaN(max)) return;

    const results = bst.rangeQuery(min, max).map(v => typeof v === 'object' ? v.value : v);
    setHighlightedNodes(results);
    setStatusMsg(`Range [${min}..${max}] yielded ${results.length} nodes: [${results.join(', ')}]`);
  };

  // Reset Tree
  const handleReset = () => {
    const tree = new BST();
    PRESET_VALUES.forEach(v => tree.insert(v));
    setBst(tree);
    setHighlightedNodes([]);
    setTraversalResult([]);
    setActiveTraversal(null);
    setStatusMsg('Reset to preset balanced BST');
  };

  // Clear Tree
  const handleClear = () => {
    setBst(new BST());
    setHighlightedNodes([]);
    setTraversalResult([]);
    setActiveTraversal(null);
    setStatusMsg('BST cleared');
  };

  /* --- Tree Coordinate Layout Engine (SVG) --- */
  const renderTreeSVG = () => {
    if (!treeJSON) {
      return (
        <div className="text-center py-12 text-[var(--text-xs)] text-[var(--color-text-dim)]">
          Binary Search Tree is empty
        </div>
      );
    }

    const NODE_RADIUS = 18;
    const LEVEL_HEIGHT = 55;
    const WIDTH = 680;
    const HEIGHT = Math.max(260, (treeStats.height + 1) * LEVEL_HEIGHT + 40);

    const nodes = [];
    const links = [];

    // Recursive layout helper
    const layout = (node, x, y, dx) => {
      if (!node) return;
      nodes.push({ value: node.value, x, y });

      if (node.left) {
        const childX = x - dx;
        const childY = y + LEVEL_HEIGHT;
        links.push({ x1: x, y1: y, x2: childX, y2: childY, id: `${node.value}-${node.left.value}` });
        layout(node.left, childX, childY, dx / 2);
      }

      if (node.right) {
        const childX = x + dx;
        const childY = y + LEVEL_HEIGHT;
        links.push({ x1: x, y1: y, x2: childX, y2: childY, id: `${node.value}-${node.right.value}` });
        layout(node.right, childX, childY, dx / 2);
      }
    };

    layout(treeJSON, WIDTH / 2, 35, WIDTH / 4);

    return (
      <div className="overflow-x-auto w-full">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full max-w-[680px] mx-auto select-none"
          style={{ minWidth: '460px' }}
        >
          {/* Edges */}
          {links.map((link) => (
            <line
              key={link.id}
              x1={link.x1}
              y1={link.y1}
              x2={link.x2}
              y2={link.y2}
              stroke="var(--color-border-light)"
              strokeWidth="2"
            />
          ))}

          {/* Nodes */}
          {nodes.map((n) => {
            const isHigh = highlightedNodes.includes(n.value);
            return (
              <g key={n.value} className="transition-all duration-300">
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={NODE_RADIUS}
                  fill={isHigh ? 'var(--color-amber)' : 'var(--color-surface-2)'}
                  stroke={isHigh ? 'var(--color-amber-glow)' : 'var(--color-border-light)'}
                  strokeWidth={isHigh ? 3 : 2}
                  className="transition-colors"
                />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill={isHigh ? '#000000' : 'var(--color-text)'}
                >
                  {n.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <TreePine size={16} className="text-[var(--color-amber)]" />
          <h3 className="font-display text-[var(--text-lg)] font-semibold">
            Binary Search Tree (BST) & Tree Traversals
          </h3>
        </div>
        <p className="text-[var(--text-xs)] text-[var(--color-text-dim)]">
          Hierarchical tree structure with BST ordering invariant (Left &lt; Root &lt; Right). Enables O(log n) searches, range queries, and sorted in-order traversal.
        </p>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[var(--text-xs)]">
        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-[var(--color-text-dim)] uppercase tracking-wider text-[10px] mb-1">Node Count (n)</div>
          <div className="font-mono text-[var(--text-sm)] font-bold text-[var(--color-text)]">{treeStats.size}</div>
        </div>
        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-[var(--color-text-dim)] uppercase tracking-wider text-[10px] mb-1">Tree Height (h)</div>
          <div className="font-mono text-[var(--text-sm)] font-bold text-[var(--color-amber)]">{treeStats.height}</div>
        </div>
        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-[var(--color-text-dim)] uppercase tracking-wider text-[10px] mb-1">Minimum Key</div>
          <div className="font-mono text-[var(--text-sm)] text-[var(--color-text-muted)]">{treeStats.min}</div>
        </div>
        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-[var(--color-text-dim)] uppercase tracking-wider text-[10px] mb-1">Maximum Key</div>
          <div className="font-mono text-[var(--text-sm)] text-[var(--color-text-muted)]">{treeStats.max}</div>
        </div>
      </div>

      {/* Interactive Canvas */}
      <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-muted)]">
            BST Topology <span className="text-[10px] text-[var(--color-text-dim)]">(Golden glow = active nodes)</span>
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2 py-1 text-[11px] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors"
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

        {/* Tree SVG Rendering */}
        <div className="border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 p-2">
          {renderTreeSVG()}
        </div>

        {/* Status Line */}
        <div className="mt-3 text-[var(--text-xs)] font-mono flex items-center justify-between">
          <span className="text-[var(--color-text-dim)]">
            Status: <span className="text-[var(--color-amber)]">{statusMsg}</span>
          </span>
        </div>
      </div>

      {/* Traversal Selector Strip */}
      <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-xs)] font-semibold text-[var(--color-text)]">
            Traversals (Syllabus: In-Order, Pre-Order, Post-Order, Level-Order)
          </span>
          <span className="text-[10px] text-[var(--color-text-dim)]">Click to animate path</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => runTraversal('inorder')}
            disabled={isAnimating || bst.size === 0}
            className={`px-3 py-2 text-[var(--text-xs)] border transition-colors ${
              activeTraversal === 'inorder'
                ? 'border-[var(--color-amber)] bg-[var(--color-amber-glow)] text-[var(--color-amber)] font-bold'
                : 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]'
            }`}
          >
            In-Order (L-N-R)
            <div className="text-[10px] font-normal text-[var(--color-text-dim)]">Sorted order</div>
          </button>
          <button
            onClick={() => runTraversal('preorder')}
            disabled={isAnimating || bst.size === 0}
            className={`px-3 py-2 text-[var(--text-xs)] border transition-colors ${
              activeTraversal === 'preorder'
                ? 'border-[var(--color-amber)] bg-[var(--color-amber-glow)] text-[var(--color-amber)] font-bold'
                : 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]'
            }`}
          >
            Pre-Order (N-L-R)
            <div className="text-[10px] font-normal text-[var(--color-text-dim)]">Root first</div>
          </button>
          <button
            onClick={() => runTraversal('postorder')}
            disabled={isAnimating || bst.size === 0}
            className={`px-3 py-2 text-[var(--text-xs)] border transition-colors ${
              activeTraversal === 'postorder'
                ? 'border-[var(--color-amber)] bg-[var(--color-amber-glow)] text-[var(--color-amber)] font-bold'
                : 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]'
            }`}
          >
            Post-Order (L-R-N)
            <div className="text-[10px] font-normal text-[var(--color-text-dim)]">Bottom up</div>
          </button>
          <button
            onClick={() => runTraversal('levelorder')}
            disabled={isAnimating || bst.size === 0}
            className={`px-3 py-2 text-[var(--text-xs)] border transition-colors ${
              activeTraversal === 'levelorder'
                ? 'border-[var(--color-amber)] bg-[var(--color-amber-glow)] text-[var(--color-amber)] font-bold'
                : 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]'
            }`}
          >
            Level-Order (BFS)
            <div className="text-[10px] font-normal text-[var(--color-text-dim)]">Queue-driven</div>
          </button>
        </div>

        {traversalResult.length > 0 && (
          <div className="p-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--text-xs)] font-mono">
            <span className="text-[var(--color-text-dim)]">Sequence: </span>
            <span className="text-[var(--color-amber)] font-bold">[{traversalResult.join(' → ')}]</span>
          </div>
        )}
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Insert */}
        <form onSubmit={handleInsert} className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
          <div className="text-[var(--text-xs)] font-semibold text-[var(--color-text)] flex items-center gap-1">
            <Plus size={13} className="text-[var(--color-amber)]" />
            <span>Insert Key</span>
          </div>
          <div className="flex gap-1.5">
            <input
              type="number"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. 55"
              className="flex-1 px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--text-xs)] font-mono text-[var(--color-text)] focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] text-[var(--text-xs)] text-[var(--color-text)]"
            >
              Insert
            </button>
          </div>
        </form>

        {/* Search */}
        <form onSubmit={handleSearch} className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
          <div className="text-[var(--text-xs)] font-semibold text-[var(--color-text)] flex items-center gap-1">
            <Search size={13} className="text-[var(--color-amber)]" />
            <span>Search Key</span>
          </div>
          <div className="flex gap-1.5">
            <input
              type="number"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="e.g. 40"
              className="flex-1 px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--text-xs)] font-mono text-[var(--color-text)] focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] text-[var(--text-xs)] text-[var(--color-text)]"
            >
              Search
            </button>
          </div>
        </form>

        {/* Range Query */}
        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
          <div className="text-[var(--text-xs)] font-semibold text-[var(--color-text)] flex items-center gap-1">
            <Play size={13} className="text-[var(--color-amber)]" />
            <span>Range Query [min..max]</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={rangeMin}
              onChange={(e) => setRangeMin(e.target.value)}
              className="w-16 px-1.5 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--text-xs)] font-mono text-[var(--color-text)] focus:outline-none"
            />
            <span className="text-[var(--color-text-dim)] text-[10px]">to</span>
            <input
              type="number"
              value={rangeMax}
              onChange={(e) => setRangeMax(e.target.value)}
              className="w-16 px-1.5 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--text-xs)] font-mono text-[var(--color-text)] focus:outline-none"
            />
            <button
              onClick={handleRangeQuery}
              className="flex-1 px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] text-[var(--text-xs)] text-[var(--color-text)]"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Used in BatchHub Callout */}
      <div className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] border-l-2 border-l-[var(--color-amber)] flex items-start gap-3">
        <Sparkles size={16} className="text-[var(--color-amber)] shrink-0 mt-0.5" />
        <div className="text-[var(--text-xs)]">
          <span className="font-semibold text-[var(--color-text)]">Where it's used in BatchHub: </span>
          <span className="text-[var(--color-text-muted)]">
            <strong>BST Date-Range Queries:</strong> Posts are indexed by epoch timestamp into a Binary Search Tree. When viewing calendar months or filtering date windows, <code className="text-[var(--color-amber)]">rangeQuery(low, high)</code> prunes irrelevant subtrees in O(h + k) time instead of doing full table scans.
          </span>
        </div>
      </div>
    </div>
  );
}
