import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { HashMap } from "../structures/Hashmap";
import styles from "./HashMapVisualizer.module.css";

export default function HashMapVisualizer() {
  const [map] = useState(new HashMap<string, string>());
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [entries, setEntries] = useState<[string, string][]>([]);

  const [demoLog, setDemoLog] = useState<string[]>([]);
  const [demoMode, setDemoMode] = useState<
    "insert" | "lookup" | "delete" | null
  >(null);
  const [demoStep, setDemoStep] = useState(0);

  const updateEntries = useCallback(() => {
    setEntries(map.entries());
  }, [map]);

  useEffect(() => {
    map.set("name", "Alice");
    map.set("city", "Helsinki");
    updateEntries();
  }, [map, updateEntries]);

  const handleSet = () => {
    if (key.trim() && value.trim()) {
      map.set(key.trim(), value.trim());
      setKey("");
      setValue("");
      updateEntries();
    }
  };

  const handleDelete = () => {
    if (key.trim()) {
      map.delete(key.trim());
      setKey("");
      updateEntries();
    }
  };

  const handleClear = () => {
    map.clear();
    updateEntries();
  };

  const runDemoStep = () => {
    const trimmedKey = key.trim();
    const trimmedValue = value.trim();
    const newLogs = [...demoLog];

    if (demoMode === "insert") {
      if (demoStep === 0) {
        newLogs.push(`🔍 Checking if key "${trimmedKey}" exists...`);
      } else if (demoStep === 1) {
        const exists = map.has(trimmedKey);
        newLogs.push(
          exists
            ? "✅ Key exists → updating value."
            : "🆕 Key not found → inserting."
        );
      } else if (demoStep === 2) {
        map.set(trimmedKey, trimmedValue);
        newLogs.push(`📦 Inserted "${trimmedKey}": "${trimmedValue}"`);
        updateEntries();
        setDemoMode(null);
        setDemoStep(0);
      }
    } else if (demoMode === "lookup") {
      if (demoStep === 0) {
        newLogs.push(`🔍 Looking up key "${trimmedKey}"...`);
      } else if (demoStep === 1) {
        const val = map.get(trimmedKey);
        newLogs.push(val ? `✅ Found: "${val}"` : "❌ Key not found.");
        setDemoMode(null);
        setDemoStep(0);
      }
    } else if (demoMode === "delete") {
      if (demoStep === 0) {
        newLogs.push(`🗑️ Attempting to delete key "${trimmedKey}"...`);
      } else if (demoStep === 1) {
        const success = map.delete(trimmedKey);
        newLogs.push(
          success ? "✅ Deleted successfully." : "❌ Key not found."
        );
        updateEntries();
        setDemoMode(null);
        setDemoStep(0);
      }
    }

    setDemoLog(newLogs);
    setDemoStep((prev) => prev + 1);
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        ← Back to Dashboard
      </Link>

      <h2 className={styles.title}>🔓 HashMap Visualizer</h2>
      <p className={styles.meta}>
        Java: <code>HashMap&lt;K, V&gt;</code> | .NET:{" "}
        <code>Dictionary&lt;K, V&gt;</code>
      </p>

      <div className={styles.controls}>
        <input
          className={styles.input}
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <input
          className={styles.input}
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          onClick={handleSet}
          className={`${styles.button} ${styles.insert}`}
        >
          Set
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
        <h4>🎓 Demonstrate Operation Step-by-Step</h4>
        <div className={styles.traversalButtons}>
          <button
            onClick={() => {
              setDemoMode("insert");
              setDemoStep(0);
              setDemoLog([]);
            }}
            className={`${styles.button} ${
              demoMode === "insert" ? styles.active : ""
            }`}
          >
            Demo Insert
          </button>
          <button
            onClick={() => {
              setDemoMode("lookup");
              setDemoStep(0);
              setDemoLog([]);
            }}
            className={`${styles.button} ${
              demoMode === "lookup" ? styles.active : ""
            }`}
          >
            Demo Lookup
          </button>
          <button
            onClick={() => {
              setDemoMode("delete");
              setDemoStep(0);
              setDemoLog([]);
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

      <div className={styles.table}>
        <div className={styles.header}>
          <span>Key</span>
          <span>Value</span>
        </div>
        {entries.map(([k, v]) => (
          <div className={styles.row} key={k}>
            <span className={styles.cell}>{k}</span>
            <span className={styles.cell}>{v}</span>
          </div>
        ))}
      </div>

      <div className={styles.details}>
        <p>
          <strong>📊 Time Complexity:</strong> Insert O(1), Get O(1), Delete
          O(1)
        </p>
        <p>
          <strong>📦 Space Complexity:</strong> O(n)
        </p>
        <p>
          <strong>👥 Current Size:</strong> {entries.length}
        </p>
      </div>

      <section className={styles.info}>
        <h3>🧠 What Is a HashMap?</h3>
        <p>
          A HashMap is a key-value store optimized for fast access. It uses a
          hash function to compute an index into an array of buckets, from which
          the desired value can be found.
        </p>

        <h3>📌 When to Use</h3>
        <ul>
          <li>Constant time lookup for dynamic key-based access</li>
          <li>
            Quickly associate values with IDs (like usernames or product SKUs)
          </li>
          <li>Fast frequency counting or caching</li>
        </ul>
      </section>
    </div>
  );
}
