import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LinkedList } from "../structures/LinkedList";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./LinkedListVisualizer.module.css";

type Mode = "custom" | "navigation" | "images";

export default function LinkedListVisualizer() {
  const [list] = useState(new LinkedList<string>());
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("custom");
  const listRef = useRef<HTMLDivElement>(null);

  const setupDemo = useCallback(
    (type: Mode) => {
      list.clear();
      switch (type) {
        case "navigation":
          list.insert("Home");
          list.insert("About");
          list.insert("Contact");
          break;
        case "images":
          list.insert("Image 1");
          list.insert("Image 2");
          list.insert("Image 3");
          break;
        default:
          list.insert("A");
          list.insert("B");
          list.insert("C");
      }
      setItems(list.toArray());
    },
    [list]
  );

  useEffect(() => {
    setupDemo(mode);
  }, [mode, setupDemo]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollLeft = listRef.current.scrollWidth;
    }
  }, [items]);

  const insert = () => {
    if (input.trim()) {
      list.insert(input.trim());
      setItems(list.toArray());
      setInput("");
    }
  };

  const remove = () => {
    list.remove();
    setItems(list.toArray());
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        ← Back to Dashboard
      </Link>

      <h2 className={styles.title}>🔗 Linked List Visualizer</h2>
      <p className={styles.meta}>
        Java: <code>LinkedList&lt;T&gt;</code> | .NET:{" "}
        <code>LinkedList&lt;T&gt;</code>
      </p>

      <div className="mb-4">
        <label className="mr-2 font-medium text-sm text-gray-700">
          Use Case:
        </label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="p-1 border rounded"
        >
          <option value="custom">Custom</option>
          <option value="navigation">Navigation History</option>
          <option value="images">Image Viewer</option>
        </select>
      </div>

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
              <div>
                <span className="font-semibold">{val}</span>
                {idx === 0 && (
                  <div className="text-xs mt-1 text-blue-100">HEAD</div>
                )}
                {idx === items.length - 1 && (
                  <div className="text-xs mt-1 text-yellow-100">TAIL</div>
                )}
              </div>
              {idx < items.length - 1 && (
                <span className={styles.arrow}>→</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {mode === "custom" && (
        <div className={styles.controls}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={styles.input}
            placeholder="Enter value"
          />
          <button
            onClick={insert}
            className={`${styles.button} ${styles.insert}`}
          >
            Insert
          </button>
          <button
            onClick={remove}
            className={`${styles.button} ${styles.remove}`}
          >
            Remove Last
          </button>
        </div>
      )}

      <div className={styles.details}>
        <p>
          <strong>📊 Time Complexity:</strong> Insert O(n), Remove O(n)
        </p>
        <p>
          <strong>📦 Space Complexity:</strong> O(n)
        </p>
        <p>
          <strong>📈 List Size:</strong> {items.length} node(s)
        </p>
        <p>
          <strong>First Node:</strong> {items[0] ?? "None"} |{" "}
          <strong>Last Node:</strong> {items[items.length - 1] ?? "None"}
        </p>
      </div>

      <section className={styles.info}>
        <h3>🧠 What Is a Linked List?</h3>
        <p>
          A linked list stores elements in nodes connected by pointers. Each
          node points to the next, and you can add or remove elements without
          shifting memory.
        </p>

        <h3>📌 When to Use a Linked List</h3>
        <ul>
          <li>
            When you need to frequently insert/remove items (esp. from ends)
          </li>
          <li>Navigation stacks: "Next" and "Previous" like browser history</li>
          <li>Dynamic memory where array resizing is expensive</li>
          <li>Undo/Redo operations in apps</li>
        </ul>

        <h3>🔍 What You See Above</h3>
        <p>
          This simulation shows a{" "}
          <strong>
            {mode === "custom"
              ? "manually updated linked list"
              : mode === "navigation"
              ? "web page navigation history"
              : "photo slideshow with linked transitions"}
          </strong>
          . You can track the list’s head and tail, and understand how a linked
          list stores and transitions values.
        </p>
      </section>
    </div>
  );
}
