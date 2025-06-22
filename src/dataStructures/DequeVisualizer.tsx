import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Deque } from "../structures/Deque";
import styles from "./DequeVisualizer.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function DequeVisualizer() {
  const [deque] = useState(new Deque<string>());
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const updateItems = useCallback(() => {
    setItems(deque.toArray());
  }, [deque]);

  const addFront = () => {
    if (input.trim()) {
      deque.addFront(input.trim());
      setInput("");
      updateItems();
    }
  };

  const addBack = () => {
    if (input.trim()) {
      deque.addBack(input.trim());
      setInput("");
      updateItems();
    }
  };

  const removeFront = () => {
    deque.removeFront();
    updateItems();
  };

  const removeBack = () => {
    deque.removeBack();
    updateItems();
  };

  const clearDeque = () => {
    deque.clear();
    updateItems();
  };

  useEffect(() => {
    deque.addBack("Task 1");
    deque.addBack("Task 2");
    deque.addBack("Task 3");
    updateItems();
  }, [deque, updateItems]);
  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        ← Back to Dashboard
      </Link>

      <h2 className={styles.title}>🔁 Deque (Double-Ended Queue) Visualizer</h2>
      <p className={styles.meta}>
        Java: <code>ArrayDeque&lt;T&gt;</code> | .NET:{" "}
        <code>LinkedList&lt;T&gt;</code>
      </p>

      <div className={styles.listBox}>
        <AnimatePresence initial={false}>
          {items.map((val, idx) => (
            <motion.div
              key={val + "-" + idx}
              layout
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={styles.node}
            >
              {val}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className={styles.controls}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter value"
          className={styles.input}
        />
        <div className={styles.buttonRow}>
          <button
            onClick={addFront}
            className={`${styles.button} ${styles.insert}`}
          >
            Add Front
          </button>
          <button
            onClick={addBack}
            className={`${styles.button} ${styles.insert}`}
          >
            Add Back
          </button>
          <button
            onClick={removeFront}
            className={`${styles.button} ${styles.remove}`}
          >
            Remove Front
          </button>
          <button
            onClick={removeBack}
            className={`${styles.button} ${styles.remove}`}
          >
            Remove Back
          </button>
          <button
            onClick={clearDeque}
            className={`${styles.button} ${styles.secondary}`}
          >
            Clear
          </button>
        </div>
      </div>

      <div className={styles.details}>
        <p>
          <strong>📊 Time Complexity:</strong> Add/Remove Front & Back = O(1)
        </p>
        <p>
          <strong>📦 Space Complexity:</strong> O(n)
        </p>
        <p>
          <strong>👥 Current Size:</strong> {items.length}
        </p>
      </div>

      <section className={styles.info}>
        <h3>🧠 What Is a Deque?</h3>
        <p>
          A <strong>Deque</strong> (Double-Ended Queue) allows adding and
          removing items from both the front and the back.
        </p>

        <h3>📌 When to Use</h3>
        <ul>
          <li>Task scheduling where priority might change dynamically</li>
          <li>Sliding window problems in algorithms</li>
          <li>Palindrome checking</li>
          <li>Undo/Redo stacks managed from both ends</li>
        </ul>
      </section>
    </div>
  );
}
