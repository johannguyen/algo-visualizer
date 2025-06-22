import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LinkedList } from "../structures/LinkedList";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./LinkedListVisualizer.module.css";

export default function LinkedListVisualizer() {
  const [list] = useState(new LinkedList<string>());
  const [items, setItems] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const [index, setIndex] = useState("");
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const updateItems = useCallback(() => {
    setItems(list.toArray());
  }, [list]);

  const setupDemo = useCallback(() => {
    list.clear();
    list.insert("Node A");
    list.insert("Node B");
    list.insert("Node C");
    updateItems();
    setCurrentIndex(0);
  }, [list, updateItems]);

  useEffect(() => {
    setupDemo();
  }, [setupDemo]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollLeft = listRef.current.scrollWidth;
    }
  }, [items]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === null || prev >= items.length - 1) {
            clearInterval(interval);
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, items.length]);

  const insertAtHead = () => {
    if (value.trim()) {
      list.insertAtHead(value.trim());
      setValue("");
      updateItems();
    }
  };

  const insertAtTail = () => {
    if (value.trim()) {
      list.insert(value.trim());
      setValue("");
      updateItems();
    }
  };

  const insertAtIndex = () => {
    const val = value.trim();
    const i = parseInt(index);
    if (val && !isNaN(i)) {
      list.insertAt(i, val);
      setValue("");
      setIndex("");
      updateItems();
    }
  };

  const removeHead = () => {
    list.removeHead();
    updateItems();
  };

  const removeTail = () => {
    list.removeTail();
    updateItems();
  };

  const removeAtIndex = () => {
    const i = parseInt(index);
    if (!isNaN(i)) {
      list.removeAt(i);
      setIndex("");
      updateItems();
    }
  };

  const clearList = () => {
    list.clear();
    updateItems();
    setCurrentIndex(null);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      if (prev === null) return 0;
      return Math.min(prev + 1, items.length - 1);
    });
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        ← Back to Dashboard
      </Link>

      <h2 className={styles.title}>📎 Linked List Visualizer</h2>
      <p className={styles.meta}>
        Java: <code>LinkedList&lt;T&gt;</code> | .NET:{" "}
        <code>LinkedList&lt;T&gt;</code>
      </p>

      <div className={styles.listBox} ref={listRef}>
        <AnimatePresence initial={false}>
          {items.map((val, idx) => (
            <motion.div
              key={val + "-" + idx}
              layout
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`${styles.nodeContainer} ${
                currentIndex === idx ? styles.highlighted : ""
              }`}
            >
              <div className={styles.nodeBox}>
                <div className={styles.node}>{val}</div>
              </div>
              {idx < items.length - 1 && <div className={styles.arrow}>→</div>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlRow}>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={styles.input}
            placeholder="Value"
          />
          <input
            value={index}
            onChange={(e) => setIndex(e.target.value)}
            className={`${styles.input} ${styles.indexInput}`}
            placeholder="Index"
            type="number"
          />
          <button
            onClick={insertAtHead}
            className={`${styles.button} ${styles.insert}`}
          >
            Insert Head
          </button>
          <button
            onClick={insertAtTail}
            className={`${styles.button} ${styles.insert}`}
          >
            Insert Tail
          </button>
          <button
            onClick={insertAtIndex}
            className={`${styles.button} ${styles.insert}`}
          >
            Insert @ Index
          </button>
          <button
            onClick={removeHead}
            className={`${styles.button} ${styles.remove}`}
          >
            Remove Head
          </button>
          <button
            onClick={removeTail}
            className={`${styles.button} ${styles.remove}`}
          >
            Remove Tail
          </button>
          <button
            onClick={removeAtIndex}
            className={`${styles.button} ${styles.remove}`}
          >
            Remove @ Index
          </button>
          <button
            onClick={clearList}
            className={`${styles.button} ${styles.secondary}`}
          >
            Clear
          </button>
        </div>
      </div>

      <div className={styles.traversal}>
        <h3>🚀 Traverse the List</h3>
        <div className={styles.traversalButtons}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={styles.button}
            disabled={currentIndex === null || currentIndex >= items.length - 1}
          >
            {isPlaying ? "⏸ Pause" : "▶️ Play"}
          </button>
          <button
            onClick={handleNext}
            className={styles.button}
            disabled={currentIndex === null || currentIndex >= items.length - 1}
          >
            Next ⏩
          </button>
        </div>
        <p>Current Index: {currentIndex !== null ? currentIndex : "None"}</p>
        <p>
          Current Value: {currentIndex !== null ? items[currentIndex] : "None"}
        </p>
      </div>

      <div className={styles.details}>
        <p>
          <strong>📊 Time Complexity:</strong> Insert O(1) at head/tail, O(n) at
          index; Remove O(1) at head, O(n) at tail/index
        </p>
        <p>
          <strong>📦 Space Complexity:</strong> O(n)
        </p>
        <p>
          <strong>👥 Current Size:</strong> {items.length}
        </p>
      </div>

      <section className={styles.info}>
        <h3>🧠 What Is a Singly Linked List?</h3>
        <p>
          A singly linked list is a linear data structure where each element
          (node) contains a value and a reference to the next node in the
          sequence.
        </p>

        <h3>📌 When to Use</h3>
        <ul>
          <li>When memory is limited and you only need forward traversal</li>
          <li>Stack-like behavior (LIFO)</li>
          <li>Queue-like behavior (FIFO)</li>
          <li>Efficient insertion/removal at head or tail</li>
        </ul>
      </section>
    </div>
  );
}
