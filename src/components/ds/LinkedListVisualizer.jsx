import { useState } from 'react';
import {
  Link2, Plus, Trash2, Search, ArrowRight, ArrowLeftRight, RotateCw,
  Sparkles, Play
} from 'lucide-react';
import { SinglyLinkedList, DoublyLinkedList, CircularLinkedList } from '../../lib/ds';

const INITIAL_VALUES = ['Assignment 1', 'Lab Report', 'Midterm Prep', 'Project Draft'];

export default function LinkedListVisualizer() {
  const [listType, setListType] = useState('singly'); // 'singly' | 'doubly' | 'circular'
  
  // Recreate the active list instance
  const [list, setList] = useState(() => {
    const l = new SinglyLinkedList();
    INITIAL_VALUES.forEach(v => l.append(v));
    return l;
  });

  const [inputValue, setInputValue] = useState('');
  const [inputIndex, setInputIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [isTraversing, setIsTraversing] = useState(false);

  // Helper to sync state after mutation
  const syncList = (newList, msg = '') => {
    setList(newList);
    if (msg) setStatusMessage(msg);
  };

  const handleTypeChange = (type) => {
    setListType(type);
    setHighlightIdx(-1);
    let newList;
    if (type === 'singly') newList = new SinglyLinkedList();
    else if (type === 'doubly') newList = new DoublyLinkedList();
    else newList = new CircularLinkedList();

    INITIAL_VALUES.forEach(v => newList.append(v));
    syncList(newList, `Switched to ${type.toUpperCase()} Linked List`);
  };

  const handlePrepend = () => {
    const val = inputValue.trim() || `Item ${list.size + 1}`;
    list.prepend(val);
    setInputValue('');
    syncList(list, `Prepend("${val}") — O(1) at head`);
  };

  const handleAppend = () => {
    const val = inputValue.trim() || `Item ${list.size + 1}`;
    list.append(val);
    setInputValue('');
    syncList(list, `Append("${val}") — O(${listType === 'singly' ? 'n' : '1'}) at tail`);
  };

  const handleInsertAt = () => {
    const val = inputValue.trim() || `Item ${list.size + 1}`;
    const idx = Math.max(0, Math.min(Number(inputIndex), list.size));
    try {
      list.insertAt(idx, val);
      setInputValue('');
      syncList(list, `InsertAt(${idx}, "${val}") — O(n) traversal`);
    } catch (e) {
      setStatusMessage(e.message);
    }
  };

  const handleDeleteAt = (idx) => {
    try {
      const deleted = list.deleteAt(idx);
      syncList(list, `Deleted "${deleted}" at index ${idx}`);
    } catch (e) {
      setStatusMessage(e.message);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const res = list.find(searchQuery.trim());
    if (res.found) {
      setHighlightIdx(res.index);
      setStatusMessage(`Found "${searchQuery}" at index ${res.index} (${res.steps} pointer steps)`);
    } else {
      setHighlightIdx(-1);
      setStatusMessage(`"${searchQuery}" not found after ${res.steps} steps — O(n) search`);
    }
  };

  const handleTraverse = () => {
    if (isTraversing || list.size === 0) return;
    setIsTraversing(true);
    let step = 0;
    const total = list.size;

    const interval = setInterval(() => {
      if (step < total) {
        setHighlightIdx(step);
        setStatusMessage(`Visiting node ${step + 1} of ${total}...`);
        step++;
      } else {
        clearInterval(interval);
        setHighlightIdx(-1);
        setIsTraversing(false);
        setStatusMessage(`Traversal complete — O(n) visited all ${total} nodes`);
      }
    }, 450);
  };

  const handleNext = () => {
    if (listType === 'doubly' && typeof list.next === 'function') {
      const nextVal = list.next();
      syncList(list, nextVal ? `Navigated next: "${nextVal}"` : 'Already at tail node');
    }
  };

  const handlePrev = () => {
    if (listType === 'doubly' && typeof list.prev === 'function') {
      const prevVal = list.prev();
      syncList(list, prevVal ? `Navigated prev: "${prevVal}"` : 'Already at head node');
    }
  };

  const handleRotate = () => {
    if (listType === 'circular' && typeof list.rotate === 'function') {
      const curr = list.rotate();
      syncList(list, `Circular rotation: active pointer now at "${curr}"`);
    }
  };

  const nodes = list.toArray();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link2 size={16} className="text-[var(--color-amber)]" />
          <h3 className="font-display text-[var(--text-lg)] font-semibold">
            Linked Lists (Singly, Doubly & Circular)
          </h3>
        </div>
        <p className="text-[var(--text-xs)] text-[var(--color-text-dim)]">
          Dynamic memory node structures where each element points to the next (and previous). Direct pointer-based O(1) mutations without array re-allocation.
        </p>
      </div>

      {/* List Type Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center border border-[var(--color-border)] overflow-hidden">
          <button
            onClick={() => handleTypeChange('singly')}
            className={`px-3 py-1.5 text-[var(--text-xs)] font-medium transition-colors ${
              listType === 'singly'
                ? 'bg-[var(--color-surface-2)] text-[var(--color-amber)] border-b-2 border-b-[var(--color-amber)]'
                : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
            }`}
          >
            Singly Linked List
          </button>
          <button
            onClick={() => handleTypeChange('doubly')}
            className={`px-3 py-1.5 text-[var(--text-xs)] font-medium border-l border-[var(--color-border)] transition-colors ${
              listType === 'doubly'
                ? 'bg-[var(--color-surface-2)] text-[var(--color-amber)] border-b-2 border-b-[var(--color-amber)]'
                : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
            }`}
          >
            Doubly Linked List
          </button>
          <button
            onClick={() => handleTypeChange('circular')}
            className={`px-3 py-1.5 text-[var(--text-xs)] font-medium border-l border-[var(--color-border)] transition-colors ${
              listType === 'circular'
                ? 'bg-[var(--color-surface-2)] text-[var(--color-amber)] border-b-2 border-b-[var(--color-amber)]'
                : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
            }`}
          >
            Circular Linked List
          </button>
        </div>

        <div className="flex items-center gap-3 text-[var(--text-xs)]">
          <span className="text-[var(--color-text-dim)]">
            Size: <span className="font-mono font-bold text-[var(--color-text)]">{list.size}</span>
          </span>
          <button
            onClick={handleTraverse}
            disabled={isTraversing || list.size === 0}
            className="flex items-center gap-1 px-2.5 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50 text-[var(--color-text)] transition-colors"
          >
            <Play size={11} />
            <span>Traverse</span>
          </button>
        </div>
      </div>

      {/* Visual Chain Canvas */}
      <div className="p-4 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-border)] min-h-[180px] flex flex-col justify-center">
        {nodes.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-xs)] text-[var(--color-text-dim)]">
            Linked list is empty (Head = null)
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex items-center gap-2 min-w-max">
              {nodes.map((item, idx) => {
                const isHighlighted = highlightIdx === idx;
                const isHead = idx === 0;
                const isTail = idx === nodes.length - 1;
                const isCurrentCursor = listType === 'doubly' && list.current === item;

                return (
                  <div key={idx} className="flex items-center gap-2">
                    {/* Node Container */}
                    <div className="flex flex-col items-center">
                      {/* Pointers Label */}
                      <div className="flex items-center gap-1.5 text-[10px] font-mono mb-1 text-[var(--color-text-dim)]">
                        {isHead && <span className="text-[var(--color-amber)] font-bold">HEAD</span>}
                        {isTail && <span className="text-emerald-400 font-bold">TAIL</span>}
                        {isCurrentCursor && <span className="text-sky-400 font-bold">CURSOR</span>}
                      </div>

                      {/* Node Box */}
                      <div
                        className={`border transition-all flex text-[var(--text-xs)] overflow-hidden shadow-sm ${
                          isHighlighted
                            ? 'border-[var(--color-amber)] ring-2 ring-[var(--color-amber)] bg-[var(--color-surface-2)]'
                            : 'border-[var(--color-border-light)] bg-[var(--color-surface-2)]'
                        }`}
                      >
                        {/* Prev pointer partition (for DLL) */}
                        {listType === 'doubly' && (
                          <div className="px-1.5 py-2 border-r border-[var(--color-border)] bg-[var(--color-surface-3)] text-[10px] font-mono text-[var(--color-text-dim)] flex items-center justify-center">
                            {idx === 0 ? 'null' : 'prev'}
                          </div>
                        )}

                        {/* Data cell */}
                        <div className="px-3 py-2 font-mono font-medium max-w-[140px] truncate text-[var(--color-text)]">
                          {item}
                        </div>

                        {/* Next pointer partition */}
                        <div className="px-1.5 py-2 border-l border-[var(--color-border)] bg-[var(--color-surface-3)] text-[10px] font-mono text-[var(--color-text-dim)] flex items-center justify-center">
                          {isTail && listType !== 'circular' ? 'null' : 'next'}
                        </div>
                      </div>

                      {/* Index subtext & quick delete */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-mono text-[var(--color-text-dim)]">[{idx}]</span>
                        <button
                          onClick={() => handleDeleteAt(idx)}
                          className="text-[var(--color-text-dim)] hover:text-red-400 transition-colors p-0.5"
                          title="Delete node"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Arrow / Pointer Links */}
                    {!isTail ? (
                      <div className="flex flex-col items-center px-1 text-[var(--color-amber)]">
                        {listType === 'doubly' ? (
                          <ArrowLeftRight size={16} />
                        ) : (
                          <ArrowRight size={16} />
                        )}
                        <span className="text-[9px] font-mono text-[var(--color-text-dim)]">ptr</span>
                      </div>
                    ) : listType === 'circular' ? (
                      <div className="flex items-center px-1 text-[var(--color-amber)]" title="Loops back to Head">
                        <RotateCw size={15} />
                        <span className="text-[9px] font-mono text-[var(--color-text-dim)] ml-1">→ Head</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Status readout */}
        <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[var(--text-xs)]">
          <div className="font-mono text-[var(--color-text-muted)] truncate">
            Status: <span className="text-[var(--color-amber)]">{statusMessage}</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Insert Actions */}
        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
          <div className="text-[var(--text-xs)] font-semibold text-[var(--color-text)] flex items-center gap-1">
            <Plus size={13} className="text-[var(--color-amber)]" />
            <span>Insertion</span>
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Node value..."
            className="w-full px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--text-xs)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={handlePrepend}
              className="px-2 py-1 text-[11px] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-colors"
            >
              Prepend (Head)
            </button>
            <button
              onClick={handleAppend}
              className="px-2 py-1 text-[11px] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-colors"
            >
              Append (Tail)
            </button>
          </div>
          <div className="flex gap-1.5 pt-1">
            <input
              type="number"
              min={0}
              max={list.size}
              value={inputIndex}
              onChange={(e) => setInputIndex(e.target.value)}
              className="w-14 px-1.5 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[11px] font-mono text-[var(--color-text)] focus:outline-none"
            />
            <button
              onClick={handleInsertAt}
              className="flex-1 px-2 py-1 text-[11px] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-colors"
            >
              Insert at Index
            </button>
          </div>
        </div>

        {/* Search & Lookup */}
        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
          <div className="text-[var(--text-xs)] font-semibold text-[var(--color-text)] flex items-center gap-1">
            <Search size={13} className="text-[var(--color-amber)]" />
            <span>Search & Traversal</span>
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search value..."
              className="flex-1 px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--text-xs)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="px-2.5 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-colors"
            >
              Find
            </button>
          </div>
          <div className="text-[10px] text-[var(--color-text-dim)] leading-relaxed pt-1">
            Linear scan through nodes: best case O(1) at head, worst case O(n) at tail.
          </div>
        </div>

        {/* Specialized Operations (DLL Navigation or CLL Rotate) */}
        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
          <div className="text-[var(--text-xs)] font-semibold text-[var(--color-text)]">
            Specialized Operations
          </div>
          {listType === 'doubly' ? (
            <div className="space-y-2">
              <div className="text-[11px] text-[var(--color-text-dim)]">
                Bidirectional pointer hopping:
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={handlePrev}
                  className="px-2 py-1.5 text-[11px] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-colors"
                >
                  ← Prev Node
                </button>
                <button
                  onClick={handleNext}
                  className="px-2 py-1.5 text-[11px] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-colors"
                >
                  Next Node →
                </button>
              </div>
            </div>
          ) : listType === 'circular' ? (
            <div className="space-y-2">
              <div className="text-[11px] text-[var(--color-text-dim)]">
                Carousel loop pointer rotation:
              </div>
              <button
                onClick={handleRotate}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-colors"
              >
                <RotateCw size={12} />
                <span>Rotate Pointer (Head → Tail → Head)</span>
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-[var(--color-text-dim)] leading-relaxed pt-1">
              Singly linked list only moves forward via `.next`. Switch to Doubly or Circular above to test bidirectional and circular features.
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
            <strong>Doubly Linked List</strong> powers the Prev / Next post navigation on <code className="text-[var(--color-amber)]">PostPage.jsx</code> with O(1) pointer updates instead of slow array indexing. <strong>Circular Linked List</strong> drives the auto-rotating upcoming deadlines banner carousel on the student dashboard.
          </span>
        </div>
      </div>
    </div>
  );
}
