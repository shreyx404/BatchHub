/* ============================================================
   Unit 2 — Binary Search & Linear Search
   ============================================================
   Both algorithms with step recording for visualization.
   Binary search requires sorted input.
   ============================================================ */

/**
 * @typedef {Object} SearchStep
 * @property {number} low - Lower bound index
 * @property {number} high - Upper bound index
 * @property {number} mid - Middle index being checked
 * @property {string} comparison - 'equal' | 'less' | 'greater'
 * @property {string} description - Human-readable description
 */

/**
 * @typedef {Object} SearchResult
 * @property {boolean} found - Whether the target was found
 * @property {number} index - Index of the target (-1 if not found)
 * @property {SearchStep[]} steps - Step-by-step trace for visualization
 * @property {number} comparisons - Total comparisons made
 */

/**
 * Linear Search.
 * Sequentially checks each element until the target is found.
 *
 * Time:  Best O(1), Average O(n), Worst O(n)
 * Space: O(1)
 *
 * @param {any[]} arr - Array to search
 * @param {any} target - Target value
 * @param {Function} [keyFn] - Optional key extractor
 * @returns {SearchResult}
 */
export function linearSearch(arr, target, keyFn = (x) => x) {
  const steps = [];
  let comparisons = 0;

  for (let i = 0; i < arr.length; i++) {
    const value = keyFn(arr[i]);
    comparisons++;

    if (value === target) {
      steps.push({
        low: 0,
        high: arr.length - 1,
        mid: i,
        comparison: 'equal',
        description: `Check index ${i}: ${value} === ${target} ✓ FOUND!`,
      });
      return { found: true, index: i, steps, comparisons };
    }

    steps.push({
      low: 0,
      high: arr.length - 1,
      mid: i,
      comparison: value < target ? 'less' : 'greater',
      description: `Check index ${i}: ${value} ≠ ${target} — move to next`,
    });
  }

  return { found: false, index: -1, steps, comparisons };
}

/**
 * Binary Search (iterative).
 * Repeatedly divides the search interval in half.
 * Requires the input array to be sorted.
 *
 * Time:  Best O(1), Average O(log n), Worst O(log n)
 * Space: O(1)
 *
 * @param {any[]} arr - Sorted array to search
 * @param {any} target - Target value
 * @param {Function} [keyFn] - Optional key extractor
 * @returns {SearchResult}
 */
export function binarySearch(arr, target, keyFn = (x) => x) {
  const steps = [];
  let comparisons = 0;
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const value = keyFn(arr[mid]);
    comparisons++;

    if (value === target) {
      steps.push({
        low,
        high,
        mid,
        comparison: 'equal',
        description: `mid=${mid}: ${value} === ${target} ✓ FOUND!`,
      });
      return { found: true, index: mid, steps, comparisons };
    }

    if (value < target) {
      steps.push({
        low,
        high,
        mid,
        comparison: 'less',
        description: `mid=${mid}: ${value} < ${target} → search right half [${mid + 1}..${high}]`,
      });
      low = mid + 1;
    } else {
      steps.push({
        low,
        high,
        mid,
        comparison: 'greater',
        description: `mid=${mid}: ${value} > ${target} → search left half [${low}..${mid - 1}]`,
      });
      high = mid - 1;
    }
  }

  steps.push({
    low,
    high,
    mid: -1,
    comparison: 'equal',
    description: `low (${low}) > high (${high}) — target ${target} NOT FOUND`,
  });

  return { found: false, index: -1, steps, comparisons };
}
