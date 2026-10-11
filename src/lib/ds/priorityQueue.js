/* ============================================================
   Unit 4 — Priority Queue (Min-Heap)
   ============================================================
   Array-based binary min-heap implementation.
   Always serves the minimum element first.
   
   Insert:     O(log n) — bubble up
   ExtractMin: O(log n) — bubble down
   Peek:       O(1)
   Space:      O(n)
   ============================================================ */

/**
 * Min-Heap based Priority Queue.
 *
 * Internally stores elements as an array-based complete binary tree.
 * Parent of index i → Math.floor((i - 1) / 2)
 * Left child of i  → 2i + 1
 * Right child of i → 2i + 2
 *
 * @template T
 */
export class MinHeap {
  /**
   * @param {Function} [compareFn] - Comparator function. Should return negative
   *   if a < b, zero if equal, positive if a > b. Defaults to numeric comparison.
   */
  constructor(compareFn) {
    this._heap = [];
    this._compare = compareFn || ((a, b) => a - b);
    /** @type {{ op: string, args: any, snapshot: any[], swaps?: [number, number][] }[]} */
    this.history = [];
  }

  /**
   * Insert a new element into the heap.
   * Adds to the end and bubbles up to maintain the min-heap property.
   * Time: O(log n)
   * @param {T} item
   */
  insert(item) {
    this._heap.push(item);
    const swaps = this._bubbleUp(this._heap.length - 1);
    this.history.push({
      op: 'insert',
      args: { item },
      snapshot: [...this._heap],
      swaps,
    });
  }

  /**
   * Remove and return the minimum element (root).
   * Replaces root with last element and bubbles down.
   * Time: O(log n)
   * @returns {T}
   */
  extractMin() {
    if (this.isEmpty()) {
      throw new Error('Heap underflow: cannot extract from empty heap');
    }

    const min = this._heap[0];

    if (this._heap.length === 1) {
      this._heap.pop();
    } else {
      // Move last element to root and bubble down
      this._heap[0] = this._heap.pop();
      const swaps = this._bubbleDown(0);
      this.history.push({
        op: 'extractMin',
        args: { item: min },
        snapshot: [...this._heap],
        swaps,
      });
    }

    return min;
  }

  /**
   * Peek at the minimum element without removing it.
   * Time: O(1)
   * @returns {T}
   */
  peek() {
    if (this.isEmpty()) return undefined;
    return this._heap[0];
  }

  isEmpty() {
    return this._heap.length === 0;
  }

  get size() {
    return this._heap.length;
  }

  toArray() {
    return [...this._heap];
  }

  /**
   * Get the heap as a tree structure for visualization.
   * Returns { value, left, right } nodes.
   */
  toTree() {
    if (this.isEmpty()) return null;
    return this._buildTreeNode(0);
  }

  _buildTreeNode(index) {
    if (index >= this._heap.length) return null;

    return {
      value: this._heap[index],
      index,
      left: this._buildTreeNode(2 * index + 1),
      right: this._buildTreeNode(2 * index + 2),
    };
  }

  /**
   * Bubble up: move the element at index up until heap property is restored.
   * @param {number} index
   * @returns {[number, number][]} Array of [childIdx, parentIdx] swaps made
   */
  _bubbleUp(index) {
    const swaps = [];

    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);

      if (this._compare(this._heap[index], this._heap[parentIdx]) < 0) {
        // Child is smaller than parent — swap
        [this._heap[index], this._heap[parentIdx]] =
          [this._heap[parentIdx], this._heap[index]];
        swaps.push([index, parentIdx]);
        index = parentIdx;
      } else {
        break; // Heap property satisfied
      }
    }

    return swaps;
  }

  /**
   * Bubble down: move the element at index down until heap property is restored.
   * @param {number} index
   * @returns {[number, number][]} Array of [parentIdx, childIdx] swaps made
   */
  _bubbleDown(index) {
    const swaps = [];
    const length = this._heap.length;

    while (true) {
      let smallest = index;
      const leftIdx = 2 * index + 1;
      const rightIdx = 2 * index + 2;

      if (leftIdx < length && this._compare(this._heap[leftIdx], this._heap[smallest]) < 0) {
        smallest = leftIdx;
      }
      if (rightIdx < length && this._compare(this._heap[rightIdx], this._heap[smallest]) < 0) {
        smallest = rightIdx;
      }

      if (smallest !== index) {
        [this._heap[index], this._heap[smallest]] =
          [this._heap[smallest], this._heap[index]];
        swaps.push([index, smallest]);
        index = smallest;
      } else {
        break; // Heap property satisfied
      }
    }

    return swaps;
  }

  /**
   * Build a heap from an unsorted array (heapify).
   * Time: O(n)
   * @param {T[]} arr
   */
  static fromArray(arr, compareFn) {
    const heap = new MinHeap(compareFn);
    heap._heap = [...arr];

    // Start from last non-leaf node and bubble down each
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
      heap._bubbleDown(i);
    }

    heap.history.push({
      op: 'heapify',
      args: { input: arr },
      snapshot: [...heap._heap],
    });

    return heap;
  }
}
