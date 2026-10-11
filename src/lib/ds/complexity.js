/* ============================================================
   Unit 1 — Complexity Analysis & Big-O Notation
   ============================================================
   Provides complexity metadata for all DS operations and
   growth-rate functions for the interactive comparison chart.
   ============================================================ */

/**
 * Ordered complexity levels from best to worst.
 * Used for comparison and chart rendering.
 */
export const COMPLEXITY_LEVELS = [
  { notation: 'O(1)',       label: 'Constant',      color: '#10b981' },
  { notation: 'O(log n)',   label: 'Logarithmic',   color: '#22d3ee' },
  { notation: 'O(n)',       label: 'Linear',         color: '#3b82f6' },
  { notation: 'O(n log n)', label: 'Linearithmic',  color: '#a855f7' },
  { notation: 'O(n²)',      label: 'Quadratic',      color: '#f59e0b' },
  { notation: 'O(2ⁿ)',      label: 'Exponential',    color: '#ef4444' },
];

/**
 * Growth rate functions — returns f(n) for a given Big-O class.
 * Used by the ComplexityChart visualizer to plot curves.
 */
export const GROWTH_FUNCTIONS = {
  'O(1)':       (n) => 1,
  'O(log n)':   (n) => Math.max(1, Math.log2(n)),
  'O(n)':       (n) => n,
  'O(n log n)': (n) => n * Math.max(1, Math.log2(n)),
  'O(n²)':      (n) => n * n,
  'O(2ⁿ)':      (n) => Math.pow(2, Math.min(n, 20)), // capped to avoid Infinity
};

/**
 * Comprehensive complexity table for every DS and algorithm
 * implemented in this project, grouped by syllabus unit.
 */
export const COMPLEXITY_TABLE = {
  /* ── Unit 2: Sorting ── */
  'Bubble Sort': {
    unit: 2,
    category: 'Sorting',
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: true,
    note: 'Best case O(n) with early termination when already sorted',
  },
  'Selection Sort': {
    unit: 2,
    category: 'Sorting',
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: false,
    note: 'Always performs n(n-1)/2 comparisons regardless of input',
  },
  'Insertion Sort': {
    unit: 2,
    category: 'Sorting',
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: true,
    note: 'Efficient for small or nearly-sorted datasets',
  },
  'Merge Sort': {
    unit: 2,
    category: 'Sorting',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(n)',
    stable: true,
    note: 'Divide-and-conquer; consistent performance but uses extra space',
  },
  'Quick Sort': {
    unit: 2,
    category: 'Sorting',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)',
    space: 'O(log n)',
    stable: false,
    note: 'Worst case with bad pivot choice; avg case fastest in practice',
  },

  /* ── Unit 2: Searching ── */
  'Linear Search': {
    unit: 2,
    category: 'Searching',
    best: 'O(1)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(1)',
    note: 'Works on unsorted arrays',
  },
  'Binary Search': {
    unit: 2,
    category: 'Searching',
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
    space: 'O(1)',
    note: 'Requires sorted input; divide-and-conquer approach',
  },

  /* ── Unit 3: Linked Lists ── */
  'Singly Linked List': {
    unit: 3,
    category: 'Linked List',
    insert_head: 'O(1)',
    insert_tail: 'O(n)',
    delete_head: 'O(1)',
    delete_by_value: 'O(n)',
    search: 'O(n)',
    traverse: 'O(n)',
    space: 'O(n)',
    note: 'No random access; efficient head insertion',
  },
  'Doubly Linked List': {
    unit: 3,
    category: 'Linked List',
    insert_head: 'O(1)',
    insert_tail: 'O(1)',
    delete_head: 'O(1)',
    delete_tail: 'O(1)',
    delete_by_value: 'O(n)',
    search: 'O(n)',
    traverse: 'O(n)',
    space: 'O(n)',
    note: 'Bidirectional traversal; more memory per node (prev pointer)',
  },
  'Circular Linked List': {
    unit: 3,
    category: 'Linked List',
    insert: 'O(1)',
    delete: 'O(n)',
    traverse: 'O(n)',
    search: 'O(n)',
    space: 'O(n)',
    note: 'Last node points to first; useful for round-robin scheduling',
  },

  /* ── Unit 4: Stacks & Queues ── */
  'Stack': {
    unit: 4,
    category: 'Stack',
    push: 'O(1)',
    pop: 'O(1)',
    peek: 'O(1)',
    search: 'O(n)',
    space: 'O(n)',
    note: 'LIFO — Last In, First Out',
  },
  'Queue': {
    unit: 4,
    category: 'Queue',
    enqueue: 'O(1)',
    dequeue: 'O(1)',
    front: 'O(1)',
    search: 'O(n)',
    space: 'O(n)',
    note: 'FIFO — First In, First Out',
  },
  'Circular Queue': {
    unit: 4,
    category: 'Queue',
    enqueue: 'O(1)',
    dequeue: 'O(1)',
    front: 'O(1)',
    space: 'O(n)',
    note: 'Fixed-size; uses modular arithmetic to wrap around',
  },
  'Priority Queue (Min-Heap)': {
    unit: 4,
    category: 'Queue',
    insert: 'O(log n)',
    extractMin: 'O(log n)',
    peek: 'O(1)',
    space: 'O(n)',
    note: 'Array-based binary heap; always serves the minimum element first',
  },
  'Deque': {
    unit: 4,
    category: 'Queue',
    pushFront: 'O(1)',
    pushBack: 'O(1)',
    popFront: 'O(1)',
    popBack: 'O(1)',
    space: 'O(n)',
    note: 'Double-ended queue; supports both stack and queue operations',
  },

  /* ── Unit 5: Trees ── */
  'Binary Search Tree': {
    unit: 5,
    category: 'Tree',
    insert: 'O(log n)',
    search: 'O(log n)',
    delete: 'O(log n)',
    traversal: 'O(n)',
    worst_insert: 'O(n)',
    worst_search: 'O(n)',
    space: 'O(n)',
    note: 'Worst case O(n) when tree degenerates to a linked list (skewed)',
  },
  'Expression Tree': {
    unit: 5,
    category: 'Tree',
    build: 'O(n)',
    evaluate: 'O(n)',
    space: 'O(n)',
    note: 'Built from postfix expression; leaves = operands, internal = operators',
  },

  /* ── Unit 6: Graphs ── */
  'BFS': {
    unit: 6,
    category: 'Graph',
    time: 'O(V + E)',
    space: 'O(V)',
    note: 'Uses queue; finds shortest path in unweighted graphs',
  },
  'DFS': {
    unit: 6,
    category: 'Graph',
    time: 'O(V + E)',
    space: 'O(V)',
    note: 'Uses stack (or recursion); explores depth-first',
  },
  'Topological Sort': {
    unit: 6,
    category: 'Graph',
    time: 'O(V + E)',
    space: 'O(V)',
    note: 'Only for DAGs; gives linear ordering of vertices',
  },
};

/**
 * Compare two Big-O notations.
 * Returns -1 if a < b, 0 if equal, 1 if a > b.
 */
export function compareComplexities(a, b) {
  const order = COMPLEXITY_LEVELS.map(l => l.notation);
  const idxA = order.indexOf(a);
  const idxB = order.indexOf(b);
  if (idxA === -1 || idxB === -1) return 0;
  return Math.sign(idxA - idxB);
}

/**
 * Get the complexity level metadata for a given Big-O notation.
 */
export function getComplexityLevel(notation) {
  return COMPLEXITY_LEVELS.find(l => l.notation === notation) || null;
}

/**
 * Generate chart data points for a given complexity class.
 * @param {string} notation - Big-O notation string
 * @param {number} maxN - Maximum input size
 * @param {number} points - Number of data points
 * @returns {{ x: number, y: number }[]}
 */
export function generateGrowthData(notation, maxN = 100, points = 50) {
  const fn = GROWTH_FUNCTIONS[notation];
  if (!fn) return [];

  const data = [];
  for (let i = 0; i <= points; i++) {
    const x = Math.max(1, Math.round((maxN / points) * i));
    data.push({ x, y: fn(x) });
  }
  return data;
}
