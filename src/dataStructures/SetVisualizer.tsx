// src/components/SetVisualizer.tsx

import React, { useState, useEffect } from "react";
import { CustomSet, type CustomSetStep } from "../structures/CustomSet";
import styles from "./SetVisualizer.module.css";

// Java-style hash function
const javaStringHash = (key: string): number => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (31 * hash + key.charCodeAt(i)) | 0;
  }
  return hash;
};

const setDatasets = {
  fruits: {
    info: "CustomSet of fruits: see unique membership, collisions, and bucket chaining.",
    size: 7,
    hashFunc: (v: string, size: number) => Math.abs(javaStringHash(v) % size),
    hashFuncString: `Java: hash = 31 * hash + c; bucket = |hash| % size`,
    hashFuncExplain: (v: string, size: number) => {
      let steps = [];
      let hash = 0;
      for (let i = 0; i < v.length; i++) {
        const prev = hash;
        hash = (31 * hash + v.charCodeAt(i)) | 0;
        steps.push(
          `step ${i + 1}: 31*${prev} + '${v[i]}'(${v.charCodeAt(i)}) = ${hash}`
        );
      }
      const absHash = Math.abs(hash);
      return `${steps.join("; ")}; |hash| % ${size} = ${absHash % size}`;
    },
    initial: ["apple", "pear", "plum", "peach", "melon", "banana"],
  },
  names: {
    info: "Names CustomSet: demonstrates collisions and duplicates.",
    size: 5,
    hashFunc: (v: string, size: number) => Math.abs(javaStringHash(v) % size),
    hashFuncString: `Java: hash = 31 * hash + c; bucket = |hash| % size`,
    hashFuncExplain: (v: string, size: number) => {
      let steps = [];
      let hash = 0;
      for (let i = 0; i < v.length; i++) {
        const prev = hash;
        hash = (31 * hash + v.charCodeAt(i)) | 0;
        steps.push(
          `step ${i + 1}: 31*${prev} + '${v[i]}'(${v.charCodeAt(i)}) = ${hash}`
        );
      }
      const absHash = Math.abs(hash);
      return `${steps.join("; ")}; |hash| % ${size} = ${absHash % size}`;
    },
    initial: ["Amy", "Ann", "Ali", "Ben", "Bob", "Bea"],
  },
} as const;

type DatasetKey = keyof typeof setDatasets;
type AlgoKey = "add" | "remove" | "contains";
const algorithmDetails: Record<AlgoKey, { name: string; needsValue: boolean }> =
  {
    add: { name: "Add", needsValue: true },
    remove: { name: "Remove", needsValue: true },
    contains: { name: "Check/Contains", needsValue: true },
  };

const SetVisualizer: React.FC = () => {
  const [datasetKey, setDatasetKey] = useState<DatasetKey>("fruits");
  const dataset = setDatasets[datasetKey];
  const [setModel, setSetModel] = useState<CustomSet>(
    new CustomSet(dataset, dataset.initial)
  );
  const [algorithm, setAlgorithm] = useState<AlgoKey>("add");
  const [inputValue, setInputValue] = useState<string>("");
  const [steps, setSteps] = useState<CustomSetStep[]>([]);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    setSetModel(new CustomSet(dataset, dataset.initial));
    setSteps([]);
    setStepIndex(0);
    setLog([]);
    setInputValue("");
    // eslint-disable-next-line
  }, [datasetKey, dataset]);

  function getHashExplain(step: CustomSetStep): string | null {
    if (!step.highlightValue || step.bucketIndex == null) return null;
    if (!/hash/i.test(step.message)) return null;
    return dataset.hashFuncExplain(step.highlightValue, dataset.size);
  }

  const demoPopulate = () => {
    const newSet = new CustomSet(dataset, []);
    let allSteps: CustomSetStep[] = [];
    for (const v of dataset.initial) {
      const stepsForVal = newSet.add(v);
      allSteps = [...allSteps, ...stepsForVal];
    }
    setSetModel(newSet);
    setSteps(allSteps);
    setStepIndex(0);
    setLog(["Demo population complete!"]);
  };

  const runAlgorithm = () => {
    if (!inputValue) {
      setLog(["Please enter a value."]);
      return;
    }
    const newSet = new CustomSet(dataset, []);
    newSet.table = setModel.table.map((bucket) => [...bucket]);
    let algoSteps: CustomSetStep[] = [];
    if (algorithm === "add") {
      algoSteps = newSet.add(inputValue);
      if (algoSteps[algoSteps.length - 1]?.message.match(/^Inserted/i)) {
        setSetModel(newSet);
      }
    } else if (algorithm === "contains") {
      algoSteps = newSet.contains(inputValue);
    } else if (algorithm === "remove") {
      algoSteps = newSet.remove(inputValue);
      if (algoSteps[algoSteps.length - 1]?.message.match(/^Deleted/i)) {
        setSetModel(newSet);
      }
    }
    setSteps(algoSteps);
    setStepIndex(0);
    setLog([algoSteps[algoSteps.length - 1]?.message ?? ""]);
  };

  const previousStep = () => setStepIndex((i) => Math.max(i - 1, 0));
  const nextStep = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));

  const currentStep = steps[stepIndex] || {
    table: setModel.table,
    bucketIndex: undefined,
    message: "Ready",
    highlightValue: "",
    compareIndices: [],
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
      <h1 className={styles.title}>CustomSet Visualizer</h1>
      <p className={styles.meta}>
        Visualize how a CustomSet (like Java's <code>HashSet</code> or Python's{" "}
        <code>set</code>) works, step by step.
        <br />
        <strong>Insert:</strong> Only adds unique values.
        <br />
        <strong>Check:</strong> Searches within the bucket, comparing each
        element.
        <br />
        <strong>Remove:</strong> Deletes the value if present.
      </p>
      <div className={styles.controlsBar}>
        <div className={styles.controlBlock}>
          <label>1. Use Case</label>
          <div className={styles.tabsRow}>
            {(Object.keys(setDatasets) as DatasetKey[]).map((key) => (
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
          <label>2. Operation</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as AlgoKey)}
            className={styles.selectDropdown}
          >
            {(Object.keys(algorithmDetails) as AlgoKey[]).map((key) => (
              <option key={key} value={key}>
                {algorithmDetails[key].name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.controlBlock}>
          <label>3. Value</label>
          <div className={styles.inputRow}>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={styles.input}
              placeholder="Enter value"
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
                <g key={entry}>
                  <rect
                    y={bucketHeight + j * 38}
                    width={bucketWidth - 32}
                    height={32}
                    rx={8}
                    className={
                      `${styles.chainBox} ` +
                      (i === currentStep.bucketIndex &&
                      currentStep.compareIndices?.includes(j)
                        ? styles.highlight
                        : "")
                    }
                  />
                  <text
                    x={16}
                    y={bucketHeight + j * 38 + 20}
                    className={styles.chainKey}
                  >
                    {entry}
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

export default SetVisualizer;
