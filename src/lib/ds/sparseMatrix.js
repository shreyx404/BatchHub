/* ============================================================
   Unit 2 — Sparse Matrix (Triplet Representation)
   ============================================================
   Stores only non-zero elements as (row, col, value) triplets.
   Memory-efficient for matrices with mostly zero entries.
   ============================================================ */

/**
 * Sparse Matrix using Triplet (Coordinate) Representation.
 *
 * Instead of storing an m×n 2D array (m*n space), stores only
 * the non-zero elements as {row, col, value} objects.
 *
 * Space: O(k) where k = number of non-zero elements
 * (vs O(m*n) for a dense matrix)
 */
export class SparseMatrix {
  /**
   * @param {number} rows - Number of rows
   * @param {number} cols - Number of columns
   */
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    /** @type {{ row: number, col: number, value: number }[]} */
    this.triplets = [];
    /** @type {{ op: string, args: any, snapshot: any[] }[]} */
    this.history = [];
  }

  /**
   * Set a value in the matrix.
   * If value is 0, removes the entry (sparse — don't store zeros).
   * @param {number} row
   * @param {number} col
   * @param {number} value
   */
  set(row, col, value) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      throw new RangeError(`Index (${row}, ${col}) out of bounds for ${this.rows}×${this.cols} matrix`);
    }

    // Find existing triplet for this position
    const idx = this.triplets.findIndex(t => t.row === row && t.col === col);

    if (value === 0) {
      // Remove if exists
      if (idx !== -1) {
        this.triplets.splice(idx, 1);
      }
    } else if (idx !== -1) {
      // Update existing
      this.triplets[idx].value = value;
    } else {
      // Insert new triplet
      this.triplets.push({ row, col, value });
    }

    this.history.push({
      op: 'set',
      args: { row, col, value },
      snapshot: [...this.triplets.map(t => ({ ...t }))],
    });
  }

  /**
   * Get the value at (row, col). Returns 0 if not stored.
   * @param {number} row
   * @param {number} col
   * @returns {number}
   */
  get(row, col) {
    const triplet = this.triplets.find(t => t.row === row && t.col === col);
    return triplet ? triplet.value : 0;
  }

  /**
   * Get all triplets as an array of [row, col, value].
   * @returns {[number, number, number][]}
   */
  getTriplets() {
    return this.triplets.map(t => [t.row, t.col, t.value]);
  }

  /**
   * Number of non-zero elements.
   * @returns {number}
   */
  get nonZeroCount() {
    return this.triplets.length;
  }

  /**
   * Transpose the matrix (swap rows ↔ cols).
   * @returns {SparseMatrix}
   */
  transpose() {
    const result = new SparseMatrix(this.cols, this.rows);
    for (const { row, col, value } of this.triplets) {
      result.set(col, row, value);
    }
    return result;
  }

  /**
   * Add two sparse matrices of the same dimensions.
   * @param {SparseMatrix} other
   * @returns {SparseMatrix}
   */
  add(other) {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error('Matrix dimensions must match for addition');
    }

    const result = new SparseMatrix(this.rows, this.cols);

    // Copy all triplets from this matrix
    for (const { row, col, value } of this.triplets) {
      result.set(row, col, value);
    }

    // Add triplets from the other matrix
    for (const { row, col, value } of other.triplets) {
      const existing = result.get(row, col);
      result.set(row, col, existing + value);
    }

    return result;
  }

  /**
   * Convert to a full 2D array (for visualization).
   * @returns {number[][]}
   */
  toDisplayGrid() {
    const grid = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(0)
    );
    for (const { row, col, value } of this.triplets) {
      grid[row][col] = value;
    }
    return grid;
  }

  /**
   * Get summary statistics.
   */
  getStats() {
    const totalCells = this.rows * this.cols;
    return {
      dimensions: `${this.rows} × ${this.cols}`,
      totalCells,
      nonZero: this.nonZeroCount,
      zeroCells: totalCells - this.nonZeroCount,
      sparsity: ((totalCells - this.nonZeroCount) / totalCells * 100).toFixed(1) + '%',
      memorySaved: ((1 - (this.nonZeroCount * 3) / totalCells) * 100).toFixed(1) + '%',
    };
  }
}

/**
 * Create a SparseMatrix from a 2D array (for demo purposes).
 * @param {number[][]} grid
 * @returns {SparseMatrix}
 */
export function fromDenseArray(grid) {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const matrix = new SparseMatrix(rows, cols);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 0) {
        matrix.set(r, c, grid[r][c]);
      }
    }
  }

  return matrix;
}
