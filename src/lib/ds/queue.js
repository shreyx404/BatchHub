/* ============================================================
   Unit 4 — Queue, Circular Queue, Deque
   ============================================================
   Queue (FIFO), Circular Queue (fixed-size ring buffer),
   and Deque (double-ended queue).
   ============================================================ */

/**
 * Queue (FIFO — First In, First Out).
 * Array-based implementation.
 *
 * Enqueue: O(1) amortized
 * Dequeue: O(1) — uses front pointer (avoids shift)
 * Front:   O(1)
 * Space:   O(n)
 */
export class Queue {
  constructor() {
    this._items = [];
    this._front = 0;
    this.history = [];
  }

  /**
   * Add an element to the back of the queue.
   * @param {any} item
   */
  enqueue(item) {
    this._items.push(item);
    this.history.push({ op: 'enqueue', args: { item }, snapshot: this.toArray() });
  }

  /**
   * Remove and return the front element.
   * @returns {any}
   */
  dequeue() {
    if (this.isEmpty()) {
      throw new Error('Queue underflow: cannot dequeue from empty queue');
    }
    const item = this._items[this._front];
    this._front++;

    // Compact the array when too much wasted space
    if (this._front > this._items.length / 2) {
      this._items = this._items.slice(this._front);
      this._front = 0;
    }

    this.history.push({ op: 'dequeue', args: { item }, snapshot: this.toArray() });
    return item;
  }

  /**
   * Peek at the front element without removing it.
   * @returns {any}
   */
  front() {
    if (this.isEmpty()) return undefined;
    return this._items[this._front];
  }

  /**
   * Peek at the rear element.
   * @returns {any}
   */
  rear() {
    if (this.isEmpty()) return undefined;
    return this._items[this._items.length - 1];
  }

  isEmpty() {
    return this._front >= this._items.length;
  }

  get size() {
    return this._items.length - this._front;
  }

  toArray() {
    return this._items.slice(this._front);
  }

  clear() {
    this._items = [];
    this._front = 0;
    this.history = [];
  }
}


/**
 * Circular Queue (Ring Buffer).
 * Fixed-size queue that wraps around using modular arithmetic.
 * Avoids the need to shift elements on dequeue.
 *
 * Enqueue: O(1)
 * Dequeue: O(1)
 * Space:   O(capacity)
 */
export class CircularQueue {
  /**
   * @param {number} capacity - Maximum number of elements
   */
  constructor(capacity) {
    this.capacity = capacity;
    this._items = new Array(capacity).fill(null);
    this._front = 0;
    this._rear = -1;
    this._size = 0;
    this.history = [];
  }

  /**
   * Add an element. Throws if full.
   * @param {any} item
   */
  enqueue(item) {
    if (this.isFull()) {
      throw new Error('Circular queue overflow: queue is full');
    }
    this._rear = (this._rear + 1) % this.capacity;
    this._items[this._rear] = item;
    this._size++;
    this.history.push({
      op: 'enqueue',
      args: { item, rear: this._rear },
      snapshot: this._getState(),
    });
  }

  /**
   * Remove and return the front element.
   * @returns {any}
   */
  dequeue() {
    if (this.isEmpty()) {
      throw new Error('Circular queue underflow: queue is empty');
    }
    const item = this._items[this._front];
    this._items[this._front] = null;
    this._front = (this._front + 1) % this.capacity;
    this._size--;
    this.history.push({
      op: 'dequeue',
      args: { item, front: this._front },
      snapshot: this._getState(),
    });
    return item;
  }

  /**
   * Peek at the front element.
   */
  front() {
    if (this.isEmpty()) return undefined;
    return this._items[this._front];
  }

  /**
   * Peek at the rear element.
   */
  rear() {
    if (this.isEmpty()) return undefined;
    return this._items[this._rear];
  }

  isFull() {
    return this._size === this.capacity;
  }

  isEmpty() {
    return this._size === 0;
  }

  get size() {
    return this._size;
  }

  /**
   * Get full internal state for visualization (shows the ring buffer).
   */
  _getState() {
    return {
      items: [...this._items],
      front: this._front,
      rear: this._rear,
      size: this._size,
    };
  }

  /**
   * Get logical queue contents (front to rear order).
   */
  toArray() {
    const result = [];
    if (this._size === 0) return result;
    let i = this._front;
    for (let count = 0; count < this._size; count++) {
      result.push(this._items[i]);
      i = (i + 1) % this.capacity;
    }
    return result;
  }
}


/**
 * Deque (Double-Ended Queue).
 * Supports insertion and deletion at both ends.
 *
 * pushFront / pushBack: O(1) amortized
 * popFront / popBack:   O(1) amortized
 * Space: O(n)
 */
export class Deque {
  constructor() {
    this._items = [];
    this.history = [];
  }

  /**
   * Add an element to the front.
   */
  pushFront(item) {
    this._items.unshift(item);
    this.history.push({ op: 'pushFront', args: { item }, snapshot: [...this._items] });
  }

  /**
   * Add an element to the back.
   */
  pushBack(item) {
    this._items.push(item);
    this.history.push({ op: 'pushBack', args: { item }, snapshot: [...this._items] });
  }

  /**
   * Remove and return the front element.
   */
  popFront() {
    if (this.isEmpty()) {
      throw new Error('Deque underflow: cannot pop from empty deque');
    }
    const item = this._items.shift();
    this.history.push({ op: 'popFront', args: { item }, snapshot: [...this._items] });
    return item;
  }

  /**
   * Remove and return the back element.
   */
  popBack() {
    if (this.isEmpty()) {
      throw new Error('Deque underflow: cannot pop from empty deque');
    }
    const item = this._items.pop();
    this.history.push({ op: 'popBack', args: { item }, snapshot: [...this._items] });
    return item;
  }

  peekFront() {
    return this._items[0];
  }

  peekBack() {
    return this._items[this._items.length - 1];
  }

  isEmpty() {
    return this._items.length === 0;
  }

  get size() {
    return this._items.length;
  }

  toArray() {
    return [...this._items];
  }
}
