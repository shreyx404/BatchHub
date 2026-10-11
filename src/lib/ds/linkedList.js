/* ============================================================
   Unit 3 — Linked Lists
   ============================================================
   Singly Linked List, Doubly Linked List, Circular Linked List
   All with operation history for step-by-step visualization.
   ============================================================ */

/* ── Node Classes ── */

class SLLNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class DLLNode {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

/* ── Singly Linked List ── */
/**
 * Singly Linked List.
 * Each node points to the next node. Traversal is forward-only.
 *
 * Insert at head: O(1)
 * Insert at tail: O(n) — must traverse to end
 * Delete at head: O(1)
 * Search:         O(n)
 * Space:          O(n)
 */
export class SinglyLinkedList {
  constructor() {
    this.head = null;
    this._size = 0;
    /** @type {{ op: string, args: any, snapshot: any[] }[]} */
    this.history = [];
  }

  get size() {
    return this._size;
  }

  /**
   * Add a node at the beginning.
   * @param {any} data
   */
  prepend(data) {
    const node = new SLLNode(data);
    node.next = this.head;
    this.head = node;
    this._size++;
    this._recordHistory('prepend', { data });
  }

  /**
   * Add a node at the end.
   * @param {any} data
   */
  append(data) {
    const node = new SLLNode(data);
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }
    this._size++;
    this._recordHistory('append', { data });
  }

  /**
   * Insert at a specific index (0-based).
   * @param {number} index
   * @param {any} data
   */
  insertAt(index, data) {
    if (index < 0 || index > this._size) {
      throw new RangeError(`Index ${index} out of bounds [0..${this._size}]`);
    }
    if (index === 0) return this.prepend(data);

    const node = new SLLNode(data);
    let current = this.head;
    for (let i = 0; i < index - 1; i++) {
      current = current.next;
    }
    node.next = current.next;
    current.next = node;
    this._size++;
    this._recordHistory('insertAt', { index, data });
  }

  /**
   * Delete node at a specific index.
   * @param {number} index
   * @returns {any} The deleted data
   */
  deleteAt(index) {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0..${this._size - 1}]`);
    }

    let deleted;
    if (index === 0) {
      deleted = this.head.data;
      this.head = this.head.next;
    } else {
      let current = this.head;
      for (let i = 0; i < index - 1; i++) {
        current = current.next;
      }
      deleted = current.next.data;
      current.next = current.next.next;
    }
    this._size--;
    this._recordHistory('deleteAt', { index, deleted });
    return deleted;
  }

  /**
   * Find the index of a value.
   * @param {any} data
   * @returns {{ found: boolean, index: number, steps: number }}
   */
  find(data) {
    let current = this.head;
    let index = 0;
    let steps = 0;
    while (current) {
      steps++;
      if (current.data === data) {
        return { found: true, index, steps };
      }
      current = current.next;
      index++;
    }
    return { found: false, index: -1, steps };
  }

  /**
   * Convert to array.
   * @returns {any[]}
   */
  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  /**
   * Traverse the list, calling fn for each node.
   * Returns array of step snapshots for visualization.
   * @param {Function} [fn]
   * @returns {{ data: any, index: number }[]}
   */
  traverse(fn) {
    const visited = [];
    let current = this.head;
    let index = 0;
    while (current) {
      visited.push({ data: current.data, index });
      if (fn) fn(current.data, index);
      current = current.next;
      index++;
    }
    return visited;
  }

  _recordHistory(op, args) {
    this.history.push({ op, args, snapshot: this.toArray() });
  }
}


/* ── Doubly Linked List ── */
/**
 * Doubly Linked List.
 * Each node has both prev and next pointers.
 * Supports bidirectional traversal.
 *
 * Insert at head/tail: O(1)
 * Delete at head/tail: O(1)
 * Search:              O(n)
 * Space:               O(n) — extra prev pointer per node
 */
export class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this._current = null; // For navigation
    this._size = 0;
    this.history = [];
  }

  get size() {
    return this._size;
  }

  get current() {
    return this._current ? this._current.data : null;
  }

  /**
   * Add a node at the beginning.
   */
  prepend(data) {
    const node = new DLLNode(data);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    if (!this._current) this._current = node;
    this._size++;
    this._recordHistory('prepend', { data });
  }

  /**
   * Add a node at the end.
   */
  append(data) {
    const node = new DLLNode(data);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    if (!this._current) this._current = node;
    this._size++;
    this._recordHistory('append', { data });
  }

  /**
   * Insert at a specific index.
   */
  insertAt(index, data) {
    if (index < 0 || index > this._size) {
      throw new RangeError(`Index ${index} out of bounds [0..${this._size}]`);
    }
    if (index === 0) return this.prepend(data);
    if (index === this._size) return this.append(data);

    const node = new DLLNode(data);
    let current = this.head;
    for (let i = 0; i < index; i++) {
      current = current.next;
    }
    node.prev = current.prev;
    node.next = current;
    current.prev.next = node;
    current.prev = node;
    this._size++;
    this._recordHistory('insertAt', { index, data });
  }

  /**
   * Delete node at a specific index.
   */
  deleteAt(index) {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0..${this._size - 1}]`);
    }

    let deleted;
    if (this._size === 1) {
      deleted = this.head.data;
      this.head = this.tail = this._current = null;
    } else if (index === 0) {
      deleted = this.head.data;
      this.head = this.head.next;
      this.head.prev = null;
      if (this._current && this._current.data === deleted) {
        this._current = this.head;
      }
    } else if (index === this._size - 1) {
      deleted = this.tail.data;
      this.tail = this.tail.prev;
      this.tail.next = null;
      if (this._current && this._current.data === deleted) {
        this._current = this.tail;
      }
    } else {
      let current = this.head;
      for (let i = 0; i < index; i++) {
        current = current.next;
      }
      deleted = current.data;
      current.prev.next = current.next;
      current.next.prev = current.prev;
      if (this._current === current) {
        this._current = current.next;
      }
    }
    this._size--;
    this._recordHistory('deleteAt', { index, deleted });
    return deleted;
  }

  /**
   * Move internal cursor to a specific data value.
   */
  goTo(data) {
    let current = this.head;
    while (current) {
      if (current.data === data) {
        this._current = current;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  /**
   * Move cursor to next node.
   * @returns {any|null} Data of the next node, or null if at end
   */
  next() {
    if (this._current && this._current.next) {
      this._current = this._current.next;
      return this._current.data;
    }
    return null;
  }

  /**
   * Move cursor to previous node.
   * @returns {any|null} Data of the previous node, or null if at start
   */
  prev() {
    if (this._current && this._current.prev) {
      this._current = this._current.prev;
      return this._current.data;
    }
    return null;
  }

  /**
   * Check if there's a next node.
   */
  hasNext() {
    return this._current && this._current.next !== null;
  }

  /**
   * Check if there's a previous node.
   */
  hasPrev() {
    return this._current && this._current.prev !== null;
  }

  /**
   * Search for a value.
   */
  find(data) {
    let current = this.head;
    let index = 0;
    let steps = 0;
    while (current) {
      steps++;
      if (current.data === data) {
        return { found: true, index, steps };
      }
      current = current.next;
      index++;
    }
    return { found: false, index: -1, steps };
  }

  /**
   * Convert to array.
   */
  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  /**
   * Traverse in reverse.
   */
  toArrayReverse() {
    const result = [];
    let current = this.tail;
    while (current) {
      result.push(current.data);
      current = current.prev;
    }
    return result;
  }

  _recordHistory(op, args) {
    this.history.push({ op, args, snapshot: this.toArray() });
  }
}


/* ── Circular Linked List ── */
/**
 * Circular Linked List.
 * The last node points back to the first node, forming a cycle.
 * Useful for round-robin scheduling and cyclic traversal.
 *
 * Insert: O(1) — at head (after tail.next redirect)
 * Delete: O(n) — must find the node
 * Traverse: O(n)
 */
export class CircularLinkedList {
  constructor() {
    this.head = null;
    this._current = null;
    this._size = 0;
    this.history = [];
  }

  get size() {
    return this._size;
  }

  get current() {
    return this._current ? this._current.data : null;
  }

  /**
   * Add a node to the circular list.
   */
  append(data) {
    const node = new SLLNode(data);

    if (!this.head) {
      this.head = node;
      node.next = node; // Points to itself
    } else {
      // Find the last node (the one pointing to head)
      let tail = this.head;
      while (tail.next !== this.head) {
        tail = tail.next;
      }
      tail.next = node;
      node.next = this.head;
    }

    if (!this._current) this._current = this.head;
    this._size++;
    this._recordHistory('append', { data });
  }

  /**
   * Delete the first occurrence of data.
   */
  delete(data) {
    if (!this.head) return null;

    // Special case: only one node
    if (this._size === 1 && this.head.data === data) {
      const deleted = this.head.data;
      this.head = this._current = null;
      this._size = 0;
      this._recordHistory('delete', { data: deleted });
      return deleted;
    }

    // Find the node to delete and its previous node
    let prev = null;
    let current = this.head;
    let found = false;

    do {
      if (current.data === data) {
        found = true;
        break;
      }
      prev = current;
      current = current.next;
    } while (current !== this.head);

    if (!found) return null;

    if (current === this.head) {
      // Deleting head — find tail first
      let tail = this.head;
      while (tail.next !== this.head) {
        tail = tail.next;
      }
      this.head = this.head.next;
      tail.next = this.head;
    } else {
      prev.next = current.next;
    }

    if (this._current === current) {
      this._current = current.next === current ? null : current.next;
    }

    this._size--;
    this._recordHistory('delete', { data });
    return data;
  }

  /**
   * Rotate to the next element (circular traversal).
   * @returns {any} Data of the next element
   */
  rotate() {
    if (this._current) {
      this._current = this._current.next;
      return this._current.data;
    }
    return null;
  }

  /**
   * Search for a value in the circular list.
   */
  find(data) {
    if (!this.head) return { found: false, index: -1, steps: 0 };

    let current = this.head;
    let index = 0;
    let steps = 0;

    do {
      steps++;
      if (current.data === data) {
        return { found: true, index, steps };
      }
      current = current.next;
      index++;
    } while (current !== this.head);

    return { found: false, index: -1, steps };
  }

  /**
   * Convert to array (one full cycle).
   */
  toArray() {
    if (!this.head) return [];

    const result = [];
    let current = this.head;
    do {
      result.push(current.data);
      current = current.next;
    } while (current !== this.head);

    return result;
  }

  _recordHistory(op, args) {
    this.history.push({ op, args, snapshot: this.toArray() });
  }
}
