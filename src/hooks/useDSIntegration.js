import {
  DoublyLinkedList,
  MinHeap,
  SORTING_ALGORITHMS,
} from '../lib/ds';

/**
 * Hook to bridge hand-written Data Structures into real BatchHub application features.
 */
export function useDSIntegration() {
  /**
   * Sort an array of posts using a hand-written algorithm from Unit 2.
   * @param {Array} posts
   * @param {string} algorithmKey - 'quick' | 'merge' | 'insertion' | 'selection' | 'bubble' | 'native'
   * @param {string} sortField - 'created_at' | 'title' | 'due_date'
   * @param {boolean} ascending
   * @returns {{ sorted: Array, comparisons: number, swaps: number, algorithmName: string }}
   */
  const sortPosts = (posts, algorithmKey = 'native', sortField = 'created_at', ascending = false) => {
    if (!posts || posts.length === 0) {
      return { sorted: [], comparisons: 0, swaps: 0, algorithmName: 'None' };
    }

    if (algorithmKey === 'native') {
      const copy = [...posts].sort((a, b) => {
        const valA = a[sortField] || '';
        const valB = b[sortField] || '';
        if (valA < valB) return ascending ? -1 : 1;
        if (valA > valB) return ascending ? 1 : -1;
        return 0;
      });
      return { sorted: copy, comparisons: posts.length, swaps: 0, algorithmName: 'JavaScript Array.sort()' };
    }

    const algoConfig = SORTING_ALGORITHMS[algorithmKey];
    if (!algoConfig) {
      return { sorted: posts, comparisons: 0, swaps: 0, algorithmName: 'Unknown' };
    }

    const compareFn = (a, b) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    };

    const result = algoConfig.fn([...posts], compareFn);
    return {
      sorted: result.sorted,
      comparisons: result.comparisons,
      swaps: result.swaps,
      algorithmName: algoConfig.name,
      complexity: algoConfig.timeAvg,
    };
  };

  /**
   * Build Doubly Linked List for post navigation (Unit 3).
   * @param {Array} posts
   * @param {string} currentId
   * @returns {{ prevPost: Object|null, nextPost: Object|null, index: number, total: number }}
   */
  const getPostNavigation = (posts, currentId) => {
    if (!posts || posts.length === 0 || !currentId) {
      return { prevPost: null, nextPost: null, index: -1, total: 0 };
    }

    const dll = new DoublyLinkedList();
    posts.forEach(p => dll.append(p));

    let current = dll.head;
    let idx = 0;
    let foundNode = null;

    while (current) {
      if (String(current.data.id) === String(currentId)) {
        foundNode = current;
        break;
      }
      current = current.next;
      idx++;
    }

    if (!foundNode) {
      return { prevPost: null, nextPost: null, index: -1, total: posts.length };
    }

    return {
      prevPost: foundNode.prev ? foundNode.prev.data : null,
      nextPost: foundNode.next ? foundNode.next.data : null,
      index: idx,
      total: posts.length,
    };
  };

  /**
   * Sort deadlines using Min-Heap Priority Queue (Unit 4).
   * @param {Array} deadlines
   * @returns {Array} Ordered by earliest due_date
   */
  const prioritizeDeadlines = (deadlines) => {
    if (!deadlines || deadlines.length === 0) return [];

    const heap = new MinHeap((a, b) => {
      const dateA = new Date(a.due_date).getTime();
      const dateB = new Date(b.due_date).getTime();
      return dateA - dateB;
    });

    deadlines.forEach(d => heap.insert(d));

    const result = [];
    while (!heap.isEmpty()) {
      result.push(heap.extractMin());
    }

    return result;
  };

  return {
    sortPosts,
    getPostNavigation,
    prioritizeDeadlines,
  };
}
