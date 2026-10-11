/* ============================================================
   Unit 5 — Binary Search Tree (BST)
   ============================================================
   BST with insert, search, delete, all four traversals
   (in-order, pre-order, post-order, level-order),
   range queries, and operation history for visualization.
   ============================================================ */

/**
 * BST Node.
 */
class BSTNode {
  constructor(value, data = null) {
    this.value = value;
    this.data = data; // Optional payload (e.g., a post object)
    this.left = null;
    this.right = null;
  }
}

/**
 * Binary Search Tree.
 *
 * Property: For every node N,
 *   all values in N.left  < N.value
 *   all values in N.right > N.value
 *
 * Balanced case:
 *   Insert: O(log n), Search: O(log n), Delete: O(log n)
 *
 * Worst case (skewed tree):
 *   Insert: O(n), Search: O(n), Delete: O(n)
 *
 * Space: O(n)
 */
export class BST {
  constructor() {
    this.root = null;
    this._size = 0;
    /** @type {{ op: string, args: any, path: number[], snapshot: any }[]} */
    this.history = [];
  }

  get size() {
    return this._size;
  }

  /**
   * Insert a value into the BST.
   * @param {number} value
   * @param {any} [data] - Optional associated data
   */
  insert(value, data = null) {
    const path = [];
    this.root = this._insertNode(this.root, value, data, path);
    this._size++;
    this.history.push({
      op: 'insert',
      args: { value },
      path,
      snapshot: this.toJSON(),
    });
  }

  _insertNode(node, value, data, path) {
    if (!node) {
      return new BSTNode(value, data);
    }

    path.push(node.value);

    if (value < node.value) {
      node.left = this._insertNode(node.left, value, data, path);
    } else if (value > node.value) {
      node.right = this._insertNode(node.right, value, data, path);
    } else {
      // Duplicate value — update data
      node.data = data;
      this._size--; // Compensate for the increment in insert()
    }

    return node;
  }

  /**
   * Search for a value in the BST.
   * @param {number} value
   * @returns {{ found: boolean, node: BSTNode|null, path: number[], comparisons: number }}
   */
  search(value) {
    const path = [];
    let comparisons = 0;
    let current = this.root;

    while (current) {
      comparisons++;
      path.push(current.value);

      if (value === current.value) {
        this.history.push({
          op: 'search',
          args: { value, found: true },
          path,
          snapshot: this.toJSON(),
        });
        return { found: true, node: current, path, comparisons };
      }

      if (value < current.value) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    this.history.push({
      op: 'search',
      args: { value, found: false },
      path,
      snapshot: this.toJSON(),
    });
    return { found: false, node: null, path, comparisons };
  }

  /**
   * Delete a value from the BST.
   * @param {number} value
   * @returns {boolean} Whether the value was found and deleted
   */
  delete(value) {
    const initialSize = this._size;
    this.root = this._deleteNode(this.root, value);

    const deleted = this._size < initialSize;
    this.history.push({
      op: 'delete',
      args: { value, deleted },
      path: [],
      snapshot: this.toJSON(),
    });
    return deleted;
  }

  _deleteNode(node, value) {
    if (!node) return null;

    if (value < node.value) {
      node.left = this._deleteNode(node.left, value);
    } else if (value > node.value) {
      node.right = this._deleteNode(node.right, value);
    } else {
      // Found the node to delete
      this._size--;

      // Case 1: Leaf node
      if (!node.left && !node.right) {
        return null;
      }

      // Case 2: One child
      if (!node.left) return node.right;
      if (!node.right) return node.left;

      // Case 3: Two children — replace with inorder successor (smallest in right subtree)
      let successor = node.right;
      while (successor.left) {
        successor = successor.left;
      }
      node.value = successor.value;
      node.data = successor.data;
      node.right = this._deleteNode(node.right, successor.value);
    }

    return node;
  }

  /* ── Traversals ── */

  /**
   * In-order traversal (Left → Root → Right).
   * Produces values in sorted (ascending) order.
   * @returns {{ values: any[], steps: { value: number, action: string }[] }}
   */
  inOrder() {
    const values = [];
    const steps = [];
    this._inOrder(this.root, values, steps);
    return { values, steps };
  }

  _inOrder(node, values, steps) {
    if (!node) return;
    steps.push({ value: node.value, action: 'go-left' });
    this._inOrder(node.left, values, steps);
    values.push(node.data !== null ? { value: node.value, data: node.data } : node.value);
    steps.push({ value: node.value, action: 'visit' });
    this._inOrder(node.right, values, steps);
    steps.push({ value: node.value, action: 'go-right' });
  }

  /**
   * Pre-order traversal (Root → Left → Right).
   * @returns {{ values: any[], steps: { value: number, action: string }[] }}
   */
  preOrder() {
    const values = [];
    const steps = [];
    this._preOrder(this.root, values, steps);
    return { values, steps };
  }

  _preOrder(node, values, steps) {
    if (!node) return;
    values.push(node.data !== null ? { value: node.value, data: node.data } : node.value);
    steps.push({ value: node.value, action: 'visit' });
    this._preOrder(node.left, values, steps);
    this._preOrder(node.right, values, steps);
  }

  /**
   * Post-order traversal (Left → Right → Root).
   * @returns {{ values: any[], steps: { value: number, action: string }[] }}
   */
  postOrder() {
    const values = [];
    const steps = [];
    this._postOrder(this.root, values, steps);
    return { values, steps };
  }

  _postOrder(node, values, steps) {
    if (!node) return;
    this._postOrder(node.left, values, steps);
    this._postOrder(node.right, values, steps);
    values.push(node.data !== null ? { value: node.value, data: node.data } : node.value);
    steps.push({ value: node.value, action: 'visit' });
  }

  /**
   * Level-order traversal (Breadth-first).
   * Uses a queue — visits nodes level by level.
   * @returns {{ values: any[], steps: { value: number, level: number }[] }}
   */
  levelOrder() {
    const values = [];
    const steps = [];
    if (!this.root) return { values, steps };

    const queue = [{ node: this.root, level: 0 }];

    while (queue.length > 0) {
      const { node, level } = queue.shift();
      values.push(node.data !== null ? { value: node.value, data: node.data } : node.value);
      steps.push({ value: node.value, level });

      if (node.left) queue.push({ node: node.left, level: level + 1 });
      if (node.right) queue.push({ node: node.right, level: level + 1 });
    }

    return { values, steps };
  }

  /* ── Utility Methods ── */

  /**
   * Find the minimum value in the BST.
   */
  min() {
    if (!this.root) return undefined;
    let current = this.root;
    while (current.left) current = current.left;
    return current.value;
  }

  /**
   * Find the maximum value in the BST.
   */
  max() {
    if (!this.root) return undefined;
    let current = this.root;
    while (current.right) current = current.right;
    return current.value;
  }

  /**
   * Range query — find all values in [low, high].
   * Exploits BST property to prune branches.
   * Time: O(h + k) where h = height, k = number of results
   * @param {number} low
   * @param {number} high
   * @returns {any[]}
   */
  rangeQuery(low, high) {
    const results = [];
    this._rangeQuery(this.root, low, high, results);
    return results;
  }

  _rangeQuery(node, low, high, results) {
    if (!node) return;

    // If node.value > low, there might be valid values in the left subtree
    if (node.value > low) {
      this._rangeQuery(node.left, low, high, results);
    }

    // If node.value is within range, include it
    if (node.value >= low && node.value <= high) {
      results.push(node.data !== null ? { value: node.value, data: node.data } : node.value);
    }

    // If node.value < high, there might be valid values in the right subtree
    if (node.value < high) {
      this._rangeQuery(node.right, low, high, results);
    }
  }

  /**
   * Get the height of the tree.
   * @returns {number}
   */
  height() {
    return this._height(this.root);
  }

  _height(node) {
    if (!node) return -1;
    return 1 + Math.max(this._height(node.left), this._height(node.right));
  }

  /**
   * Convert the tree to a JSON structure for rendering.
   * @returns {Object|null}
   */
  toJSON() {
    return this._nodeToJSON(this.root);
  }

  _nodeToJSON(node) {
    if (!node) return null;
    return {
      value: node.value,
      data: node.data,
      left: this._nodeToJSON(node.left),
      right: this._nodeToJSON(node.right),
    };
  }

  /**
   * Build a BST from a sorted array (creates a balanced BST).
   * Time: O(n)
   * @param {{ value: number, data?: any }[]} sortedItems
   * @returns {BST}
   */
  static fromSortedArray(sortedItems) {
    const bst = new BST();

    function buildBalanced(items, start, end) {
      if (start > end) return null;

      const mid = Math.floor((start + end) / 2);
      const item = items[mid];
      const node = new BSTNode(
        typeof item === 'object' ? item.value : item,
        typeof item === 'object' ? item.data : null
      );

      node.left = buildBalanced(items, start, mid - 1);
      node.right = buildBalanced(items, mid + 1, end);

      return node;
    }

    bst.root = buildBalanced(sortedItems, 0, sortedItems.length - 1);
    bst._size = sortedItems.length;
    return bst;
  }
}
