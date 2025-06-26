// types
export type SortStep = {
  array: number[];
  comparing: number[]; // indices being compared
  swapping?: number[]; // indices being swapped
  sorted?: number[]; // indices sorted
  buckets?: number[][]; // for bucket/radix/counting sort: array of buckets, each an array of values
  explanation: string;
  kind?: "divide" | "merge" | "compare" | "copy" | "done" | "bucket";
  groups?: number[][];
};

// BUBBLE SORT
export function bubbleSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = arr.slice();
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const compareExp = `Compare a[${j}] = ${a[j]} and a[${j + 1}] = ${
        a[j + 1]
      }.`;
      if (a[j] > a[j + 1]) {
        steps.push({
          array: a.slice(),
          comparing: [j, j + 1],
          explanation: `${compareExp} Since ${a[j]} > ${a[j + 1]}, swap them.`,
          sorted: Array.from({ length: i }, (_, idx) => n - 1 - idx),
        });
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          array: a.slice(),
          comparing: [j, j + 1],
          swapping: [j, j + 1],
          explanation: `Swapped a[${j}] and a[${j + 1}].`,
          sorted: Array.from({ length: i }, (_, idx) => n - 1 - idx),
        });
      } else {
        steps.push({
          array: a.slice(),
          comparing: [j, j + 1],
          explanation: `${compareExp} No swap needed because ${a[j]} ≤ ${
            a[j + 1]
          }.`,
          sorted: Array.from({ length: i }, (_, idx) => n - 1 - idx),
        });
      }
    }
    steps.push({
      array: a.slice(),
      comparing: [],
      sorted: Array.from({ length: i + 1 }, (_, idx) => n - 1 - idx),
      explanation: `Mark a[${
        n - 1 - i
      }] as sorted, since it's in its correct place after this pass.`,
    });
  }
  steps.push({
    array: a.slice(),
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    explanation: "Sorting complete.",
  });
  return steps;
}

// SELECTION SORT
export function selectionSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = arr.slice();
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push({
      array: a.slice(),
      comparing: [i],
      explanation: `Start pass at index ${i}. Assume a[${i}] = ${a[i]} is the minimum.`,
      sorted: Array.from({ length: i }, (_, k) => k),
    });
    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: a.slice(),
        comparing: [minIdx, j],
        sorted: Array.from({ length: i }, (_, k) => k),
        explanation: `Compare a[${minIdx}] = ${a[minIdx]} (current minimum) with a[${j}] = ${a[j]}.`,
      });
      if (a[j] < a[minIdx]) {
        minIdx = j;
        steps.push({
          array: a.slice(),
          comparing: [minIdx, j],
          sorted: Array.from({ length: i }, (_, k) => k),
          explanation: `Found new minimum: a[${minIdx}] = ${a[minIdx]} at index ${minIdx}.`,
        });
      }
    }
    if (minIdx !== i) {
      steps.push({
        array: a.slice(),
        comparing: [i, minIdx],
        swapping: [i, minIdx],
        sorted: Array.from({ length: i }, (_, k) => k),
        explanation: `End of pass: Swap a[${i}] = ${a[i]} with minimum a[${minIdx}] = ${a[minIdx]}.`,
      });
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
    } else {
      steps.push({
        array: a.slice(),
        comparing: [i],
        sorted: Array.from({ length: i }, (_, k) => k),
        explanation: `End of pass: No swap needed. a[${i}] = ${a[i]} is already the minimum.`,
      });
    }
    steps.push({
      array: a.slice(),
      comparing: [],
      sorted: Array.from({ length: i + 1 }, (_, k) => k),
      explanation: `Mark a[${i}] = ${a[i]} as sorted.`,
    });
  }
  steps.push({
    array: a.slice(),
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    explanation: "Sorting complete.",
  });
  return steps;
}

// INSERTION SORT
export function insertionSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = arr.slice();
  const n = a.length;

  for (let i = 1; i < n; i++) {
    let j = i;
    steps.push({
      array: a.slice(),
      comparing: [j - 1, j],
      sorted: Array.from({ length: i }, (_, k) => k),
      explanation: `Pick a[${j}] = ${
        a[j]
      } and insert it into the sorted left part (indices 0 to ${i - 1}).`,
    });
    let didSwap = false;
    while (j > 0 && a[j] < a[j - 1]) {
      steps.push({
        array: a.slice(),
        comparing: [j - 1, j],
        swapping: [j - 1, j],
        sorted: Array.from({ length: i }, (_, k) => k),
        explanation: `a[${j}] = ${a[j]} < a[${j - 1}] = ${
          a[j - 1]
        }, so swap them to move smaller value left.`,
      });
      [a[j], a[j - 1]] = [a[j - 1], a[j]];
      didSwap = true;
      j--;
    }
    if (didSwap || j === i) {
      // After swaps or if already correct
      steps.push({
        array: a.slice(),
        comparing: [j],
        sorted: Array.from({ length: i + 1 }, (_, k) => k),
        explanation: didSwap
          ? `a[${j}] = ${a[j]} is now in the correct position. Left part is sorted up to index ${i}.`
          : `No swaps needed. a[${i}] = ${a[i]} is already in correct position.`,
      });
    }
  }
  steps.push({
    array: a.slice(),
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    explanation: "Sorting complete.",
  });
  return steps;
}

// MERGE SORT (with steps)
export function mergeSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = arr.slice();
  const n = a.length;

  function mergeSortHelper(l: number, r: number) {
    if (l >= r) return;

    const m = Math.floor((l + r) / 2);

    // Mark the divide: left group, right group
    steps.push({
      array: a.slice(),
      comparing: [],
      explanation: `Divide: left [${l}-${m}], right [${m + 1}-${r}]`,
      kind: "divide",
      groups: [
        Array.from({ length: m - l + 1 }, (_, i) => l + i),
        Array.from({ length: r - m }, (_, i) => m + 1 + i),
      ],
    });

    mergeSortHelper(l, m);
    mergeSortHelper(m + 1, r);

    // Mark the merge step
    steps.push({
      array: a.slice(),
      comparing: [],
      explanation: `Merging: left [${l}-${m}], right [${m + 1}-${r}]`,
      kind: "merge",
      groups: [
        Array.from({ length: m - l + 1 }, (_, i) => l + i),
        Array.from({ length: r - m }, (_, i) => m + 1 + i),
      ],
    });

    // Merge left and right
    let left = a.slice(l, m + 1);
    let right = a.slice(m + 1, r + 1);
    let i = l,
      li = 0,
      ri = 0;

    while (li < left.length && ri < right.length) {
      steps.push({
        array: a.slice(),
        comparing: [i, l + li, m + 1 + ri],
        explanation: `Compare left[${li}] = ${left[li]} and right[${ri}] = ${right[ri]}`,
        kind: "compare",
        groups: [
          Array.from({ length: m - l + 1 }, (_, i) => l + i),
          Array.from({ length: r - m }, (_, i) => m + 1 + i),
        ],
      });
      if (left[li] <= right[ri]) {
        a[i++] = left[li++];
        steps.push({
          array: a.slice(),
          comparing: [],
          explanation: `Insert left[${li - 1}] at position ${i - 1}`,
          kind: "copy",
          groups: [
            Array.from({ length: m - l + 1 }, (_, i) => l + i),
            Array.from({ length: r - m }, (_, i) => m + 1 + i),
          ],
        });
      } else {
        a[i++] = right[ri++];
        steps.push({
          array: a.slice(),
          comparing: [],
          explanation: `Insert right[${ri - 1}] at position ${i - 1}`,
          kind: "copy",
          groups: [
            Array.from({ length: m - l + 1 }, (_, i) => l + i),
            Array.from({ length: r - m }, (_, i) => m + 1 + i),
          ],
        });
      }
    }
    while (li < left.length) {
      a[i++] = left[li++];
      steps.push({
        array: a.slice(),
        comparing: [],
        explanation: `Insert leftover left[${li - 1}] at position ${i - 1}`,
        kind: "copy",
        groups: [
          Array.from({ length: m - l + 1 }, (_, i) => l + i),
          Array.from({ length: r - m }, (_, i) => m + 1 + i),
        ],
      });
    }
    while (ri < right.length) {
      a[i++] = right[ri++];
      steps.push({
        array: a.slice(),
        comparing: [],
        explanation: `Insert leftover right[${ri - 1}] at position ${i - 1}`,
        kind: "copy",
        groups: [
          Array.from({ length: m - l + 1 }, (_, i) => l + i),
          Array.from({ length: r - m }, (_, i) => m + 1 + i),
        ],
      });
    }
  }

  mergeSortHelper(0, n - 1);

  steps.push({
    array: a.slice(),
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    explanation: "Sorting complete.",
    kind: "done",
  });

  return steps;
}

// QUICK SORT (with steps)
export function quickSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = arr.slice();

  function quickSortHelper(l: number, r: number) {
    if (l >= r) return;
    let pivot = a[r],
      i = l;
    steps.push({
      array: a.slice(),
      comparing: [r],
      explanation: `Choose a[${r}] = ${pivot} as the pivot for this partition.`,
    });
    for (let j = l; j < r; j++) {
      steps.push({
        array: a.slice(),
        comparing: [j, r],
        explanation:
          `Compare a[${j}] = ${a[j]} with pivot a[${r}] = ${pivot}. ` +
          (a[j] < pivot
            ? `Since ${a[j]} < ${pivot}, it belongs before the pivot, so swap with a[${i}] = ${a[i]}.`
            : `No swap, as ${a[j]} ≥ ${pivot}.`),
      });
      if (a[j] < pivot) {
        [a[i], a[j]] = [a[j], a[i]];
        steps.push({
          array: a.slice(),
          swapping: [i, j],
          comparing: [i, j],
          explanation: `Swapped a[${i}] and a[${j}] to move smaller value to left of pivot.`,
        });
        i++;
      }
    }
    [a[i], a[r]] = [a[r], a[i]];
    steps.push({
      array: a.slice(),
      swapping: [i, r],
      comparing: [i, r],
      explanation: `Place the pivot a[${r}] into position ${i} so all left are smaller, all right are greater.`,
    });
    quickSortHelper(l, i - 1);
    quickSortHelper(i + 1, r);
  }

  quickSortHelper(0, a.length - 1);
  steps.push({
    array: a.slice(),
    comparing: [],
    sorted: Array.from({ length: a.length }, (_, i) => i),
    explanation: "Sorting complete.",
  });
  return steps;
}

// HEAP SORT (with steps)
export function heapSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = arr.slice();
  const n = a.length;

  function heapify(size: number, i: number) {
    let largest = i,
      l = 2 * i + 1,
      r = 2 * i + 2;
    if (l < size) {
      steps.push({
        array: a.slice(),
        comparing: [i, l],
        explanation: `Compare a[${i}] = ${a[i]} with left child a[${l}] = ${a[l]}.`,
      });
      if (a[l] > a[largest]) largest = l;
    }
    if (r < size) {
      steps.push({
        array: a.slice(),
        comparing: [largest, r],
        explanation: `Compare a[${largest}] = ${a[largest]} with right child a[${r}] = ${a[r]}.`,
      });
      if (a[r] > a[largest]) largest = r;
    }
    if (largest !== i) {
      steps.push({
        array: a.slice(),
        swapping: [i, largest],
        comparing: [i, largest],
        explanation: `Since a[${largest}] = ${a[largest]} is largest, swap with a[${i}] = ${a[i]}.`,
      });
      [a[i], a[largest]] = [a[largest], a[i]];
      heapify(size, largest);
    } else {
      steps.push({
        array: a.slice(),
        comparing: [i],
        explanation: `No swap needed; a[${i}] is largest among its children.`,
      });
    }
  }

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    steps.push({
      array: a.slice(),
      comparing: [i],
      explanation: `Heapify subtree rooted at a[${i}] = ${a[i]}.`,
    });
    heapify(n, i);
  }
  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    steps.push({
      array: a.slice(),
      swapping: [0, i],
      comparing: [0, i],
      sorted: Array.from({ length: n - i }, (_, k) => n - 1 - k),
      explanation: `Swap max element a[0] = ${a[0]} with a[${i}] = ${a[i]}, then heapify reduced heap.`,
    });
    [a[0], a[i]] = [a[i], a[0]];
    heapify(i, 0);
  }
  steps.push({
    array: a.slice(),
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    explanation: "Sorting complete.",
  });
  return steps;
}
// COUNTING SORT
export function countingSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = arr.slice();
  if (a.length === 0) return steps;
  const min = Math.min(...a),
    max = Math.max(...a);
  const count = Array(max - min + 1).fill(0);

  steps.push({
    array: a.slice(),
    comparing: [],
    explanation: `Initialize counting array from ${min} to ${max}`,
    kind: "bucket",
    buckets: count.map(() => []),
  });

  for (let i = 0; i < a.length; i++) {
    count[a[i] - min]++;
    steps.push({
      array: a.slice(),
      comparing: [i],
      explanation: `Increment count for value ${a[i]}`,
      kind: "bucket",
      buckets: count.map((c, idx) => Array(c).fill(idx + min)),
    });
  }
  let idx = 0;
  for (let i = 0; i < count.length; i++) {
    while (count[i] > 0) {
      a[idx] = i + min;
      steps.push({
        array: a.slice(),
        comparing: [idx],
        sorted: Array.from({ length: idx + 1 }, (_, n) => n),
        explanation: `Write value ${i + min} to index ${idx}`,
        kind: "bucket",
        buckets: count.map((c, j) =>
          j === i ? Array(c - 1).fill(j + min) : Array(c).fill(j + min)
        ),
      });
      count[i]--;
      idx++;
    }
  }
  steps.push({
    array: a.slice(),
    comparing: [],
    sorted: Array.from({ length: a.length }, (_, i) => i),
    explanation: "Sorting complete.",
    kind: "done",
  });
  return steps;
}

// RADIX SORT (LSD, base 10)
export function radixSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  let a = arr.slice();
  if (a.length === 0) return steps;
  const max = Math.max(...a);
  let exp = 1;

  while (Math.floor(max / exp) > 0) {
    const buckets: number[][] = Array.from({ length: 10 }, () => []);
    for (let i = 0; i < a.length; i++) {
      const digit = Math.floor((a[i] / exp) % 10);
      buckets[digit].push(a[i]);
      steps.push({
        array: a.slice(),
        comparing: [i],
        explanation: `Place ${a[i]} into bucket ${digit} (digit at ${exp}'s place)`,
        kind: "bucket",
        buckets: buckets.map((b) => b.slice()),
      });
    }
    a = ([] as number[]).concat(...buckets); // <<<<<< SAFE, typed
    steps.push({
      array: a.slice(),
      comparing: [],
      explanation: `Rebuild array from buckets for exp=${exp}`,
      kind: "bucket",
      buckets: buckets.map((b) => b.slice()),
    });
    exp *= 10;
  }
  steps.push({
    array: a.slice(),
    comparing: [],
    sorted: Array.from({ length: a.length }, (_, i) => i),
    explanation: "Sorting complete.",
    kind: "done",
  });
  return steps;
}

// BUCKET SORT (for floats in [0,1))
export function bucketSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = arr.slice();
  if (a.length === 0) return steps;
  const n = a.length;
  const buckets: number[][] = Array.from({ length: n }, () => []);

  for (let i = 0; i < a.length; i++) {
    const idx = Math.floor(a[i] * n);
    buckets[idx].push(a[i]);
    steps.push({
      array: a.slice(),
      comparing: [i],
      explanation: `Place ${a[i].toFixed(2)} in bucket ${idx}`,
      kind: "bucket",
      buckets: buckets.map((b) => b.slice()),
    });
  }
  let idx = 0;
  for (let b = 0; b < n; b++) {
    buckets[b].sort((x, y) => x - y);
    for (let v of buckets[b]) {
      a[idx] = v;
      steps.push({
        array: a.slice(),
        comparing: [idx],
        explanation: `Write ${v.toFixed(
          2
        )} from bucket ${b} to position ${idx}`,
        kind: "bucket",
        buckets: buckets.map((bb) => bb.slice()),
      });
      idx++;
    }
  }
  steps.push({
    array: a.slice(),
    comparing: [],
    sorted: Array.from({ length: a.length }, (_, i) => i),
    explanation: "Sorting complete.",
    kind: "done",
  });
  return steps;
}

// SHELL SORT (gap sequence: n/2, n/4, ...)
export function shellSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = arr.slice();
  const n = a.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      let temp = a[i];
      let j = i;
      steps.push({
        array: a.slice(),
        comparing: [i, j - gap],
        explanation: `Compare a[${j - gap}] = ${a[j - gap]} and a[${i}] = ${
          a[i]
        } (gap = ${gap})`,
      });
      while (j >= gap && a[j - gap] > temp) {
        a[j] = a[j - gap];
        steps.push({
          array: a.slice(),
          swapping: [j, j - gap],
          comparing: [j, j - gap],
          explanation: `Move a[${j - gap}] to position ${j} (gap = ${gap})`,
        });
        j -= gap;
      }
      a[j] = temp;
      steps.push({
        array: a.slice(),
        comparing: [j],
        explanation: `Insert ${temp} at position ${j} (gap = ${gap})`,
      });
    }
  }
  steps.push({
    array: a.slice(),
    comparing: [],
    sorted: Array.from({ length: a.length }, (_, i) => i),
    explanation: "Sorting complete.",
    kind: "done",
  });
  return steps;
}

// TimSort not shown here: it's complex, hybrid, hard to step-by-step for UI
