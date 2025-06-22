import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DoublyLinkedList } from "../structures/DoublyLinkedList";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./DoublyLinkedListVisualizer.module.css";

export default function DoublyLinkedListVisualizer() {
  const [list] = useState(new DoublyLinkedList<string>());
  const [items, setItems] = useState<string[]>([]);
  const [itemsReversed, setItemsReversed] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const [index, setIndex] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const updateItems = useCallback(() => {
    setItems(list.toArray());
    setItemsReversed(list.toArrayReverse());
  }, [list]);

  const setupDemo = useCallback(() => {
    list.clear();
    list.insert("Track 1");
    list.insert("Track 2");
    list.insert("Track 3");
    updateItems();
  }, [list, updateItems]);

  useEffect(() => {
    setupDemo();
  }, [setupDemo]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollLeft = listRef.current.scrollWidth;
    }
  }, [items]);

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
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        ← Back to Dashboard
      </Link>

      <h2 className={styles.title}>🔁 Doubly Linked List Visualizer</h2>
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
              className={styles.node}
            >
              {val}
              {idx < items.length - 1 && (
                <span className={styles.arrow}>↔</span>
              )}
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

      <div className={styles.details}>
        <p>
          <strong>📊 Time Complexity:</strong> Insert O(1), Remove O(1),
          Search/Access O(n)
        </p>
        <p>
          <strong>📦 Space Complexity:</strong> O(n)
        </p>
        <p>
          <strong>👥 Current Size:</strong> {items.length}
        </p>
      </div>

      <section className={styles.info}>
        <h3>🧠 What Is a Doubly Linked List?</h3>
        <p>
          A doubly linked list is a sequence of nodes where each node contains
          links to both the previous and next node. This allows for
          bidirectional traversal.
        </p>

        <h3>📌 When to Use</h3>
        <ul>
          <li>Music playlists with next/previous tracks</li>
          <li>Undo/redo functionality</li>
          <li>Navigation systems like tab managers or slide decks</li>
          <li>Deque (double-ended queue) operations</li>
        </ul>

        <h3>🔍 Reverse Traversal:</h3>
        <p>
          {itemsReversed.length > 0
            ? `Tail → Head: ${itemsReversed.join(" ↔ ")}`
            : "List is empty"}
        </p>
      </section>
    </div>
  );
}
