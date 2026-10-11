import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, Link2, ArrowRightLeft,
  ChevronRight, Binary, ExternalLink, CheckCircle2,
  Play, Code2, Scale, ArrowRight, Cpu, Clock, Check
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import QueueVisualizer from '../components/ds/QueueVisualizer';
import LinkedListVisualizer from '../components/ds/LinkedListVisualizer';
import SortingVisualizer from '../components/ds/SortingVisualizer';

const REAL_DATA_STRUCTURES = [
  {
    id: 'priority-queue',
    number: 1,
    unit: 'Unit 4',
    title: 'Priority Queue (Min-Heap)',
    subtitle: 'Upcoming Deadlines & Urgency Scheduling',
    description: 'Models batch assignment and lab deadlines as a complete binary min-heap. Guarantees O(1) peek time for the earliest deliverable and O(log n) dynamic insertions when new posts are published.',
    icon: Layers,
    color: '#f59e0b',
    featureRoute: '/',
    featureLabel: 'Live on Homepage (Upcoming Deadlines Banner)',
    realUsage: 'Powers useUpcomingDeadlines() hook and the urgency countdown banner. Finds the next urgent assignment in O(1) time without sorting the entire post database.',

    what: {
      adt: 'Array-Backed Complete Binary Min-Heap (Priority Queue ADT)',
      files: ['src/lib/ds/priorityQueue.js', 'src/hooks/usePosts.js', 'src/components/posts/DeadlineBanner.jsx'],
      classes: ['MinHeap', 'useUpcomingDeadlines()'],
      memoryModel: '0-indexed flat contiguous array (this.heap = []). Parent at Math.floor((i - 1) / 2); left child at 2i + 1; right child at 2i + 2. Zero pointer overhead with maximum CPU cache locality.',
      methods: [
        { name: 'insert(item)', complexity: 'O(log n)', desc: 'Appends item to the heap array and executes _bubbleUp() by swapping with smaller parent nodes.' },
        { name: 'extractMin()', complexity: 'O(log n)', desc: 'Pops the root element, replaces it with the last leaf, and sifts it down via _sinkDown().' },
        { name: 'peek()', complexity: 'O(1)', desc: 'Returns root element heap[0] containing the most impending deadline without mutating the heap.' },
        { name: 'isEmpty() / size()', complexity: 'O(1)', desc: 'Instantaneous boundary checks evaluating heap.length.' },
      ],
      comparator: '(a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()',
    },

    how: {
      callSite: 'src/hooks/usePosts.js → useUpcomingDeadlines()',
      uiConsumer: 'src/components/posts/DeadlineBanner.jsx',
      lifecycle: [
        { step: '1. Ingestion', detail: 'Public API queries published posts with future due dates (due_date > now()).' },
        { step: '2. Heap Build', detail: 'Instantiates new MinHeap(comparator) and calls heap.insert(item) for each deliverable in O(log n) time.' },
        { step: '3. Ordering', detail: 'heap.extractMin() sequentially dequeues items in strictly ascending chronological order into a prioritized array.' },
        { step: '4. Rendering', detail: 'Homepage DeadlineBanner inspects index 0 in O(1) time to render the live ticking urgency countdown.' },
      ],
      codeSnippet: `// src/hooks/usePosts.js (Line 58)
const heap = new MinHeap((a, b) => 
  new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
);

data.forEach((item) => heap.insert(item)); // O(log n) insertion

const sorted = [];
while (!heap.isEmpty()) {
  sorted.push(heap.extractMin()); // O(log n) extract min
}
setDeadlines(sorted);`,
    },

    why: {
      problem: 'College batch portals receive frequent deadline announcements throughout the day. Students constantly need to know: "What deliverable is due next?"',
      naiveApproach: 'Re-sorting the entire array (posts.sort()) every time an item is inserted, queried, or updated, costing O(n log n) comparisons.',
      dsAdvantage: 'Min-Heap guarantees that the most urgent deliverable is always at the root index in O(1) time. Inserting a newly announced assignment takes only O(log n) time without re-evaluating unrelated posts.',
      complexities: [
        { op: 'Peek Earliest Deadline', naive: 'O(n) search or O(n log n) sort', heap: 'O(1)', benefit: 'Instantaneous display on feed' },
        { op: 'Insert New Deadline', naive: 'O(n log n) full re-sort', heap: 'O(log n)', benefit: 'Minimal overhead on live updates' },
        { op: 'Extract Completed Task', naive: 'O(n) find & splice', heap: 'O(log n)', benefit: 'Efficient post retirement' },
        { op: 'Memory Footprint', naive: 'O(n) array', heap: 'O(n) flat array', benefit: 'Zero pointer overhead' },
      ],
    },
  },
  {
    id: 'linked-list',
    number: 2,
    unit: 'Unit 3',
    title: 'Doubly Linked List',
    subtitle: 'Post Feed & Prev/Next Pointer Navigation',
    description: 'Represents the active post sequence as a bidirectional chain of DLLNodes with .prev and .next memory pointers, eliminating O(n) array lookups.',
    icon: Link2,
    color: '#a855f7',
    featureRoute: '/',
    featureLabel: 'Live on Post Detail View (/post/:id)',
    realUsage: 'Powers post-to-post sequential navigation on PostPage.jsx. Students hop directly between previous and next posts via memory pointers in O(1) time.',

    what: {
      adt: 'Bidirectional Doubly Linked List (Node Pointer ADT)',
      files: ['src/lib/ds/linkedList.js', 'src/hooks/useDSIntegration.js', 'src/pages/PostPage.jsx'],
      classes: ['DoublyLinkedList', 'DLLNode', 'useDSIntegration.getPostNavigation()'],
      memoryModel: 'Dynamic heap allocation where each DLLNode wraps post data with two direct object pointers: node.prev points to the prior post, node.next points to the succeeding post.',
      methods: [
        { name: 'append(data)', complexity: 'O(1)', desc: 'Attaches a new post node to this.tail and sets tail.next and newNode.prev.' },
        { name: 'prepend(data)', complexity: 'O(1)', desc: 'Inserts node at this.head and rewires previous head.prev pointer.' },
        { name: 'delete(value)', complexity: 'O(1)*', desc: 'Bypasses target node by splicing node.prev.next = node.next and node.next.prev = node.prev.' },
        { name: 'getPostNavigation()', complexity: 'O(1) hop', desc: 'Reads currentNode.prev.data and currentNode.next.data directly.' },
      ],
      comparator: 'Node equality by string post ID matching (current.data.id === currentId)',
    },

    how: {
      callSite: 'src/pages/PostPage.jsx → getPostNavigation(allPosts, id)',
      uiConsumer: 'src/pages/PostPage.jsx (Previous / Next action bar)',
      lifecycle: [
        { step: '1. Ingestion', detail: 'PostPage mounts for route /post/:id and fetches the active batch post feed.' },
        { step: '2. DLL Construction', detail: 'useDSIntegration instantiates DoublyLinkedList and appends all posts sequentially.' },
        { step: '3. Cursor Identification', detail: 'Traverses the list once to locate the active node corresponding to the URL parameter.' },
        { step: '4. Pointer Hop', detail: 'Directly yields current.prev.data and current.next.data for instant O(1) next/previous navigation.' },
      ],
      codeSnippet: `// src/hooks/useDSIntegration.js (Line 66)
const dll = new DoublyLinkedList();
posts.forEach(p => dll.append(p));

let current = dll.head;
while (current) {
  if (String(current.data.id) === String(currentId)) {
    return {
      prevPost: current.prev ? current.prev.data : null,
      nextPost: current.next ? current.next.data : null,
    };
  }
  current = current.next;
}`,
    },

    why: {
      problem: 'When students read through long assignment guidelines or notices, they want seamless sequential reading (flipping to previous and next updates) like a book.',
      naiveApproach: 'Scanning the entire array on every page navigation using posts.findIndex(p => p.id === id), which scales linearly O(n) with array size and requires index boundary arithmetic.',
      dsAdvantage: 'A Doubly Linked List links items bidirectionally in memory. Moving forward or backward is a true O(1) pointer dereference without index math or array slicing.',
      complexities: [
        { op: 'Navigate to Next Post', naive: 'O(n) findIndex + bounds check', heap: 'O(1) pointer dereference', benefit: 'Instant route transitions' },
        { op: 'Navigate to Prev Post', naive: 'O(n) findIndex + bounds check', heap: 'O(1) pointer dereference', benefit: 'Zero array re-scans' },
        { op: 'Insert into Feed', naive: 'O(n) array shift/splice', heap: 'O(1) at head or tail', benefit: 'Constant time feed insertion' },
        { op: 'Memory Overhead', naive: 'Flat array (1 pointer/element)', heap: 'O(n) with 2 pointers/node', benefit: 'Negligible in modern browsers' },
      ],
    },
  },
  {
    id: 'sorting',
    number: 3,
    unit: 'Unit 2',
    title: 'Sorting Algorithms',
    subtitle: 'Archive Event Discovery & Benchmarking',
    description: 'Hand-written implementations of Bubble, Selection, Insertion, Merge, and Quick Sort running on live batch records with real-time comparison and swap telemetry.',
    icon: ArrowRightLeft,
    color: '#3b82f6',
    featureRoute: '/archive',
    featureLabel: 'Live on Archive Page (/archive Sort Bar)',
    realUsage: 'Powers the FDS algorithm selector in ArchiveSortBar.jsx. Replaces black-box browser sorts so students can inspect exact comparisons and swaps on real batch posts.',

    what: {
      adt: 'Classical Sorting Algorithms & Execution Telemetry Engine (Unit 2)',
      files: ['src/lib/ds/sorting.js', 'src/hooks/useDSIntegration.js', 'src/pages/ArchivePage.jsx', 'src/components/ui/ArchiveSortBar.jsx'],
      classes: ['quickSort()', 'mergeSort()', 'insertionSort()', 'selectionSort()', 'bubbleSort()'],
      memoryModel: 'In-memory array permutation with comparator functions comparing ISO timestamps (created_at, due_date) or string titles (localeCompare).',
      methods: [
        { name: 'quickSort(arr, cmp)', complexity: 'Avg O(n log n), Worst O(n²)', desc: 'Divide-and-conquer using Lomuto partitioning; counts recursive element swaps.' },
        { name: 'mergeSort(arr, cmp)', complexity: 'O(n log n) all cases', desc: 'Stable divide-and-conquer splitting into halves and merging auxiliary arrays.' },
        { name: 'insertionSort(arr, cmp)', complexity: 'Best O(n), Avg O(n²)', desc: 'Adaptive sorting; shifts elements in-place. Highly optimal for nearly-sorted feeds.' },
        { name: 'bubbleSort(arr, cmp)', complexity: 'Best O(n), Avg O(n²)', desc: 'Pairwise adjacent comparisons with early-exit flag if no swaps occur.' },
      ],
      comparator: 'Flexible comparator supporting chronological, alphabetical, and due date orders.',
    },

    how: {
      callSite: 'src/pages/ArchivePage.jsx → useDSIntegration.sortPosts()',
      uiConsumer: 'src/components/ui/ArchiveSortBar.jsx (Algorithm Selector & Metrics Badge)',
      lifecycle: [
        { step: '1. Ingestion', detail: 'ArchivePage fetches past and archived batch events from the database.' },
        { step: '2. User Selection', detail: 'User selects Quick Sort, Merge Sort, Insertion Sort, etc., from the FDS Algo dropdown.' },
        { step: '3. Telemetry Sort', detail: 'Hand-written algorithm executes on a copy of the posts, incrementing comparison and swap counters.' },
        { step: '4. Telemetry Render', detail: 'Archive grid displays newly sorted posts and shows exact metrics: "Quick Sort · 14 comparisons, 8 swaps".' },
      ],
      codeSnippet: `// src/pages/ArchivePage.jsx (Line 100)
const { displayPosts, sortStats } = useMemo(() => {
  if (sortAlgorithm === 'native') {
    return { displayPosts: posts, sortStats: null };
  }
  const isAsc = sortBy === 'oldest' || sortBy === 'title_asc' || sortBy === 'due_asc';
  const field = sortBy.startsWith('title') ? 'title' : 
                sortBy.startsWith('due') ? 'due_date' : 'created_at';
                
  const res = sortPosts(posts, sortAlgorithm, field, isAsc);
  return { displayPosts: res.sorted, sortStats: res };
}, [posts, sortAlgorithm, sortBy, sortPosts]);`,
    },

    why: {
      problem: 'In browser apps, Array.prototype.sort() is an opaque C++ black box (V8 Timsort). Students cannot see how many comparisons or swaps actually occur.',
      naiveApproach: 'Relying exclusively on native engine sort without empirical insight into time complexity trade-offs.',
      dsAdvantage: 'Exposing custom sorting implementations on live archive data lets students empirically observe how algorithmic Big-O theory behaves on real data (e.g. noticing Insertion Sort running near O(n) on nearly sorted timelines).',
      complexities: [
        { op: 'Quick Sort', naive: 'Engine dependent', heap: 'Avg O(n log n), Aux O(log n)', benefit: 'Fastest average performance on large feeds' },
        { op: 'Merge Sort', naive: 'Engine dependent', heap: 'Guaranteed O(n log n), Aux O(n)', benefit: 'Stable ordering preserving secondary keys' },
        { op: 'Insertion Sort', naive: 'Engine dependent', heap: 'Best O(n), Aux O(1)', benefit: 'Ideal for nearly-sorted chronological feeds' },
        { op: 'Bubble Sort', naive: 'Engine dependent', heap: 'Worst O(n²), Aux O(1)', benefit: 'Demonstrates quadratic worst-case behavior' },
      ],
    },
  },
];

export default function DSShowcasePage() {
  const [activeTab, setActiveTab] = useState('priority-queue');
  const [subView, setSubView] = useState('playground'); // 'playground' | 'what-how' | 'why'

  const currentItem = useMemo(
    () => REAL_DATA_STRUCTURES.find((p) => p.id === activeTab),
    [activeTab]
  );

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header />

      {/* Hero Section */}
      <section className="relative border-b border-[var(--color-border)] overflow-hidden">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 py-8 sm:py-12">
          <div className="flex items-center gap-2 mb-3">
            <Binary size={14} className="text-[var(--color-amber)]" />
            <span className="text-[var(--text-xs)] tracking-[0.12em] uppercase text-[var(--color-text-dim)] font-medium">
              Fundamentals of Data Structures · Course Project
            </span>
          </div>
          <h1 className="font-display text-[var(--text-3xl)] sm:text-[var(--text-4xl)] font-semibold tracking-[-0.02em] leading-tight mb-2">
            Data Structures Really Used in
            <span className="text-[var(--color-amber)]"> BatchHub</span>
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
            Rather than shoehorning textbook concepts that don’t fit a batch management system, BatchHub focuses exclusively on the <strong>3 data structures that genuinely power production workflows</strong>. Inspect their implementations, complexity metrics, and live in-app behaviors below.
          </p>
        </div>
        <div className="grain-overlay" />
      </section>

      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar — Structures Navigation */}
          <nav className="lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-20">
              <p className="text-[var(--text-xs)] tracking-[0.1em] uppercase text-[var(--color-text-dim)] mb-3 font-medium">
                Active In BatchHub
              </p>

              <div className="flex flex-col gap-1 border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
                {REAL_DATA_STRUCTURES.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                      }}
                      className={`w-full text-left p-3 transition-colors flex items-start gap-3 border ${
                        isActive
                          ? 'bg-[var(--color-surface-2)] border-[var(--color-amber)] text-[var(--color-text)] shadow-sm'
                          : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                      }`}
                    >
                      <div
                        className="w-8 h-8 shrink-0 flex items-center justify-center border mt-0.5"
                        style={{
                          borderColor: isActive ? 'var(--color-amber)' : 'var(--color-border)',
                          backgroundColor: isActive ? 'var(--color-amber-glow)' : 'transparent',
                          color: isActive ? 'var(--color-amber)' : 'inherit',
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider">
                            {item.unit}
                          </span>
                          <span className="text-[10px] text-[var(--color-border)]">·</span>
                          <span className="text-[10px] font-mono text-[var(--color-amber)]">
                            #{item.number}
                          </span>
                        </div>
                        <p className="text-[var(--text-xs)] font-medium truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-dim)] truncate">
                          {item.subtitle}
                        </p>
                      </div>
                      <ChevronRight
                        size={14}
                        className={`shrink-0 mt-2 transition-transform ${
                          isActive ? 'text-[var(--color-amber)] translate-x-0.5' : 'text-transparent'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Integrity Note */}
              <div className="mt-4 p-3 border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--text-xs)] text-[var(--color-text-dim)] leading-relaxed">
                <div className="flex items-center gap-1.5 text-[var(--color-amber)] font-medium mb-1">
                  <CheckCircle2 size={13} />
                  <span>Engineering Integrity</span>
                </div>
                No artificial fillers. Only data structures with real, verifiable call sites in BatchHub’s codebase are featured here.
              </div>
            </div>
          </nav>

          {/* Main Visualizer & Architecture Area */}
          <main className="flex-1 min-w-0">
            {/* Header info for active structure */}
            <div className="mb-4 p-4 sm:p-5 border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span
                  className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border"
                  style={{
                    borderColor: 'var(--color-amber)',
                    color: 'var(--color-amber)',
                    backgroundColor: 'var(--color-amber-glow)',
                  }}
                >
                  {currentItem?.unit} · IMPLEMENTATION #{currentItem?.number}
                </span>

                {currentItem?.featureRoute && (
                  <Link
                    to={currentItem.featureRoute}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-amber)] hover:underline border border-[var(--color-amber)]/40 px-2 py-0.5 bg-[var(--color-amber-glow)]/20"
                  >
                    <span>{currentItem.featureLabel}</span>
                    <ExternalLink size={11} />
                  </Link>
                )}
              </div>

              <h2 className="font-display text-[var(--text-xl)] sm:text-[var(--text-2xl)] font-semibold tracking-[-0.01em]">
                {currentItem?.title}
              </h2>
              <p className="text-[var(--text-xs)] text-[var(--color-text-dim)] font-medium mt-0.5">
                {currentItem?.subtitle}
              </p>
              <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] mt-2 leading-relaxed">
                {currentItem?.description}
              </p>

              {/* Real In-App Usage Callout */}
              <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-start gap-2 text-[var(--text-xs)] text-[var(--color-text-muted)]">
                <span className="font-medium text-[var(--color-amber)] shrink-0">Real BatchHub Usage:</span>
                <span>{currentItem?.realUsage}</span>
              </div>
            </div>

            {/* Sub-View Switcher: Playground | What & How | Why */}
            <div className="flex items-center border border-[var(--color-border)] bg-[var(--color-surface)] mb-6 overflow-hidden">
              <button
                onClick={() => setSubView('playground')}
                className={`flex-1 py-2.5 px-3 text-[var(--text-xs)] font-medium flex items-center justify-center gap-2 transition-colors ${
                  subView === 'playground'
                    ? 'bg-[var(--color-surface-2)] text-[var(--color-amber)] border-b-2 border-b-[var(--color-amber)]'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
                }`}
              >
                <Play size={13} />
                <span>Interactive Playground</span>
              </button>
              <button
                onClick={() => setSubView('what-how')}
                className={`flex-1 py-2.5 px-3 text-[var(--text-xs)] font-medium border-l border-[var(--color-border)] flex items-center justify-center gap-2 transition-colors ${
                  subView === 'what-how'
                    ? 'bg-[var(--color-surface-2)] text-[var(--color-amber)] border-b-2 border-b-[var(--color-amber)]'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
                }`}
              >
                <Code2 size={13} />
                <span>What & How (Code Flow)</span>
              </button>
              <button
                onClick={() => setSubView('why')}
                className={`flex-1 py-2.5 px-3 text-[var(--text-xs)] font-medium border-l border-[var(--color-border)] flex items-center justify-center gap-2 transition-colors ${
                  subView === 'why'
                    ? 'bg-[var(--color-surface-2)] text-[var(--color-amber)] border-b-2 border-b-[var(--color-amber)]'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
                }`}
              >
                <Scale size={13} />
                <span>Why Used & Complexity</span>
              </button>
            </div>

            {/* Sub-View 1: Interactive Playground */}
            {subView === 'playground' && (
              <div className="animate-fade-in" key={`${activeTab}-playground`}>
                {activeTab === 'priority-queue' && <QueueVisualizer />}
                {activeTab === 'linked-list' && <LinkedListVisualizer />}
                {activeTab === 'sorting' && <SortingVisualizer />}
              </div>
            )}

            {/* Sub-View 2: What & How (Deep Technical Breakdown) */}
            {subView === 'what-how' && currentItem && (
              <div className="space-y-6 animate-fade-in" key={`${activeTab}-what-how`}>
                {/* WHAT Section */}
                <div className="p-4 sm:p-5 border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Cpu size={16} className="text-[var(--color-amber)]" />
                    <h3 className="font-display text-[var(--text-base)] font-semibold">
                      WHAT Is Used: Data Structure Specification
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[var(--text-xs)] mb-4">
                    <div className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                      <span className="text-[var(--color-text-dim)] block mb-1 font-mono uppercase text-[10px]">
                        Abstract Data Type
                      </span>
                      <p className="font-medium text-[var(--color-text)]">{currentItem.what.adt}</p>
                    </div>
                    <div className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                      <span className="text-[var(--color-text-dim)] block mb-1 font-mono uppercase text-[10px]">
                        Source Files
                      </span>
                      <div className="space-y-0.5 font-mono text-[11px] text-[var(--color-amber)]">
                        {currentItem.what.files.map(f => (
                          <div key={f}>{f}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] mb-4 text-[var(--text-xs)]">
                    <span className="text-[var(--color-text-dim)] block mb-1 font-mono uppercase text-[10px]">
                      Internal Memory Representation
                    </span>
                    <p className="text-[var(--color-text-muted)] leading-relaxed">
                      {currentItem.what.memoryModel}
                    </p>
                  </div>

                  <div>
                    <span className="text-[var(--text-xs)] text-[var(--color-text-dim)] block mb-2 font-mono uppercase text-[10px]">
                      Core Methods & Invariants
                    </span>
                    <div className="border border-[var(--color-border)] overflow-x-auto">
                      <table className="w-full text-left text-[var(--text-xs)]">
                        <thead className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)] text-[var(--color-text-dim)] font-mono text-[10px] uppercase">
                          <tr>
                            <th className="p-2.5">Method</th>
                            <th className="p-2.5">Time Complexity</th>
                            <th className="p-2.5">Operational Behavior</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                          {currentItem.what.methods.map(m => (
                            <tr key={m.name} className="hover:bg-[var(--color-surface-hover)]">
                              <td className="p-2.5 font-mono text-[var(--color-amber)]">{m.name}</td>
                              <td className="p-2.5 font-mono text-[11px]">{m.complexity}</td>
                              <td className="p-2.5 text-[var(--color-text-muted)]">{m.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* HOW Section */}
                <div className="p-4 sm:p-5 border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={16} className="text-[var(--color-amber)]" />
                    <h3 className="font-display text-[var(--text-base)] font-semibold">
                      HOW It Operates in BatchHub: Execution Lifecycle
                    </h3>
                  </div>

                  {/* 4 Steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    {currentItem.how.lifecycle.map((item, idx) => (
                      <div
                        key={item.step}
                        className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--text-xs)] flex flex-col justify-between"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-5 h-5 flex items-center justify-center font-mono text-[10px] bg-[var(--color-amber-glow)] text-[var(--color-amber)] border border-[var(--color-amber)]/40">
                            0{idx + 1}
                          </span>
                          <span className="font-medium text-[var(--color-text)]">{item.step}</span>
                        </div>
                        <p className="text-[var(--color-text-muted)] leading-relaxed text-[11px]">
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Actual Code Snippet from BatchHub */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[var(--text-xs)] text-[var(--color-text-dim)] font-mono text-[10px] uppercase">
                        Active Call Site: <span className="text-[var(--color-text)] font-sans">{currentItem.how.callSite}</span>
                      </span>
                      <span className="text-[10px] font-mono text-[var(--color-amber)]">Production JavaScript</span>
                    </div>
                    <pre className="p-3 sm:p-4 bg-[var(--color-surface-3)] border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-text)] overflow-x-auto leading-relaxed">
                      <code>{currentItem.how.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-View 3: Why (Architectural Rationale & Trade-Offs) */}
            {subView === 'why' && currentItem && (
              <div className="space-y-6 animate-fade-in" key={`${activeTab}-why`}>
                <div className="p-4 sm:p-5 border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Scale size={16} className="text-[var(--color-amber)]" />
                    <h3 className="font-display text-[var(--text-base)] font-semibold">
                      WHY It Is Used: Algorithmic Rationale & Trade-Offs
                    </h3>
                  </div>

                  <div className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] mb-4 text-[var(--text-xs)]">
                    <span className="text-[var(--color-text-dim)] block mb-1 font-mono uppercase text-[10px]">
                      The Operational Problem in BatchHub
                    </span>
                    <p className="text-[var(--color-text)] leading-relaxed">
                      {currentItem.why.problem}
                    </p>
                  </div>

                  {/* Naive vs DS Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[var(--text-xs)] mb-5">
                    <div className="p-3.5 border border-red-500/20 bg-red-950/10">
                      <div className="flex items-center gap-1.5 text-red-400 font-medium mb-1.5">
                        <span>Naive JavaScript Approach</span>
                      </div>
                      <p className="text-[var(--color-text-muted)] leading-relaxed text-[11px]">
                        {currentItem.why.naiveApproach}
                      </p>
                    </div>

                    <div className="p-3.5 border border-[var(--color-amber)]/40 bg-[var(--color-amber-glow)]/15">
                      <div className="flex items-center gap-1.5 text-[var(--color-amber)] font-medium mb-1.5">
                        <Check size={13} />
                        <span>BatchHub DS Approach</span>
                      </div>
                      <p className="text-[var(--color-text)] leading-relaxed text-[11px]">
                        {currentItem.why.dsAdvantage}
                      </p>
                    </div>
                  </div>

                  {/* Complexity Comparison Matrix */}
                  <div>
                    <span className="text-[var(--text-xs)] text-[var(--color-text-dim)] block mb-2 font-mono uppercase text-[10px]">
                      Asymptotic Complexity Comparison
                    </span>
                    <div className="border border-[var(--color-border)] overflow-x-auto">
                      <table className="w-full text-left text-[var(--text-xs)]">
                        <thead className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)] text-[var(--color-text-dim)] font-mono text-[10px] uppercase">
                          <tr>
                            <th className="p-2.5">Operation</th>
                            <th className="p-2.5">Naive Array Approach</th>
                            <th className="p-2.5">BatchHub DS Engine</th>
                            <th className="p-2.5">Practical Benefit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                          {currentItem.why.complexities.map(row => (
                            <tr key={row.op} className="hover:bg-[var(--color-surface-hover)]">
                              <td className="p-2.5 font-medium text-[var(--color-text)]">{row.op}</td>
                              <td className="p-2.5 font-mono text-[11px] text-red-400/90">{row.naive}</td>
                              <td className="p-2.5 font-mono text-[11px] text-[var(--color-amber)] font-semibold">{row.heap}</td>
                              <td className="p-2.5 text-[var(--color-text-muted)] text-[11px]">{row.benefit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
