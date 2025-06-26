import { useState, useRef } from "react";
import {
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
  countingSort,
  radixSort,
  bucketSort,
  shellSort,
} from "../structures/SortingAlgorithms";
import type { SortStep } from "../structures/SortingAlgorithms";
import styles from "./SortingVisualizer.module.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

const ALGORITHMS = [
  { key: "bubble", name: "Bubble Sort", fn: bubbleSort },
  { key: "selection", name: "Selection Sort", fn: selectionSort },
  { key: "insertion", name: "Insertion Sort", fn: insertionSort },
  { key: "merge", name: "Merge Sort", fn: mergeSort },
  { key: "quick", name: "Quick Sort", fn: quickSort },
  { key: "heap", name: "Heap Sort", fn: heapSort },
  { key: "counting", name: "Counting Sort", fn: countingSort },
  { key: "radix", name: "Radix Sort (LSD)", fn: radixSort },
  { key: "bucket", name: "Bucket Sort", fn: bucketSort },
  { key: "shell", name: "Shell Sort", fn: shellSort },
] as const;

type AlgorithmKey = (typeof ALGORITHMS)[number]["key"];

const SORT_INFO: Record<
  AlgorithmKey,
  {
    name: string;
    complexity: string;
    space: string;
    stable: string;
    usage: string;
    arrayType?: string;
  }
> = {
  bubble: {
    name: "Bubble Sort",
    complexity: "Best: O(n), Avg: O(n²), Worst: O(n²)",
    space: "O(1)",
    stable: "Yes",
    usage:
      "Simple, stable. Great for education and visual learning, but not used in practice.",
  },
  selection: {
    name: "Selection Sort",
    complexity: "O(n²) all cases",
    space: "O(1)",
    stable: "No",
    usage:
      "Educational, minimizes swaps. Not stable and not used in real applications.",
  },
  insertion: {
    name: "Insertion Sort",
    complexity: "Best: O(n), Avg/Worst: O(n²)",
    space: "O(1)",
    stable: "Yes",
    usage:
      "Stable and efficient for small or nearly sorted arrays. Used in hybrid algorithms.",
  },
  merge: {
    name: "Merge Sort",
    complexity: "O(n log n) all cases",
    space: "O(n)",
    stable: "Yes",
    usage:
      "Stable, works on linked lists and external sorting. Needs extra space.",
  },
  quick: {
    name: "Quick Sort",
    complexity: "Best/Avg: O(n log n), Worst: O(n²)",
    space: "O(log n)",
    stable: "No",
    usage:
      "Very fast in practice, in-place. Not stable. Used in many language stdlibs.",
  },
  heap: {
    name: "Heap Sort",
    complexity: "O(n log n) all cases",
    space: "O(1)",
    stable: "No",
    usage:
      "In-place, not stable. Good when constant space is critical; used for heaps.",
  },
  counting: {
    name: "Counting Sort",
    complexity: "O(n + k)",
    space: "O(n + k)",
    stable: "Yes",
    usage:
      "Best for small-integer keys. Used in radix/bucket sorts. Not comparison-based.",
    arrayType: "integers (small range)",
  },
  radix: {
    name: "Radix Sort",
    complexity: "O(d·(n + k))",
    space: "O(n + k)",
    stable: "Yes",
    usage:
      "Sorts numbers or strings by digits/characters. Used in libraries and databases.",
    arrayType: "integers (positive, same width)",
  },
  bucket: {
    name: "Bucket Sort",
    complexity: "O(n + k)",
    space: "O(n + k)",
    stable: "Yes",
    usage:
      "For uniformly distributed floats in [0,1). Used as base for other sorts.",
    arrayType: "floats in [0,1)",
  },
  shell: {
    name: "Shell Sort",
    complexity: "Best: O(n log n), Worst: O(n²)",
    space: "O(1)",
    stable: "No",
    usage:
      "In-place, faster than insertion for medium arrays, low memory. Gap-based.",
    arrayType: "any numbers",
  },
};

const SORT_CODE_JS: Record<AlgorithmKey, string> = {
  bubble: `function bubbleSort(a) {
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      if (a[j] > a[j+1]) {
        [a[j], a[j+1]] = [a[j+1], a[j]];
      }
    }
  }
  return a;
}`,
  selection: `function selectionSort(a) {
  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) [a[i], a[minIdx]] = [a[minIdx], a[i]];
  }
  return a;
}`,
  insertion: `function insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    let j = i;
    while (j > 0 && a[j] < a[j-1]) {
      [a[j], a[j-1]] = [a[j-1], a[j]];
      j--;
    }
  }
  return a;
}`,
  merge: `function mergeSort(a) {
  if (a.length <= 1) return a;
  const m = Math.floor(a.length / 2);
  const left = mergeSort(a.slice(0, m));
  const right = mergeSort(a.slice(m));
  return merge(left, right);
}
function merge(left, right) {
  let res = [], i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) res.push(left[i++]);
    else res.push(right[j++]);
  }
  return res.concat(left.slice(i)).concat(right.slice(j));
}`,
  quick: `function quickSort(a, l = 0, r = a.length - 1) {
  if (l >= r) return;
  let pivot = a[r], i = l;
  for (let j = l; j < r; j++) {
    if (a[j] < pivot) {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
  }
  [a[i], a[r]] = [a[r], a[i]];
  quickSort(a, l, i - 1);
  quickSort(a, i + 1, r);
  return a;
}`,
  heap: `function heapSort(a) {
  function heapify(n, i) {
    let largest = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && a[l] > a[largest]) largest = l;
    if (r < n && a[r] > a[largest]) largest = r;
    if (largest !== i) {
      [a[i], a[largest]] = [a[largest], a[i]];
      heapify(n, largest);
    }
  }
  const n = a.length;
  for (let i = Math.floor(n/2)-1; i >= 0; i--) heapify(n, i);
  for (let i = n-1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    heapify(i, 0);
  }
  return a;
}`,
  counting: `function countingSort(a) {
  if (a.length === 0) return a;
  let min = Math.min(...a), max = Math.max(...a);
  let count = Array(max-min+1).fill(0);
  for (let x of a) count[x-min]++;
  let idx = 0;
  for (let i = 0; i < count.length; i++)
    while (count[i]-- > 0) a[idx++] = i + min;
  return a;
}`,
  radix: `function radixSort(a) {
  if (a.length === 0) return a;
  let max = Math.max(...a), exp = 1;
  while (Math.floor(max / exp) > 0) {
    let buckets = Array.from({length:10},()=>[]);
    for (let i = 0; i < a.length; i++)
      buckets[Math.floor((a[i]/exp)%10)].push(a[i]);
    a = [].concat(...buckets);
    exp *= 10;
  }
  return a;
}`,
  bucket: `function bucketSort(a) {
  if (a.length === 0) return a;
  let n = a.length, buckets = Array.from({length: n}, ()=>[]);
  for (let x of a) buckets[Math.floor(x * n)].push(x);
  let idx = 0;
  for (let b of buckets) for (let v of b.sort((x,y)=>x-y)) a[idx++] = v;
  return a;
}`,
  shell: `function shellSort(a) {
  let n = a.length;
  for (let gap = Math.floor(n/2); gap > 0; gap = Math.floor(gap/2)) {
    for (let i = gap; i < n; i++) {
      let temp = a[i], j = i;
      while (j >= gap && a[j-gap] > temp) {
        a[j] = a[j-gap];
        j -= gap;
      }
      a[j] = temp;
    }
  }
  return a;
}`,
};

const SORT_CODE_TS: Record<AlgorithmKey, string> = {
  bubble: `export function bubbleSort(arr: number[]): number[] {
  const a = arr.slice();
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      if (a[j] > a[j+1]) {
        [a[j], a[j+1]] = [a[j+1], a[j]];
      }
    }
  }
  return a;
}`,
  selection: `export function selectionSort(arr: number[]): number[] {
  const a = arr.slice();
  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) [a[i], a[minIdx]] = [a[minIdx], a[i]];
  }
  return a;
}`,
  insertion: `export function insertionSort(arr: number[]): number[] {
  const a = arr.slice();
  for (let i = 1; i < a.length; i++) {
    let j = i;
    while (j > 0 && a[j] < a[j-1]) {
      [a[j], a[j-1]] = [a[j-1], a[j]];
      j--;
    }
  }
  return a;
}`,
  merge: `export function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const m = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, m));
  const right = mergeSort(arr.slice(m));
  return merge(left, right);
}
function merge(left: number[], right: number[]): number[] {
  let res: number[] = [], i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) res.push(left[i++]);
    else res.push(right[j++]);
  }
  return res.concat(left.slice(i)).concat(right.slice(j));
}`,
  quick: `export function quickSort(arr: number[], l = 0, r = arr.length - 1): number[] {
  if (l >= r) return arr;
  const a = arr.slice();
  let pivot = a[r], i = l;
  for (let j = l; j < r; j++) {
    if (a[j] < pivot) {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
  }
  [a[i], a[r]] = [a[r], a[i]];
  quickSort(a, l, i - 1);
  quickSort(a, i + 1, r);
  return a;
}`,
  heap: `export function heapSort(arr: number[]): number[] {
  const a = arr.slice();
  function heapify(n: number, i: number) {
    let largest = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && a[l] > a[largest]) largest = l;
    if (r < n && a[r] > a[largest]) largest = r;
    if (largest !== i) {
      [a[i], a[largest]] = [a[largest], a[i]];
      heapify(n, largest);
    }
  }
  const n = a.length;
  for (let i = Math.floor(n/2)-1; i >= 0; i--) heapify(n, i);
  for (let i = n-1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    heapify(i, 0);
  }
  return a;
}`,
  counting: `export function countingSort(arr: number[]): number[] {
  const a = arr.slice();
  if (a.length === 0) return a;
  const min = Math.min(...a), max = Math.max(...a);
  const count = Array(max - min + 1).fill(0);
  for (const x of a) count[x - min]++;
  let idx = 0;
  for (let i = 0; i < count.length; i++)
    while (count[i]-- > 0) a[idx++] = i + min;
  return a;
}`,
  radix: `export function radixSort(arr: number[]): number[] {
  let a = arr.slice();
  if (a.length === 0) return a;
  const max = Math.max(...a);
  let exp = 1;
  while (Math.floor(max / exp) > 0) {
    const buckets: number[][] = Array.from({ length: 10 }, () => []);
    for (let i = 0; i < a.length; i++)
      buckets[Math.floor((a[i] / exp) % 10)].push(a[i]);
    a = ([] as number[]).concat(...buckets);
    exp *= 10;
  }
  return a;
}`,
  bucket: `export function bucketSort(arr: number[]): number[] {
  const a = arr.slice();
  if (a.length === 0) return a;
  const n = a.length;
  const buckets: number[][] = Array.from({ length: n }, () => []);
  for (const x of a) buckets[Math.floor(x * n)].push(x);
  let idx = 0;
  for (let b of buckets)
    for (let v of b.sort((x, y) => x - y)) a[idx++] = v;
  return a;
}`,
  shell: `export function shellSort(arr: number[]): number[] {
  const a = arr.slice();
  const n = a.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      let temp = a[i], j = i;
      while (j >= gap && a[j - gap] > temp) {
        a[j] = a[j - gap];
        j -= gap;
      }
      a[j] = temp;
    }
  }
  return a;
}`,
};

const GROUP_COLORS = [
  styles.group0,
  styles.group1,
  styles.group2,
  styles.group3,
  styles.group4,
  styles.group5,
  styles.group6,
  styles.group7,
  styles.group8,
];

export default function SortingVisualizer() {
  const [algorithm, setAlgorithm] = useState<AlgorithmKey>("bubble");
  const [array, setArray] = useState<number[]>(() =>
    Array.from({ length: 10 }, () => Math.floor(Math.random() * 40) + 4)
  );
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [codeType, setCodeType] = useState<"js" | "ts">("js");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  function startSort() {
    const algo = ALGORITHMS.find((a) => a.key === algorithm)!;
    const newSteps = algo.fn(array);
    setSteps(newSteps);
    setStepIndex(0);
    setPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleAlgorithmChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const algo = e.target.value as AlgorithmKey;
    setAlgorithm(algo);
    // Reshuffle immediately to proper array type for this algorithm:
    const n = algo === "bucket" ? 12 : 10;
    const arr =
      algo === "bucket"
        ? Array.from({ length: n }, () =>
            Number((Math.random() * 0.98 + 0.01).toFixed(2))
          )
        : Array.from({ length: n }, () => Math.floor(Math.random() * 40) + 4);
    setArray(arr);
    setSteps([]);
    setStepIndex(0);
    setPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function nextStep() {
    setStepIndex((idx) => Math.min(idx + 1, steps.length - 1));
  }

  function prevStep() {
    setStepIndex((idx) => Math.max(idx - 1, 0));
  }

  function play() {
    setPlaying(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setStepIndex((idx) => {
        if (idx < steps.length - 1) return idx + 1;
        setPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
        return idx;
      });
    }, 600);
  }

  function pause() {
    setPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function reset() {
    setStepIndex(0);
    setPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function shuffle() {
    const n = algorithm === "bucket" ? 12 : 10;
    const arr =
      algorithm === "bucket"
        ? Array.from({ length: n }, () =>
            Number((Math.random() * 0.98 + 0.01).toFixed(2))
          )
        : Array.from({ length: n }, () => Math.floor(Math.random() * 40) + 4);
    setArray(arr);
    setSteps([]);
    setStepIndex(0);
    setPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  // Get current step (default to the initial state)
  const currStep: SortStep = steps[stepIndex] || {
    array,
    comparing: [],
    explanation: "Press 'Sort' to start.",
    kind: undefined,
    groups: undefined,
  };

  // Explanation step kind (for color)
  let explanationClass = styles.explanation;
  if (currStep.kind === "divide") explanationClass += ` ${styles.divide}`;
  else if (currStep.kind === "merge") explanationClass += ` ${styles.merge}`;
  else if (currStep.kind === "compare")
    explanationClass += ` ${styles.compare}`;
  else if (currStep.kind === "copy") explanationClass += ` ${styles.copy}`;
  else if (currStep.kind === "bucket")
    explanationClass += ` ${styles.bucketStep}`;
  else if (currStep.kind === "done") explanationClass += ` ${styles.done}`;

  return (
    <div className={styles.container}>
      <a href="/" className={styles.backButton}>
        ← Back to Dashboard
      </a>
      <h1 className={styles.title}>Sorting Algorithm Visualizer</h1>

      {/* Info Panel */}
      <div className={styles.infoBox}>
        <h3>{SORT_INFO[algorithm].name}</h3>
        <div>
          <strong>Time Complexity:</strong> {SORT_INFO[algorithm].complexity}
        </div>
        <div>
          <strong>Space Complexity:</strong> {SORT_INFO[algorithm].space}
        </div>
        <div>
          <strong>Stable:</strong> {SORT_INFO[algorithm].stable}
        </div>
        <div style={{ marginTop: 6 }}>
          <strong>Usage:</strong> {SORT_INFO[algorithm].usage}
        </div>
        {SORT_INFO[algorithm].arrayType && (
          <div>
            <strong>Array type:</strong> {SORT_INFO[algorithm].arrayType}
          </div>
        )}
      </div>

      {/* Code Panel */}
      <div className={styles.codePanel}>
        <div className={styles.codeHeader}>
          <button
            className={styles.codeToggle}
            onClick={() => setShowCode((v) => !v)}
          >
            {showCode ? "Hide" : "Show"} {SORT_INFO[algorithm].name} Source Code
          </button>
          <div className={styles.codeTypeGroup}>
            <button
              className={
                styles.codeTypeBtn +
                (codeType === "js" ? " " + styles.codeTypeActive : "")
              }
              onClick={() => setCodeType("js")}
              disabled={codeType === "js"}
              aria-label="Show JavaScript code"
            >
              JavaScript
            </button>
            <button
              className={
                styles.codeTypeBtn +
                (codeType === "ts" ? " " + styles.codeTypeActive : "")
              }
              onClick={() => setCodeType("ts")}
              disabled={codeType === "ts"}
              aria-label="Show TypeScript code"
            >
              TypeScript
            </button>
          </div>
        </div>
        {showCode && (
          <SyntaxHighlighter
            language={codeType === "js" ? "javascript" : "typescript"}
            style={oneLight}
            className={styles.codeBlock}
            customStyle={{
              borderRadius: 12,
              fontSize: "1rem",
              marginTop: 4,
              background: "#f7fafd",
            }}
          >
            {codeType === "js"
              ? SORT_CODE_JS[algorithm]
              : SORT_CODE_TS[algorithm]}
          </SyntaxHighlighter>
        )}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <label>
          <span>Algorithm: </span>
          <select
            value={algorithm}
            onChange={handleAlgorithmChange}
            className={styles.select}
            disabled={playing}
          >
            {ALGORITHMS.map((a) => (
              <option key={a.key} value={a.key}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={shuffle} className={styles.button} disabled={playing}>
          Shuffle
        </button>
        <button
          onClick={startSort}
          className={styles.button}
          disabled={playing}
        >
          Sort
        </button>
        <button
          onClick={prevStep}
          disabled={stepIndex === 0 || steps.length === 0 || playing}
          className={styles.button}
        >
          Prev
        </button>
        <button
          onClick={nextStep}
          disabled={
            stepIndex === steps.length - 1 || steps.length === 0 || playing
          }
          className={styles.button}
        >
          Next
        </button>
        {playing ? (
          <button onClick={pause} className={styles.button}>
            Pause
          </button>
        ) : (
          <button
            onClick={play}
            className={styles.button}
            disabled={steps.length === 0 || stepIndex === steps.length - 1}
          >
            Play
          </button>
        )}
        <button onClick={reset} className={styles.button} disabled={playing}>
          Reset
        </button>
      </div>

      {/* Visualization */}
      <div className={styles.visual}>
        {currStep.buckets ? (
          <div className={styles.bucketsPanel}>
            {currStep.buckets.map((bucket, bidx) => (
              <div key={bidx} className={styles.bucket}>
                <div className={styles.bucketLabel}>Bucket {bidx}</div>
                <div className={styles.bucketValues}>
                  {bucket.map((v, vi) => (
                    <div
                      className={styles.bucketBar}
                      key={vi}
                      title={String(v)}
                    >
                      {typeof v === "number"
                        ? Number.isInteger(v)
                          ? v
                          : v.toFixed(2)
                        : v}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.barPanel}>
            {currStep.array.map((v: number, i: number) => {
              let barClass = styles.bar;
              if (currStep.comparing && currStep.comparing.includes(i))
                barClass += ` ${styles.comparing}`;
              if (currStep.swapping && currStep.swapping.includes(i))
                barClass += ` ${styles.swapping}`;
              if (currStep.sorted && currStep.sorted.includes(i))
                barClass += ` ${styles.sorted}`;
              // Group highlighting (for merge/divide/etc)
              if (currStep.groups) {
                currStep.groups.forEach((group, groupIdx) => {
                  if (group.includes(i)) {
                    barClass += ` ${
                      GROUP_COLORS[groupIdx % GROUP_COLORS.length]
                    }`;
                  }
                });
              }
              return (
                <div
                  key={i}
                  className={barClass}
                  style={{
                    height: `${typeof v === "number" ? v * 4 : 40}px`,
                  }}
                  title={`a[${i}] = ${v}`}
                >
                  <span className={styles.barLabel}>
                    {typeof v === "number" && !Number.isInteger(v)
                      ? v.toFixed(2)
                      : v}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className={explanationClass}>
        <strong>
          Step {steps.length > 0 ? stepIndex + 1 : 0}/{steps.length}:
        </strong>{" "}
        {currStep.explanation}
      </div>
    </div>
  );
}
