import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CustomSet } from "../structures/CustomSet";
import styles from "./SetVisualizer.module.css";

export default function SetVisualizer() {
  const [set] = useState(new CustomSet<string>());
  const [value, setValue] = useState("");
  const [items, setItems] = useState<string[]>([]);

  const [demoLog, setDemoLog] = useState<string[]>([]);
  const [demoMode, setDemoMode] = useState<"add" | "has" | "delete" | null>(
    null
  );
  const [demoStep, setDemoStep] = useState(0);

  const updateItems = useCallback(() => {
    setItems(set.values());
  }, [set]);

  useEffect(() => {
    set.add("apple");
    set.add("banana");
    updateItems();
  }, [set, updateItems]);

  const handleAdd = () => {
    if (value.trim()) {
      set.add(value.trim());
      setValue("");
      updateItems();
    }
  };

  const handleDelete = () => {
    if (value.trim()) {
      set.delete(value.trim());
      setValue("");
      updateItems();
    }
  };

  const handleClear = () => {
    set.clear();
    updateItems();
  };

  const runDemoStep = () => {
    const val = value.trim();
    const logs = [...demoLog];

    if (demoMode === "add") {
      if (demoStep === 0) {
        logs.push(`🔍 Checking if "${val}" already exists...`);
      } else if (demoStep === 1) {
        const exists = set.has(val);
        logs.push(
          exists
            ? "⚠️ Already exists → no action taken."
            : "✅ Not found → ready to insert."
        );
      } else if (demoStep === 2) {
        set.add(val);
        logs.push(`📦 Inserted "${val}"`);
        updateItems();
        resetDemo();
      }
    }

    if (demoMode === "has") {
      if (demoStep === 0) {
        logs.push(`🔍 Checking existence of "${val}"...`);
      } else if (demoStep === 1) {
        const found = set.has(val);
        logs.push(found ? "✅ Exists in set." : "❌ Not found in set.");
        resetDemo();
      }
    }

    if (demoMode === "delete") {
      if (demoStep === 0) {
        logs.push(`🗑️ Attempting to delete "${val}"...`);
      } else if (demoStep === 1) {
        const success = set.delete(val);
        logs.push(success ? "✅ Deleted." : "❌ Not found to delete.");
        updateItems();
        resetDemo();
      }
    }

    setDemoLog(logs);
    setDemoStep((prev) => prev + 1);
  };

  const resetDemo = () => {
    setDemoMode(null);
    setDemoStep(0);
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        ← Back to Dashboard
      </Link>

      <h2 className={styles.title}>🔢 Set Visualizer</h2>
      <p className={styles.meta}>
        Java: <code>Set&lt;T&gt;</code> | .NET: <code>HashSet&lt;T&gt;</code>
      </p>

      <div className={styles.controls}>
        <input
          className={styles.input}
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className={`${styles.button} ${styles.insert}`}
        >
          Add
        </button>
        <button
          onClick={handleDelete}
          className={`${styles.button} ${styles.remove}`}
        >
          Delete
        </button>
        <button
          onClick={handleClear}
          className={`${styles.button} ${styles.secondary}`}
        >
          Clear
        </button>
      </div>

      <div className={styles.traversal}>
        <h4>🎓 Demonstrate Step-by-Step</h4>
        <div className={styles.traversalButtons}>
          <button
            onClick={() => {
              setDemoMode("add");
              setDemoLog([]);
              setDemoStep(0);
            }}
            className={`${styles.button} ${
              demoMode === "add" ? styles.active : ""
            }`}
          >
            Demo Add
          </button>
          <button
            onClick={() => {
              setDemoMode("has");
              setDemoLog([]);
              setDemoStep(0);
            }}
            className={`${styles.button} ${
              demoMode === "has" ? styles.active : ""
            }`}
          >
            Demo Check
          </button>
          <button
            onClick={() => {
              setDemoMode("delete");
              setDemoLog([]);
              setDemoStep(0);
            }}
            className={`${styles.button} ${
              demoMode === "delete" ? styles.active : ""
            }`}
          >
            Demo Delete
          </button>
          <button
            onClick={runDemoStep}
            className={styles.button}
            disabled={!demoMode}
          >
            ▶️ Next Step
          </button>
        </div>

        <div className={styles.logBox}>
          {demoLog.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>

      <div className={styles.listBox}>
        {items.map((item, idx) => (
          <div key={idx} className={styles.node}>
            {item}
          </div>
        ))}
      </div>

      <div className={styles.details}>
        <p>
          <strong>📊 Time Complexity:</strong> Add O(1), Has O(1), Delete O(1)
        </p>
        <p>
          <strong>📦 Space Complexity:</strong> O(n)
        </p>
        <p>
          <strong>👥 Current Size:</strong> {items.length}
        </p>
      </div>

      <section className={styles.info}>
        <h3>🧠 What Is a Set?</h3>
        <p>
          A Set is a data structure that stores <strong>unique values</strong>{" "}
          without duplicates. It's ideal for fast membership testing and
          ensuring uniqueness.
        </p>

        <h3>📌 When to Use</h3>
        <ul>
          <li>Remove duplicates from a list</li>
          <li>Fast existence checks</li>
          <li>Track unique visitors, events, etc.</li>
        </ul>
      </section>
    </div>
  );
}
