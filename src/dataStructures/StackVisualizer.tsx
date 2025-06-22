import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Stack } from "../structures/Stack";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./StackVisualizer.module.css";

export default function StackVisualizer() {
  const [stack] = useState(new Stack<string>());
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stack.push("A");
    stack.push("B");
    stack.push("C");
    setItems(stack.getItems());
  }, [stack]);

  useEffect(() => {
    if (stackRef.current) {
      stackRef.current.scrollTop = stackRef.current.scrollHeight;
    }
  }, [items]);

  const push = () => {
    if (input.trim()) {
      stack.push(input.trim());
      setItems(stack.getItems());
      setInput("");
    }
  };

  const pop = () => {
    stack.pop();
    setItems(stack.getItems());
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        ← Back to Dashboard
      </Link>

      <h2 className={styles.title}>🧱 Stack Visualizer</h2>
      <p className={styles.meta}>
        Java: <code>Stack&lt;T&gt;</code> | .NET: <code>Stack&lt;T&gt;</code>
      </p>

      <div className={styles.stackBox} ref={stackRef}>
        <AnimatePresence initial={false}>
          {items.map((val, idx) => (
            <motion.div
              key={`${val}-${idx}`}
              layout
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={styles.stackItem}
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
        <button onClick={push} className={`${styles.button} ${styles.push}`}>
          Push
        </button>
        <button onClick={pop} className={`${styles.button} ${styles.pop}`}>
          Pop
        </button>
      </div>

      <div className={styles.details}>
        <p>
          <strong>📊 Time Complexity:</strong> Push O(1), Pop O(1), Peek O(1)
        </p>
        <p>
          <strong>📦 Space Complexity:</strong> O(n)
        </p>
      </div>

      <section className={styles.info}>
        <h3>🧠 What Is a Stack?</h3>
        <p>
          A stack is a <strong>Last-In, First-Out (LIFO)</strong> data
          structure. The last item pushed is the first one to be popped out.
        </p>

        <h3>📌 When to Use a Stack</h3>
        <ul>
          <li>Undo/Redo actions (e.g. in editors)</li>
          <li>Backtracking (e.g. maze solving, recursion)</li>
          <li>Parsing nested expressions (e.g. parentheses)</li>
          <li>Depth-First Search (DFS) in trees/graphs</li>
        </ul>

        <h3>🔍 What You See Above</h3>
        <p>
          The stack starts with <code>"A" → "B" → "C"</code>. You can push new
          values like "Apple" or "42" to the top. Watch how the top-most item is
          always removed first when popping.
        </p>
      </section>
    </div>
  );
}
