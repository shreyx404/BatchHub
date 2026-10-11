import { useState, useMemo } from 'react';
import { ArrowRightLeft, ArrowRight, ArrowDown, Plus, Minus, Sparkles, RefreshCw } from 'lucide-react';
import { Queue, CircularQueue, MinHeap } from '../../lib/ds';

export default function QueueVisualizer() {
  const [activeTab, setActiveTab] = useState('linear'); // 'linear' | 'circular' | 'priority'

  /* --- Linear Queue State --- */
  const [linearQ] = useState(() => {
    const q = new Queue();
    ['Notice #1', 'Notice #2', 'Deadline #1'].forEach(x => q.enqueue(x));
    return q;
  });
  const [linearItems, setLinearItems] = useState(() => linearQ.toArray());
  const [linearInput, setLinearInput] = useState('');
  const [linearMsg, setLinearMsg] = useState('Ready');

  /* --- Circular Queue State --- */
  const [circCap] = useState(6);
  const [circQ] = useState(() => {
    const cq = new CircularQueue(6);
    ['Req-A', 'Req-B', 'Req-C'].forEach(x => cq.enqueue(x));
    return cq;
  });
  const [circState, setCircState] = useState(() => circQ._getState());
  const [circInput, setCircInput] = useState('');
  const [circMsg, setCircMsg] = useState('Front at 0, Rear at 2');

  /* --- Priority Queue (Min-Heap) State --- */
  const [pq] = useState(() => {
    const heap = new MinHeap((a, b) => a.priority - b.priority);
    [
      { label: 'OS Lab Quiz', priority: 1 },
      { label: 'FDS Assignment 2', priority: 3 },
      { label: 'Mini Project Sync', priority: 2 },
      { label: 'Batch Sports Notice', priority: 5 },
    ].forEach(item => heap.insert(item));
    return heap;
  });
  const [pqItems, setPqItems] = useState(() => pq.toArray());
  const [pqLabel, setPqLabel] = useState('');
  const [pqPriority, setPqPriority] = useState(2);
  const [pqMsg, setPqMsg] = useState('Min-heap initialized');

  /* --- Linear Handlers --- */
  const handleLinearEnqueue = () => {
    const val = linearInput.trim() || `Item #${linearItems.length + 1}`;
    linearQ.enqueue(val);
    setLinearItems(linearQ.toArray());
    setLinearInput('');
    setLinearMsg(`Enqueued "${val}" at rear — O(1)`);
  };

  const handleLinearDequeue = () => {
    try {
      const removed = linearQ.dequeue();
      setLinearItems(linearQ.toArray());
      setLinearMsg(`Dequeued "${removed}" from front — O(1)`);
    } catch (e) {
      setLinearMsg(e.message);
    }
  };

  /* --- Circular Handlers --- */
  const handleCircEnqueue = () => {
    const val = circInput.trim() || `Task-${circState.size + 1}`;
    try {
      circQ.enqueue(val);
      setCircState(circQ._getState());
      setCircInput('');
      setCircMsg(`Enqueued "${val}" at rear idx ${circQ._rear}`);
    } catch (e) {
      setCircMsg(e.message);
    }
  };

  const handleCircDequeue = () => {
    try {
      const item = circQ.dequeue();
      setCircState(circQ._getState());
      setCircMsg(`Dequeued "${item}" from front idx ${circQ._front}`);
    } catch (e) {
      setCircMsg(e.message);
    }
  };

  /* --- Priority Queue Handlers --- */
  const handlePqInsert = () => {
    const label = pqLabel.trim() || `Deadline #${pqItems.length + 1}`;
    const p = Number(pqPriority) || 1;
    pq.insert({ label, priority: p });
    setPqItems(pq.toArray());
    setPqLabel('');
    setPqMsg(`Inserted "${label}" with priority ${p} — O(log n) bubble-up`);
  };

  const handlePqExtractMin = () => {
    try {
      const min = pq.extractMin();
      setPqItems(pq.toArray());
      setPqMsg(`Extracted highest priority (min days = ${min.priority}): "${min.label}" — O(log n)`);
    } catch (e) {
      setPqMsg(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ArrowRightLeft size={16} className="text-[var(--color-amber)]" />
          <h3 className="font-display text-[var(--text-lg)] font-semibold">
            Queues, Circular Buffers & Min-Heap Priority Queues
          </h3>
        </div>
        <p className="text-[var(--text-xs)] text-[var(--color-text-dim)]">
          First-In, First-Out (FIFO) structures and heap-ordered priority queues that power asynchronous buffers and deadline scheduling.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)]">
        <button
          onClick={() => setActiveTab('linear')}
          className={`flex-1 px-3 py-2 text-[var(--text-xs)] font-medium transition-colors ${
            activeTab === 'linear'
              ? 'bg-[var(--color-surface-2)] text-[var(--color-amber)] border-b-2 border-b-[var(--color-amber)]'
              : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
          }`}
        >
          1. Standard Queue (FIFO)
        </button>
        <button
          onClick={() => setActiveTab('circular')}
          className={`flex-1 px-3 py-2 text-[var(--text-xs)] font-medium border-l border-[var(--color-border)] transition-colors ${
            activeTab === 'circular'
              ? 'bg-[var(--color-surface-2)] text-[var(--color-amber)] border-b-2 border-b-[var(--color-amber)]'
              : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
          }`}
        >
          2. Circular Queue (Ring Buffer)
        </button>
        <button
          onClick={() => setActiveTab('priority')}
          className={`flex-1 px-3 py-2 text-[var(--text-xs)] font-medium border-l border-[var(--color-border)] transition-colors ${
            activeTab === 'priority'
              ? 'bg-[var(--color-surface-2)] text-[var(--color-amber)] border-b-2 border-b-[var(--color-amber)]'
              : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
          }`}
        >
          3. Priority Queue (Min-Heap)
        </button>
      </div>

      {/* Tab 1: Linear Queue */}
      {activeTab === 'linear' && (
        <div className="space-y-4">
          <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-muted)]">
                FIFO Pipe <span className="text-[10px] text-[var(--color-text-dim)]">(Dequeue from Left, Enqueue to Right)</span>
              </span>
              <span className="text-[10px] font-mono text-[var(--color-text-dim)]">
                Length: {linearItems.length}
              </span>
            </div>

            {/* Horizontal Queue Pipe */}
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center gap-2 min-w-max p-3 bg-[var(--color-surface-2)] border-y border-[var(--color-border)]">
                {/* Dequeue Arrow Indicator */}
                <div className="flex flex-col items-center text-red-400 pr-1">
                  <ArrowRight size={16} />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider">FRONT OUT</span>
                </div>

                {linearItems.length === 0 ? (
                  <div className="flex-1 text-center py-4 text-[var(--text-xs)] text-[var(--color-text-dim)]">
                    Queue is empty
                  </div>
                ) : (
                  linearItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-2.5 border text-[var(--text-xs)] font-mono min-w-[110px] text-center ${
                        idx === 0
                          ? 'border-[var(--color-amber)] bg-[var(--color-amber-glow)] font-bold text-[var(--color-amber)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface-3)] text-[var(--color-text)]'
                      }`}
                    >
                      <div className="text-[9px] text-[var(--color-text-dim)] mb-0.5">
                        {idx === 0 ? 'FRONT [0]' : idx === linearItems.length - 1 ? 'REAR' : `[${idx}]`}
                      </div>
                      <div className="truncate">{item}</div>
                    </div>
                  ))
                )}

                {/* Enqueue Arrow Indicator */}
                <div className="flex flex-col items-center text-[var(--color-amber)] pl-1">
                  <ArrowRight size={16} />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider">REAR IN</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3 text-[var(--text-xs)]">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <input
                  type="text"
                  value={linearInput}
                  onChange={(e) => setLinearInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLinearEnqueue()}
                  placeholder="Element name..."
                  className="flex-1 px-2.5 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--text-xs)] text-[var(--color-text)] focus:outline-none"
                />
                <button
                  onClick={handleLinearEnqueue}
                  className="px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium transition-colors"
                >
                  Enqueue
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLinearDequeue}
                  disabled={linearItems.length === 0}
                  className="px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 text-red-400 hover:text-red-300 font-medium transition-colors"
                >
                  Dequeue Front
                </button>
              </div>
            </div>

            <div className="mt-2 text-[10px] font-mono text-[var(--color-text-dim)]">
              Status: <span className="text-[var(--color-amber)]">{linearMsg}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Circular Queue (Ring Buffer) */}
      {activeTab === 'circular' && (
        <div className="space-y-4">
          <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-muted)]">
                  Fixed Ring Buffer <span className="font-mono text-[10px] text-[var(--color-amber)]">(Capacity = {circCap})</span>
                </span>
                <div className="text-[10px] text-[var(--color-text-dim)]">
                  Modular arithmetic: <code className="text-[var(--color-amber)]">rear = (rear + 1) % capacity</code> avoids shifting memory.
                </div>
              </div>
              <div className="flex gap-2 text-[10px] font-mono">
                <span className="px-2 py-0.5 border border-[var(--color-border)]">
                  Front: <strong className="text-emerald-400">{circState.front}</strong>
                </span>
                <span className="px-2 py-0.5 border border-[var(--color-border)]">
                  Rear: <strong className="text-[var(--color-amber)]">{circState.rear}</strong>
                </span>
                <span className="px-2 py-0.5 border border-[var(--color-border)]">
                  Count: <strong>{circState.size}/{circCap}</strong>
                </span>
              </div>
            </div>

            {/* Circular Ring Buffer Grid Slots */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 my-4">
              {circState.items.map((val, idx) => {
                const isFront = idx === circState.front && circState.size > 0;
                const isRear = idx === circState.rear && circState.size > 0;
                const isOccupied = val !== null;

                return (
                  <div
                    key={idx}
                    className={`p-3 border text-center font-mono transition-all ${
                      isOccupied
                        ? 'bg-[var(--color-surface-2)] border-[var(--color-border-light)]'
                        : 'bg-[var(--color-surface-3)]/40 border-[var(--color-border)] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] text-[var(--color-text-dim)] mb-1">
                      <span>Slot {idx}</span>
                      <div className="flex gap-1 font-bold">
                        {isFront && <span className="text-emerald-400">F</span>}
                        {isRear && <span className="text-[var(--color-amber)]">R</span>}
                      </div>
                    </div>
                    <div className={`text-[var(--text-xs)] truncate font-medium ${isOccupied ? 'text-[var(--color-text)]' : 'text-[var(--color-text-dim)] italic'}`}>
                      {isOccupied ? val : 'empty'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Controls */}
            <div className="pt-3 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3 text-[var(--text-xs)]">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <input
                  type="text"
                  value={circInput}
                  onChange={(e) => setCircInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCircEnqueue()}
                  placeholder="Task item..."
                  className="flex-1 px-2.5 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--text-xs)] text-[var(--color-text)] focus:outline-none"
                />
                <button
                  onClick={handleCircEnqueue}
                  disabled={circState.size === circCap}
                  className="px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 text-[var(--color-text)] font-medium transition-colors"
                >
                  Enqueue (Rear)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCircDequeue}
                  disabled={circState.size === 0}
                  className="px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 text-red-400 hover:text-red-300 font-medium transition-colors"
                >
                  Dequeue (Front)
                </button>
              </div>
            </div>

            <div className="mt-2 text-[10px] font-mono text-[var(--color-text-dim)]">
              Status: <span className="text-[var(--color-amber)]">{circMsg}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Priority Queue (Min-Heap) */}
      {activeTab === 'priority' && (
        <div className="space-y-4">
          <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-muted)]">
                  Min-Heap Array <span className="text-[10px] text-[var(--color-text-dim)]">(Root is always minimum element: O(1) peek)</span>
                </span>
                <div className="text-[10px] text-[var(--color-text-dim)]">
                  Parent at <code className="text-[var(--color-amber)]">floor((i-1)/2)</code>, Left child at <code className="text-[var(--color-amber)]">2i+1</code>, Right at <code className="text-[var(--color-amber)]">2i+2</code>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[var(--color-text-dim)]">
                Heap Size: {pqItems.length}
              </span>
            </div>

            {/* Heap Array Representation */}
            <div className="overflow-x-auto pb-3">
              <div className="flex items-center gap-2 min-w-max p-2 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                {pqItems.length === 0 ? (
                  <div className="flex-1 text-center py-4 text-[var(--text-xs)] text-[var(--color-text-dim)]">
                    Priority Queue is empty
                  </div>
                ) : (
                  pqItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 border text-center font-mono min-w-[120px] ${
                        idx === 0
                          ? 'border-[var(--color-amber)] bg-[var(--color-amber-glow)] font-bold text-[var(--color-amber)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface-3)] text-[var(--color-text)]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] text-[var(--color-text-dim)] mb-1">
                        <span>[{idx}]</span>
                        {idx === 0 && <span className="text-[var(--color-amber)] font-bold uppercase">MIN ROOT</span>}
                      </div>
                      <div className="text-[var(--text-xs)] truncate font-semibold mb-0.5">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">
                        Key (Days): <span className="font-bold text-[var(--color-amber)]">{item.priority}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="pt-3 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3 text-[var(--text-xs)]">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <input
                  type="text"
                  value={pqLabel}
                  onChange={(e) => setPqLabel(e.target.value)}
                  placeholder="Deadline title..."
                  className="px-2.5 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--text-xs)] text-[var(--color-text)] focus:outline-none w-40"
                />
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[var(--color-text-dim)]">Days Due:</span>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={pqPriority}
                    onChange={(e) => setPqPriority(e.target.value)}
                    className="w-16 px-1.5 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[var(--text-xs)] text-[var(--color-text)] focus:outline-none"
                  />
                </div>
                <button
                  onClick={handlePqInsert}
                  className="px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium transition-colors"
                >
                  Insert Deadline
                </button>
              </div>

              <button
                onClick={handlePqExtractMin}
                disabled={pqItems.length === 0}
                className="px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 text-[var(--color-amber)] font-medium transition-colors"
              >
                Extract Min (Urgent)
              </button>
            </div>

            <div className="mt-2 text-[10px] font-mono text-[var(--color-text-dim)]">
              Status: <span className="text-[var(--color-amber)]">{pqMsg}</span>
            </div>
          </div>
        </div>
      )}

      {/* Used in BatchHub Callout */}
      <div className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] border-l-2 border-l-[var(--color-amber)] flex items-start gap-3">
        <Sparkles size={16} className="text-[var(--color-amber)] shrink-0 mt-0.5" />
        <div className="text-[var(--text-xs)]">
          <span className="font-semibold text-[var(--color-text)]">Where it's used in BatchHub: </span>
          <span className="text-[var(--color-text-muted)]">
            <strong>Priority Queue (Min-Heap)</strong> is used directly in <code className="text-[var(--color-amber)]">useUpcomingDeadlines()</code> to rank assignments and lab due dates. The root element always yields the single most urgent task in O(1) peek time, with O(log n) dynamic insertions and deletions.
          </span>
        </div>
      </div>
    </div>
  );
}
