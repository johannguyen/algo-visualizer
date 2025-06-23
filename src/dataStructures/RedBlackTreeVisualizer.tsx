// components/RedBlackTreeVisualizer.tsx

import { useState, type JSX } from "react";
import { Link } from "react-router-dom";
import {
  RedBlackTree,
  Color,
  type RBTNode,
  type StepInfo,
} from "../structures/RedBlackTree";
import styles from "./RedBlackTreeVisualizer.module.css";

interface DataItem {
  id: number;
  label: string;
}

export default function RedBlackTreeVisualizer(): JSX.Element {
  const [tree] = useState(
    () => new RedBlackTree<DataItem>((a, b) => a.id - b.id)
  );
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<StepInfo<DataItem>[]>([]);
  const [step, setStep] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [insertedValue, setInsertedValue] = useState<string | null>(null);

  const insertValue = () => {
    const id = parseInt(input.trim());
    if (isNaN(id)) return;
    const item = { id, label: input.trim() };
    tree.insert(item);
    const s = tree.getSteps();
    setSteps(s);
    setStep(0);
    setInsertedValue(item.label);
    setInput("");
    setLog([
      `🟢 Begin inserting "${item.label}"`,
      ...s.map((step) => `📌 ${step.description}`),
    ]);
  };

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const renderTree = (node: RBTNode<DataItem> | null): JSX.Element | null => {
    if (!node) return null;
    return (
      <div className={styles.node}>
        <div
          className={`${styles.circle} ${
            node.color === Color.RED ? styles.red : styles.black
          }`}
        >
          {node.data.label}
        </div>
        <div className={styles.children}>
          <div className={styles.lineContainer}>{renderTree(node.left)}</div>
          <div className={styles.lineContainer}>{renderTree(node.right)}</div>
        </div>
      </div>
    );
  };

  const loadDemo = () => {
    tree.getSteps().length = 0;
    [10, 20, 30, 15, 25, 5].forEach((id) =>
      tree.insert({ id, label: `${id}` })
    );
    const demoSteps = tree.getSteps();
    setSteps(demoSteps);
    setStep(0);
    setInsertedValue(null);
    setLog([
      `📊 Demo loaded: 10, 20, 30, 15, 25, 5`,
      ...demoSteps.map((s) => `📌 ${s.description}`),
    ]);
  };

  const currentStep = steps[step];

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        ← Back to Dashboard
      </Link>
      <h2 className={styles.title}>🔴⚫ Red-Black Tree Visualizer</h2>
      <p className={styles.meta}>
        Step-by-step visualization of insertions including comparisons,
        recoloring, and rotations.
      </p>

      <div className={styles.controlRow}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Insert number"
        />
        <button className={styles.button} onClick={insertValue}>
          Insert
        </button>
        <button
          className={`${styles.button} ${styles.secondary}`}
          onClick={loadDemo}
        >
          Load Demo
        </button>
      </div>

      <div className={styles.treeArea}>
        {renderTree(currentStep?.tree ?? null)}
      </div>

      {steps.length > 0 && (
        <div className={styles.traversal}>
          <button
            className={styles.button}
            onClick={nextStep}
            disabled={step >= steps.length - 1}
          >
            ▶️ Next Step
          </button>
          <p>
            Step {step + 1} / {steps.length}
          </p>
          <p className={styles.description}>{currentStep?.description}</p>
        </div>
      )}

      {insertedValue && (
        <div className={styles.contextBox}>
          <p>
            <strong>🔍 Inserting:</strong> {insertedValue}
          </p>
          <p>
            <strong>📘 Explanation:</strong> Follow each step to see how the
            tree decides where to insert, rotate, or recolor.
          </p>
        </div>
      )}

      <div className={styles.logBox}>
        {log.map((entry, i) => (
          <div key={i}>{entry}</div>
        ))}
      </div>

      <div className={styles.details}>
        <p>
          <strong>📊 Time Complexity:</strong> Insert/Search – O(log n)
        </p>
        <p>
          <strong>📦 Space Complexity:</strong> O(n)
        </p>
      </div>

      <section className={styles.info}>
        <h3>🔴⚫ What is a Red-Black Tree?</h3>
        <p>
          A Red-Black Tree is a self-balancing binary search tree. It maintains
          balance using coloring and rotations, ensuring efficient operations.
        </p>
        <h4>📌 When to Use</h4>
        <ul>
          <li>Fast insertions/searches with consistent balance</li>
          <li>Used in compilers, databases, and memory allocators</li>
          <li>Maintains tree height at O(log n)</li>
        </ul>
      </section>
    </div>
  );
}
