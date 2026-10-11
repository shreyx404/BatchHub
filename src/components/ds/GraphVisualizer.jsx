import { useState, useMemo, useEffect } from 'react';
import {
  GitBranch, Play, RefreshCw, Network, Route,
  Sparkles, Layers, List, Grid
} from 'lucide-react';
import { Graph } from '../../lib/ds';

// Default BatchHub Subject Graph Nodes
const DEFAULT_VERTICES = [
  { id: 'FDS', label: 'Data Structures', x: 260, y: 70 },
  { id: 'OS', label: 'Operating Systems', x: 120, y: 150 },
  { id: 'DBMS', label: 'Database Systems', x: 400, y: 150 },
  { id: 'TOC', label: 'Theory of Computation', x: 80, y: 280 },
  { id: 'CNS', label: 'Comp Networks', x: 260, y: 310 },
  { id: 'AI', label: 'Artificial Intelligence', x: 440, y: 280 },
];

const DEFAULT_EDGES = [
  ['FDS', 'OS'],
  ['FDS', 'DBMS'],
  ['OS', 'TOC'],
  ['OS', 'CNS'],
  ['DBMS', 'AI'],
  ['CNS', 'AI'],
  ['FDS', 'CNS'],
];

export default function GraphVisualizer() {
  const [graphType, setGraphType] = useState('undirected'); // 'undirected' | 'dag'
  const [repView, setRepView] = useState('list'); // 'list' | 'matrix'
  const [startNode, setStartNode] = useState('FDS');
  const [targetNode, setTargetNode] = useState('AI');

  const [graph, setGraph] = useState(() => {
    const g = new Graph(false);
    DEFAULT_VERTICES.forEach(v => g.addVertex(v.id, { label: v.label }));
    DEFAULT_EDGES.forEach(([u, v]) => g.addEdge(u, v));
    return g;
  });

  const [activeAlgo, setActiveAlgo] = useState(null); // 'bfs' | 'dfs' | 'shortest' | 'topo'
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [activeStepText, setActiveStepText] = useState('Ready — select a traversal or shortest path');
  const [isAnimating, setIsAnimating] = useState(false);

  // Switch between Undirected network and Directed DAG
  const handleTypeChange = (type) => {
    setGraphType(type);
    setActiveAlgo(null);
    setVisitedNodes([]);

    if (type === 'undirected') {
      const g = new Graph(false);
      DEFAULT_VERTICES.forEach(v => g.addVertex(v.id, { label: v.label }));
      DEFAULT_EDGES.forEach(([u, v]) => g.addEdge(u, v));
      setGraph(g);
      setActiveStepText('Loaded Undirected Subject Relationship Graph');
    } else {
      // Directed Acyclic Graph (Prerequisites)
      const g = new Graph(true);
      ['FDS', 'OS', 'DBMS', 'AI'].forEach(id => g.addVertex(id));
      g.addEdge('FDS', 'OS');
      g.addEdge('FDS', 'DBMS');
      g.addEdge('OS', 'AI');
      g.addEdge('DBMS', 'AI');
      setGraph(g);
      setActiveStepText('Loaded Directed Acyclic Graph (DAG) for Topological Sorting');
    }
  };

  // Run BFS
  const runBFS = () => {
    if (isAnimating) return;
    setActiveAlgo('bfs');
    setVisitedNodes([]);
    const res = graph.bfs(startNode);
    if (!res.visited.length) return;

    setIsAnimating(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < res.steps.length) {
        const step = res.steps[i];
        setVisitedNodes(prev => [...prev, step.vertex]);
        setActiveStepText(`BFS Queue: [${step.queue.join(', ')}] — ${step.description}`);
        i++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        setActiveStepText(`BFS Complete: Visited [${res.visited.join(' → ')}] in level order using FIFO Queue`);
      }
    }, 600);
  };

  // Run DFS
  const runDFS = () => {
    if (isAnimating) return;
    setActiveAlgo('dfs');
    setVisitedNodes([]);
    const res = graph.dfs(startNode);
    if (!res.visited.length) return;

    setIsAnimating(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < res.steps.length) {
        const step = res.steps[i];
        setVisitedNodes(prev => [...prev, step.vertex]);
        setActiveStepText(`DFS Stack: [${step.stack.join(', ')}] — ${step.description}`);
        i++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        setActiveStepText(`DFS Complete: Visited [${res.visited.join(' → ')}] depth-first using LIFO Stack`);
      }
    }, 600);
  };

  // Run Shortest Path (BFS)
  const runShortestPath = () => {
    if (isAnimating) return;
    setActiveAlgo('shortest');
    const res = graph.shortestPath(startNode, targetNode);
    if (res) {
      setVisitedNodes(res.path);
      setActiveStepText(`Shortest Path: [${res.path.join(' → ')}] (Distance = ${res.distance} edges)`);
    } else {
      setVisitedNodes([]);
      setActiveStepText(`No path found between ${startNode} and ${targetNode}`);
    }
  };

  // Run Topological Sort (for DAG)
  const runTopoSort = () => {
    if (isAnimating || !graph.directed) return;
    setActiveAlgo('topo');
    try {
      const res = graph.topologicalSort();
      setVisitedNodes(res.order);
      setActiveStepText(`Topological Order (Linear Dependency Resolution): [${res.order.join(' → ')}]`);
    } catch (e) {
      setActiveStepText(e.message);
    }
  };

  const adjList = useMemo(() => graph.getAdjacencyList(), [graph]);
  const adjMatrix = useMemo(() => graph.getAdjacencyMatrix(), [graph]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GitBranch size={16} className="text-[var(--color-amber)]" />
          <h3 className="font-display text-[var(--text-lg)] font-semibold">
            Graphs (Adjacency List & Matrix, BFS, DFS, Shortest Path)
          </h3>
        </div>
        <p className="text-[var(--text-xs)] text-[var(--color-text-dim)]">
          Non-linear data structure of vertices connected by edges. Powers subject prerequisites, social batch networks, and breadth-first search pathfinding.
        </p>
      </div>

      {/* Mode Switches */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center border border-[var(--color-border)] overflow-hidden">
          <button
            onClick={() => handleTypeChange('undirected')}
            className={`px-3 py-1.5 text-[var(--text-xs)] font-medium transition-colors ${
              graphType === 'undirected'
                ? 'bg-[var(--color-surface-2)] text-[var(--color-amber)] border-b-2 border-b-[var(--color-amber)]'
                : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
            }`}
          >
            Subject Network (Undirected)
          </button>
          <button
            onClick={() => handleTypeChange('dag')}
            className={`px-3 py-1.5 text-[var(--text-xs)] font-medium border-l border-[var(--color-border)] transition-colors ${
              graphType === 'dag'
                ? 'bg-[var(--color-surface-2)] text-[var(--color-amber)] border-b-2 border-b-[var(--color-amber)]'
                : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
            }`}
          >
            Prerequisites DAG (Directed)
          </button>
        </div>

        <div className="flex items-center gap-2 text-[var(--text-xs)]">
          <span className="text-[var(--color-text-dim)]">
            |V| = <strong className="text-[var(--color-text)] font-mono">{graph.vertexCount}</strong>,
            |E| = <strong className="text-[var(--color-amber)] font-mono">{graph.edgeCount}</strong>
          </span>
        </div>
      </div>

      {/* Canvas & Graph SVG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: SVG Network Canvas */}
        <div className="lg:col-span-7 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-muted)]">
              Interactive Topology <span className="text-[10px] text-[var(--color-text-dim)]">(Click any node to select as Start)</span>
            </span>
            <div className="text-[10px] font-mono text-[var(--color-amber)]">
              Start: {startNode}
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 p-2 min-h-[340px] flex items-center justify-center">
            <svg viewBox="0 0 520 370" className="w-full max-w-[520px] select-none">
              {/* Edges */}
              {graph.edges.map((e, idx) => {
                const uNode = DEFAULT_VERTICES.find(v => v.id === e.from) || { x: 150, y: 150 };
                const vNode = DEFAULT_VERTICES.find(v => v.id === e.to) || { x: 350, y: 150 };
                const isEdgeInPath = visitedNodes.includes(e.from) && visitedNodes.includes(e.to);

                return (
                  <g key={idx}>
                    <line
                      x1={uNode.x}
                      y1={uNode.y}
                      x2={vNode.x}
                      y2={vNode.y}
                      stroke={isEdgeInPath ? 'var(--color-amber)' : 'var(--color-border-light)'}
                      strokeWidth={isEdgeInPath ? 3 : 1.5}
                      className="transition-colors"
                    />
                    {graph.directed && (
                      <circle
                        cx={(uNode.x * 0.4 + vNode.x * 0.6)}
                        cy={(uNode.y * 0.4 + vNode.y * 0.6)}
                        r="3"
                        fill="var(--color-amber)"
                      />
                    )}
                  </g>
                );
              })}

              {/* Vertices */}
              {graph.vertices.map((id) => {
                const vMeta = DEFAULT_VERTICES.find(v => v.id === id) || { x: 260, y: 180, label: id };
                const isVisited = visitedNodes.includes(id);
                const isStart = id === startNode;
                const isTarget = id === targetNode;

                return (
                  <g
                    key={id}
                    onClick={() => setStartNode(id)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={vMeta.x}
                      cy={vMeta.y}
                      r={24}
                      fill={isStart ? 'var(--color-amber)' : isVisited ? 'var(--color-amber-glow)' : 'var(--color-surface-2)'}
                      stroke={isVisited || isStart ? 'var(--color-amber)' : 'var(--color-border-light)'}
                      strokeWidth={isStart ? 3 : 2}
                      className="transition-all"
                    />
                    <text
                      x={vMeta.x}
                      y={vMeta.y + 4}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="monospace"
                      fill={isStart ? '#000000' : 'var(--color-text)'}
                    >
                      {id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-3 text-[var(--text-xs)] font-mono text-[var(--color-text-dim)] truncate">
            {activeStepText}
          </div>
        </div>

        {/* Right: Algorithm Controls & Representations */}
        <div className="lg:col-span-5 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[var(--text-xs)] font-semibold text-[var(--color-text)]">
              Graph Algorithms (Syllabus: BFS & DFS)
            </span>

            {/* Traversal Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={runBFS}
                disabled={isAnimating}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50 text-[var(--text-xs)] text-[var(--color-text)] font-medium transition-colors"
              >
                <Play size={12} className="text-emerald-400" />
                <span>Run BFS (Queue)</span>
              </button>

              <button
                onClick={runDFS}
                disabled={isAnimating}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50 text-[var(--text-xs)] text-[var(--color-text)] font-medium transition-colors"
              >
                <Play size={12} className="text-sky-400" />
                <span>Run DFS (Stack)</span>
              </button>
            </div>

            {/* Shortest Path (BFS) */}
            <div className="p-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-2">
              <div className="text-[11px] font-medium text-[var(--color-text)] flex items-center justify-between">
                <span>Shortest Path (Unweighted BFS)</span>
                <span className="text-[10px] text-[var(--color-amber)] font-mono">O(V + E)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[var(--text-xs)]">
                <select
                  value={startNode}
                  onChange={(e) => setStartNode(e.target.value)}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] px-1.5 py-1 text-[11px] font-mono text-[var(--color-text)] focus:outline-none"
                >
                  {graph.vertices.map(v => <option key={v} value={v}>From: {v}</option>)}
                </select>
                <select
                  value={targetNode}
                  onChange={(e) => setTargetNode(e.target.value)}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] px-1.5 py-1 text-[11px] font-mono text-[var(--color-text)] focus:outline-none"
                >
                  {graph.vertices.map(v => <option key={v} value={v}>To: {v}</option>)}
                </select>
                <button
                  onClick={runShortestPath}
                  disabled={isAnimating}
                  className="flex-1 px-2 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] text-[11px] text-[var(--color-text)] font-medium transition-colors"
                >
                  Find Path
                </button>
              </div>
            </div>

            {/* Topological Sort Button (for DAG) */}
            {graph.directed && (
              <button
                onClick={runTopoSort}
                disabled={isAnimating}
                className="w-full py-2 bg-[var(--color-surface-2)] border border-[var(--color-amber)] hover:bg-[var(--color-surface-hover)] text-[var(--text-xs)] text-[var(--color-amber)] font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Route size={13} />
                <span>Topological Sort (Kahn / DFS Post-order)</span>
              </button>
            )}
          </div>

          {/* Representations Toggle (List vs Matrix) */}
          <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-muted)]">
                Syllabus Representation
              </span>
              <div className="flex border border-[var(--color-border)] overflow-hidden">
                <button
                  onClick={() => setRepView('list')}
                  className={`px-2 py-0.5 text-[10px] ${repView === 'list' ? 'bg-[var(--color-surface-2)] text-[var(--color-amber)] font-bold' : 'text-[var(--color-text-dim)]'}`}
                >
                  Adj List
                </button>
                <button
                  onClick={() => setRepView('matrix')}
                  className={`px-2 py-0.5 text-[10px] border-l border-[var(--color-border)] ${repView === 'matrix' ? 'bg-[var(--color-surface-2)] text-[var(--color-amber)] font-bold' : 'text-[var(--color-text-dim)]'}`}
                >
                  Adj Matrix
                </button>
              </div>
            </div>

            {repView === 'list' ? (
              <div className="p-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[10px] max-h-[140px] overflow-y-auto space-y-1">
                {Object.entries(adjList).map(([id, neighbors]) => (
                  <div key={id}>
                    <span className="text-[var(--color-amber)] font-bold">{id}</span>
                    <span className="text-[var(--color-text-dim)]"> → </span>
                    <span className="text-[var(--color-text)]">
                      [{neighbors.map(n => n.to).join(', ') || 'none'}]
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[9px] max-h-[140px] overflow-x-auto">
                <table className="border-collapse text-center w-full">
                  <thead>
                    <tr>
                      <th className="p-1 text-[var(--color-text-dim)]"></th>
                      {adjMatrix.labels.map(l => (
                        <th key={l} className="p-1 text-[var(--color-amber)] font-bold">{l}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adjMatrix.matrix.map((row, r) => (
                      <tr key={r}>
                        <td className="p-1 text-[var(--color-amber)] font-bold">{adjMatrix.labels[r]}</td>
                        {row.map((val, c) => (
                          <td key={c} className={`p-1 ${val > 0 ? 'text-[var(--color-text)] font-bold bg-[var(--color-amber-glow)]' : 'text-[var(--color-text-dim)]'}`}>
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Used in BatchHub Callout */}
      <div className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] border-l-2 border-l-[var(--color-amber)] flex items-start gap-3">
        <Sparkles size={16} className="text-[var(--color-amber)] shrink-0 mt-0.5" />
        <div className="text-[var(--text-xs)]">
          <span className="font-semibold text-[var(--color-text)]">Where it's used in BatchHub: </span>
          <span className="text-[var(--color-text-muted)]">
            <strong>Subject Relationship Graph & BFS Recommendation:</strong> BatchHub constructs an Adjacency List graph where subjects are vertices and shared post tags form edges. When viewing a subject's study notes or notices, BFS runs in O(V + E) to uncover closely connected curriculum topics.
          </span>
        </div>
      </div>
    </div>
  );
}
