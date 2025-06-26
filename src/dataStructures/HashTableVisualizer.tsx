// src/components/HashTableVisualizer.tsx

import React, { useState, useEffect } from "react";
import { HashTable, type HashTableStep } from "../structures/HashTable";
import styles from "./HashTableVisualizer.module.css";

// --- Java-style String Hash Function ---
const javaStringHash = (key: string): number => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (31 * hash + key.charCodeAt(i)) | 0; // 32-bit signed int
  }
  return hash;
};

const hashTableDatasets = {
  names: {
    info: "Hash table with Java-style string hashing.",
    size: 7,
    hashFunc: (key: string, size: number) => {
      const hash = javaStringHash(key);
      return Math.abs(hash % size);
    },
    hashFuncString: `Java: hash = 31 * hash + c; bucket = |hash| % size`,
    hashFuncExplain: (key: string, size: number) => {
      const steps = [];
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        const prev = hash;
        hash = (31 * hash + key.charCodeAt(i)) | 0;
        steps.push(
          `step ${i + 1}: 31*${prev} + '${key[i]}'(${key.charCodeAt(
            i
          )}) = ${hash}`
        );
      }
      const absHash = Math.abs(hash);
      return `${steps.join("; ")}; |hash| % ${size} = ${absHash % size}`;
    },
    initial: ["Eve", "Bob", "Alice", "Grace", "Diana", "Frank", "Charlie"],
  },
  numbers: {
    info: "Numeric IDs as keys, Java string hash function.",
    size: 8,
    hashFunc: (key: string, size: number) => {
      const hash = javaStringHash(key);
      return Math.abs(hash % size);
    },
    hashFuncString: `Java: hash = 31 * hash + c; bucket = |hash| % size`,
    hashFuncExplain: (key: string, size: number) => {
      const steps = [];
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        const prev = hash;
        hash = (31 * hash + key.charCodeAt(i)) | 0;
        steps.push(
          `step ${i + 1}: 31*${prev} + '${key[i]}'(${key.charCodeAt(
            i
          )}) = ${hash}`
        );
      }
      const absHash = Math.abs(hash);
      return `${steps.join("; ")}; |hash| % ${size} = ${absHash % size}`;
    },
    initial: ["101", "205", "120", "115", "198"],
  },
  collisions: {
    info: "Collisions using Java string hash function.",
    size: 5,
    hashFunc: (key: string, size: number) => {
      const hash = javaStringHash(key);
      return Math.abs(hash % size);
    },
    hashFuncString: `Java: hash = 31 * hash + c; bucket = |hash| % size`,
    hashFuncExplain: (key: string, size: number) => {
      const steps = [];
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        const prev = hash;
        hash = (31 * hash + key.charCodeAt(i)) | 0;
        steps.push(
          `step ${i + 1}: 31*${prev} + '${key[i]}'(${key.charCodeAt(
            i
          )}) = ${hash}`
        );
      }
      const absHash = Math.abs(hash);
      return `${steps.join("; ")}; |hash| % ${size} = ${absHash % size}`;
    },
    initial: ["Amy", "Ann", "Ali", "Ben", "Bob", "Bea"],
  },
} as const;

type DatasetKey = keyof typeof hashTableDatasets;
type AlgorithmKey = "insert" | "search" | "delete";

const algorithmDetails: Record<
  AlgorithmKey,
  { name: string; needsKey: boolean }
> = {
  insert: { name: "Insert", needsKey: true },
  search: { name: "Search", needsKey: true },
  delete: { name: "Delete", needsKey: true },
};

const HashTableVisualizer: React.FC = () => {
  const [datasetKey, setDatasetKey] = useState<DatasetKey>("names");
  const dataset = hashTableDatasets[datasetKey];
  const [table, setTable] = useState<HashTable>(
    new HashTable(dataset, dataset.initial)
  );
  const [algorithm, setAlgorithm] = useState<AlgorithmKey>("insert");
  const [inputKey, setInputKey] = useState<string>("");
  const [steps, setSteps] = useState<HashTableStep[]>([]);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    setTable(new HashTable(dataset, dataset.initial));
    setSteps([]);
    setStepIndex(0);
    setLog([]);
    setInputKey("");
  }, [datasetKey, dataset]);

  // Show hash explanation for the current step/key
  function getHashExplain(step: HashTableStep): string | null {
    if (!step.highlightKey || step.bucketIndex == null) return null;
    if (!/hash/i.test(step.message)) return null;
    return dataset.hashFuncExplain(step.highlightKey, dataset.size);
  }

  const demoPopulate = () => {
    const newTable = new HashTable(dataset, []);
    let allSteps: HashTableStep[] = [];
    for (const key of dataset.initial) {
      const stepsForKey = newTable.insert(key);
      allSteps = [...allSteps, ...stepsForKey];
    }
    setTable(newTable);
    setSteps(allSteps);
    setStepIndex(0); // Start at beginning!
    setLog(["Demo population complete!"]);
  };

  const runAlgorithm = () => {
    if (!inputKey) {
      setLog(["Please enter a key."]);
      return;
    }
    const newTable = new HashTable(dataset, []);
    newTable.table = table.table.map((bucket) =>
      bucket.map((entry) => ({ ...entry }))
    );
    let algoSteps: HashTableStep[] = [];
    if (algorithm === "insert") {
      algoSteps = newTable.insert(inputKey);
      if (algoSteps[algoSteps.length - 1]?.message.match(/^Inserted/i)) {
        setTable(newTable);
      }
    } else if (algorithm === "search") {
      algoSteps = newTable.search(inputKey);
    } else if (algorithm === "delete") {
      algoSteps = newTable.delete(inputKey);
      if (algoSteps[algoSteps.length - 1]?.message.match(/^Deleted/i)) {
        setTable(newTable);
      }
    }
    setSteps(algoSteps);
    setStepIndex(0);
    setLog([algoSteps[algoSteps.length - 1]?.message ?? ""]);
  };

  const previousStep = () => setStepIndex((i) => Math.max(i - 1, 0));
  const nextStep = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));

  const currentStep = steps[stepIndex] || {
    table: table.table,
    bucketIndex: undefined,
    message: "Ready",
    highlightKey: "",
  };

  const bucketWidth = 108;
  const bucketHeight = 60;
  const maxBucketLen = Math.max(...currentStep.table.map((b) => b.length), 2);
  const svgHeight = 75 + maxBucketLen * 38;

  return (
    <div className={styles.container}>
      <a href="/" className={styles.backButton}>
        ← Back to Dashboard
      </a>
      <h1 className={styles.title}>Hash Table Visualizer</h1>
      <p className={styles.meta}>
        Explore how a hash table works, with step-by-step demos for insert,
        search, and delete.
      </p>
      <div className={styles.demoSection}>
        <h3 className={styles.demoTitle}>Table Setup & Algorithm Selection</h3>
        <div className={styles.controlsBar}>
          <div className={styles.controlBlock}>
            <label>1. Use Case</label>
            <div className={styles.tabsRow}>
              {(Object.keys(hashTableDatasets) as DatasetKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setDatasetKey(key)}
                  className={`${styles.tab} ${
                    datasetKey === key ? styles.active : ""
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
            <div className={styles.datasetInfo}>{dataset.info}</div>
          </div>
          <div className={styles.controlBlock}>
            <label>2. Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as AlgorithmKey)}
              className={styles.selectDropdown}
            >
              {(Object.keys(algorithmDetails) as AlgorithmKey[]).map((key) => (
                <option key={key} value={key}>
                  {algorithmDetails[key].name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.controlBlock}>
            <label>3. Key</label>
            <div className={styles.inputRow}>
              <input
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className={styles.input}
                placeholder="Enter key"
              />
              <button className={styles.button} onClick={runAlgorithm}>
                Run
              </button>
            </div>
          </div>
          <span className={styles.divider} />
          <div className={styles.runDemoBlock}>
            <button className={styles.button} onClick={demoPopulate}>
              Demo Populate
            </button>
          </div>
        </div>
      </div>

      <div className={styles.hashFuncBox}>
        <strong>Hash Function:</strong>{" "}
        <span className={styles.hashFuncText}>
          {dataset.hashFuncString.replace("size", String(dataset.size))}
        </span>
      </div>

      <div className={styles.visualizer}>
        <svg
          width={bucketWidth * dataset.size + 24}
          height={svgHeight}
          className={styles.hashSvg}
        >
          {currentStep.table.map((bucket, i) => (
            <g key={i} transform={`translate(${i * bucketWidth + 18}, 10)`}>
              <rect
                width={bucketWidth - 18}
                height={bucketHeight}
                rx={12}
                className={`${styles.bucket} ${
                  i === currentStep.bucketIndex ? styles.activeBucket : ""
                }`}
              />
              <text
                x={18}
                y={bucketHeight / 2 + 5}
                className={styles.bucketLabel}
              >
                #{i}
              </text>
              {bucket.map((entry, j) => (
                <g key={entry.key}>
                  <rect
                    y={bucketHeight + j * 38}
                    width={bucketWidth - 32}
                    height={32}
                    rx={8}
                    className={
                      `${styles.chainBox} ` +
                      (entry.key === currentStep.highlightKey
                        ? styles.highlight
                        : "")
                    }
                  />
                  <text
                    x={16}
                    y={bucketHeight + j * 38 + 20}
                    className={styles.chainKey}
                  >
                    {entry.key}
                  </text>
                  {j < bucket.length - 1 && (
                    <line
                      x1={bucketWidth / 2}
                      y1={bucketHeight + j * 38 + 32}
                      x2={bucketWidth / 2}
                      y2={bucketHeight + (j + 1) * 38}
                      className={styles.chainArrow}
                    />
                  )}
                </g>
              ))}
            </g>
          ))}
        </svg>
      </div>

      <div className={styles.stepControls}>
        <button
          onClick={previousStep}
          className={styles.button}
          disabled={stepIndex === 0}
        >
          Previous
        </button>
        <span>
          Step: {steps.length > 0 ? stepIndex + 1 : 0} / {steps.length}
        </span>
        <button
          onClick={nextStep}
          className={styles.button}
          disabled={stepIndex >= steps.length - 1}
        >
          Next
        </button>
      </div>

      <div className={styles.detailsBox}>
        <p className={styles.details}>
          <strong>📌 Current Action:</strong> {currentStep.message}
        </p>
        {getHashExplain(currentStep) && (
          <p className={styles.hashExplain}>
            <strong>Hash Calculation:</strong> {getHashExplain(currentStep)}
          </p>
        )}
      </div>

      {log.length > 0 && (
        <div className={styles.logContainer}>
          <h3>Operation Log</h3>
          <div className={styles.logBox}>
            {log.map((entry, i) => (
              <div key={i}>{entry}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HashTableVisualizer;
