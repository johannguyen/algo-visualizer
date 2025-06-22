import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Queue } from "../structures/Queue";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./QueueVisualizer.module.css";

export default function QueueVisualizer() {
  const [queue] = useState(new Queue<string>());
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const queueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queue.enqueue("A");
    queue.enqueue("B");
    queue.enqueue("C");
    setItems(queue.getItems());
  }, [queue]);

  useEffect(() => {
    if (queueRef.current) {
      queueRef.current.scrollLeft = queueRef.current.scrollWidth;
    }
  }, [items]);

  const enqueue = () => {
    if (input.trim()) {
      queue.enqueue(input.trim());
      setItems(queue.getItems());
      setInput("");
    }
  };

  const dequeue = () => {
    queue.dequeue();
    setItems(queue.getItems());
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        ← Back to Dashboard
      </Link>

      <h2 className={styles.title}>🚚 Queue Visualizer</h2>
      <p className={styles.meta}>
        Java: <code>Queue&lt;T&gt;</code> | .NET: <code>Queue&lt;T&gt;</code>
      </p>

      <div className={styles.queueBox} ref={queueRef}>
        <AnimatePresence initial={false}>
          {items.map((val, idx) => (
            <motion.div
              key={`${val}-${idx}`}
              layout
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={styles.queueItem}
            >
              {val}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className={styles.controls}>
        <input
          value={input}
          type="text"
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter any value"
          className={styles.input}
        />
        <button
          onClick={enqueue}
          className={`${styles.button} ${styles.enqueue}`}
        >
          Enqueue
        </button>
        <button
          onClick={dequeue}
          className={`${styles.button} ${styles.dequeue}`}
        >
          Dequeue
        </button>
      </div>

      <div className={styles.details}>
        <p>
          <strong>📊 Time Complexity:</strong> Enqueue O(1), Dequeue O(1), Peek
          O(1)
        </p>
        <p>
          <strong>📦 Space Complexity:</strong> O(n)
        </p>
      </div>

      <section className={styles.info}>
        <h3>🧠 What Is a Queue?</h3>
        <p>
          A queue is a <strong>First-In, First-Out (FIFO)</strong> data
          structure. The first item added is the first one removed.
        </p>

        <h3>📌 When to Use a Queue</h3>
        <ul>
          <li>Task scheduling and print queues</li>
          <li>Breadth-First Search (BFS)</li>
          <li>Streaming data and buffers</li>
          <li>Order processing systems</li>
        </ul>

        <h3>🔍 What You See Above</h3>
        <p>
          The queue starts with <code>"A" → "B" → "C"</code>. Enqueue adds to
          the right (end), dequeue removes from the left (front).
        </p>
      </section>
    </div>
  );
}
