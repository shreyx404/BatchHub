/* ============================================================
   Unit 2 — Sorting Algorithms
   ============================================================
   Bubble Sort, Selection Sort, Insertion Sort, Merge Sort,
   Quick Sort — all with step recording for visualization.
   ============================================================ */

/**
 * @typedef {Object} SortStep
 * @property {number[]} array - Snapshot of the array at this step
 * @property {number[]} comparing - Indices being compared
 * @property {number[]|null} swapping - Indices being swapped (null if no swap)
 * @property {string} description - Human-readable description of the step
 */

/**
 * @typedef {Object} SortResult
 * @property {number[]} sorted - The sorted array
 * @property {SortStep[]} steps - Array of step snapshots for visualization
 * @property {number} comparisons - Total comparisons made
 * @property {number} swaps - Total swaps made
 */

/**
 * Default numeric comparator.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function defaultCompare(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/* ── Bubble Sort ── */
/**
 * Bubble Sort with early termination optimization.
 * Repeatedly steps through the list, compares adjacent elements,
 * and swaps them if they are in the wrong order.
 *
 * Time:  Best O(n), Average O(n²), Worst O(n²)
 * Space: O(1)
 * Stable: Yes
 *
 * @param {number[]} inputArr
 * @param {Function} [compareFn]
 * @returns {SortResult}
 */
export function bubbleSort(inputArr, compareFn = defaultCompare) {
  const arr = [...inputArr];
  const n = arr.length;
  const steps = [];
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: null,
    description: 'Initial array',
  });

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapping: null,
        description: `Pass ${i + 1}: Compare arr[${j}]=${arr[j]} with arr[${j + 1}]=${arr[j + 1]}`,
      });

      if (compareFn(arr[j], arr[j + 1]) > 0) {
        // Swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        swapped = true;

        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [j, j + 1],
          description: `Swap arr[${j}] ↔ arr[${j + 1}]`,
        });
      }
    }

    // Early termination: if no swaps occurred, array is sorted
    if (!swapped) {
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: null,
        description: `Pass ${i + 1}: No swaps — array is sorted (early termination)`,
      });
      break;
    }
  }

  return { sorted: arr, steps, comparisons, swaps };
}

/* ── Selection Sort ── */
/**
 * Selection Sort.
 * Finds the minimum element from the unsorted part and places it
 * at the beginning of the unsorted part.
 *
 * Time:  O(n²) for all cases
 * Space: O(1)
 * Stable: No
 *
 * @param {number[]} inputArr
 * @param {Function} [compareFn]
 * @returns {SortResult}
 */
export function selectionSort(inputArr, compareFn = defaultCompare) {
  const arr = [...inputArr];
  const n = arr.length;
  const steps = [];
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: null,
    description: 'Initial array',
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      steps.push({
        array: [...arr],
        comparing: [minIdx, j],
        swapping: null,
        description: `Pass ${i + 1}: Compare min candidate arr[${minIdx}]=${arr[minIdx]} with arr[${j}]=${arr[j]}`,
      });

      if (compareFn(arr[j], arr[minIdx]) < 0) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      swaps++;

      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [i, minIdx],
        description: `Place minimum: Swap arr[${i}] ↔ arr[${minIdx}]`,
      });
    }
  }

  return { sorted: arr, steps, comparisons, swaps };
}

/* ── Insertion Sort ── */
/**
 * Insertion Sort.
 * Builds the sorted array one element at a time by inserting each
 * element into its correct position within the sorted portion.
 *
 * Time:  Best O(n), Average O(n²), Worst O(n²)
 * Space: O(1)
 * Stable: Yes
 *
 * @param {number[]} inputArr
 * @param {Function} [compareFn]
 * @returns {SortResult}
 */
export function insertionSort(inputArr, compareFn = defaultCompare) {
  const arr = [...inputArr];
  const n = arr.length;
  const steps = [];
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: null,
    description: 'Initial array',
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: null,
      description: `Pick key = arr[${i}] = ${key}; insert into sorted portion [0..${i - 1}]`,
    });

    while (j >= 0 && compareFn(arr[j], key) > 0) {
      comparisons++;
      arr[j + 1] = arr[j];
      swaps++;

      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapping: [j, j + 1],
        description: `Shift arr[${j}]=${arr[j]} → arr[${j + 1}]`,
      });

      j--;
    }

    if (j >= 0) comparisons++; // The final failed comparison

    arr[j + 1] = key;

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: null,
      description: `Insert key ${key} at position ${j + 1}`,
    });
  }

  return { sorted: arr, steps, comparisons, swaps };
}

/* ── Merge Sort ── */
/**
 * Merge Sort (recursive, top-down).
 * Divides the array in half, recursively sorts each half, then
 * merges the two sorted halves.
 *
 * Time:  O(n log n) for all cases
 * Space: O(n)
 * Stable: Yes
 *
 * @param {number[]} inputArr
 * @param {Function} [compareFn]
 * @returns {SortResult}
 */
export function mergeSort(inputArr, compareFn = defaultCompare) {
  const arr = [...inputArr];
  const steps = [];
  let comparisons = 0;
  let swaps = 0; // In merge sort, we count merge writes as "swaps"

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: null,
    description: 'Initial array',
  });

  function mergeSortHelper(arr, left, right) {
    if (left >= right) return;

    const mid = Math.floor((left + right) / 2);

    steps.push({
      array: [...arr],
      comparing: [left, mid, right],
      swapping: null,
      description: `Divide: [${left}..${right}] → [${left}..${mid}] + [${mid + 1}..${right}]`,
    });

    mergeSortHelper(arr, left, mid);
    mergeSortHelper(arr, mid + 1, right);
    merge(arr, left, mid, right);
  }

  function merge(arr, left, mid, right) {
    const leftPart = arr.slice(left, mid + 1);
    const rightPart = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < leftPart.length && j < rightPart.length) {
      comparisons++;
      if (compareFn(leftPart[i], rightPart[j]) <= 0) {
        arr[k] = leftPart[i];
        i++;
      } else {
        arr[k] = rightPart[j];
        j++;
      }
      swaps++;
      k++;
    }

    while (i < leftPart.length) {
      arr[k] = leftPart[i];
      i++;
      k++;
      swaps++;
    }

    while (j < rightPart.length) {
      arr[k] = rightPart[j];
      j++;
      k++;
      swaps++;
    }

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: null,
      description: `Merge [${left}..${mid}] + [${mid + 1}..${right}] → [${arr.slice(left, right + 1).join(', ')}]`,
    });
  }

  mergeSortHelper(arr, 0, arr.length - 1);

  return { sorted: arr, steps, comparisons, swaps };
}

/* ── Quick Sort ── */
/**
 * Quick Sort (recursive, Lomuto partition scheme).
 * Picks a pivot (last element), partitions the array around it,
 * then recursively sorts the partitions.
 *
 * Time:  Best O(n log n), Average O(n log n), Worst O(n²)
 * Space: O(log n) — recursive call stack
 * Stable: No
 *
 * @param {number[]} inputArr
 * @param {Function} [compareFn]
 * @returns {SortResult}
 */
export function quickSort(inputArr, compareFn = defaultCompare) {
  const arr = [...inputArr];
  const steps = [];
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: null,
    description: 'Initial array',
  });

  function quickSortHelper(arr, low, high) {
    if (low >= high) return;

    const pivotIdx = partition(arr, low, high);
    quickSortHelper(arr, low, pivotIdx - 1);
    quickSortHelper(arr, pivotIdx + 1, high);
  }

  function partition(arr, low, high) {
    const pivot = arr[high];

    steps.push({
      array: [...arr],
      comparing: [high],
      swapping: null,
      description: `Pivot = arr[${high}] = ${pivot}; partition [${low}..${high}]`,
    });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      comparisons++;
      steps.push({
        array: [...arr],
        comparing: [j, high],
        swapping: null,
        description: `Compare arr[${j}]=${arr[j]} with pivot ${pivot}`,
      });

      if (compareFn(arr[j], pivot) < 0) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swaps++;
          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [i, j],
            description: `Swap arr[${i}] ↔ arr[${j}]`,
          });
        }
      }
    }

    // Place pivot in its correct position
    i++;
    if (i !== high) {
      [arr[i], arr[high]] = [arr[high], arr[i]];
      swaps++;
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [i, high],
        description: `Place pivot ${pivot} at position ${i}`,
      });
    }

    return i;
  }

  quickSortHelper(arr, 0, arr.length - 1);

  return { sorted: arr, steps, comparisons, swaps };
}

/**
 * Map of all sorting algorithms for easy access.
 */
export const SORTING_ALGORITHMS = {
  bubble: { name: 'Bubble Sort', fn: bubbleSort },
  selection: { name: 'Selection Sort', fn: selectionSort },
  insertion: { name: 'Insertion Sort', fn: insertionSort },
  merge: { name: 'Merge Sort', fn: mergeSort },
  quick: { name: 'Quick Sort', fn: quickSort },
};

/**
 * Generate a random array of given size.
 * @param {number} size
 * @param {number} min
 * @param {number} max
 * @returns {number[]}
 */
export function generateRandomArray(size = 20, min = 5, max = 100) {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}
