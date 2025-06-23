import { useState, type JSX } from "react";
import { Link } from "react-router-dom";
import { AVLTree, AVLNode } from "../structures/AVLTree";
import styles from "./AVLTreeVisualizer.module.css";

interface Person {
  name: string;
}

export default function AVLTreeVisualizer(): JSX.Element {
  const [tree] = useState(
    () => new AVLTree<Person>((a, b) => a.name.localeCompare(b.name))
  );
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [highlight, setHighlight] = useState<Set<string>>(new Set());
  const [log, setLog] = useState<string[]>([]);
  const [path, setPath] = useState<AVLNode<Person>[]>([]);
  const [step, setStep] = useState(0);

  const insertValue = () => {
    const name = input.trim();
    if (!name) return;
    tree.insert({ name });
    setInput("");
    setLog((prev) => [...prev, `➕ Inserted "${name}"`]);
    setHighlight(new Set());
  };

  const searchValue = () => {
    const val = search.trim();
    if (!val) return;
    const p = tree.searchPath({ name: val });
    const names = p.map((n) => n.value.name);
    const found = names[names.length - 1] === val;
    setPath(p);
    setStep(0);
    setHighlight(new Set([names[0]]));
    setLog((prev) => [
      ...prev,
      found
        ? `🔍 Found "${val}" via: ${names.join(" → ")}`
        : `❌ "${val}" not found. Traversed: ${names.join(" → ")}`,
    ]);
    setSearch("");
  };

  const nextStep = () => {
    const names = path.slice(0, step + 2).map((n) => n.value.name);
    setHighlight(new Set(names));
    setStep(step + 1);
  };

  const renderTree = (node: AVLNode<Person> | null): JSX.Element | null => {
    if (!node) return null;
    const isHighlighted = highlight.has(node.value.name);

    return (
      <div
        className={`${styles.nodeBox} ${
          isHighlighted ? styles.highlighted : ""
        }`}
      >
        <div className={styles.node}>{node.value.name}</div>
        <div className={styles.children}>
          {renderTree(node.left)}
          {renderTree(node.right)}
        </div>
      </div>
    );
  };

  const loadDemo = () => {
    tree.clear();
    setLog((prev) => [...prev, "🔄 Demo reset"]);
    ["Emma", "Lucas", "Olivia", "Noah", "Ava", "Liam", "Sophia"].forEach((n) =>
      tree.insert({ name: n })
    );
    setLog((prev) => [
      ...prev,
      "📊 Demo loaded: Emma, Lucas, Olivia, Noah, Ava, Liam, Sophia",
    ]);
    setHighlight(new Set());
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        ← Back to Dashboard
      </Link>
      <h2 className={styles.title}>🌿 AVL Tree (Self-Balancing BST)</h2>
      <p className={styles.meta}>
        Automatically balances after each insertion. Custom object support via
        comparator.
      </p>

      <div className={styles.controlRow}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Insert name"
        />
        <button className={styles.button} onClick={insertValue}>
          Insert
        </button>

        <input
          className={styles.input}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name"
        />
        <button className={styles.button} onClick={searchValue}>
          Search
        </button>

        <button
          className={`${styles.button} ${styles.secondary}`}
          onClick={loadDemo}
        >
          Load Demo
        </button>
      </div>

      <div className={styles.treeArea}>{renderTree(tree.root)}</div>

      {step < path.length - 1 && path.length > 0 && (
        <div className={styles.traversal}>
          <button className={styles.button} onClick={nextStep}>
            ▶️ Next Step
          </button>
          <p>
            Step {step + 1} / {path.length}
          </p>
        </div>
      )}

      <div className={styles.logBox}>
        {log.map((l, i) => (
          <div key={i}>{l}</div>
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
        <h3>🌿 What is an AVL Tree?</h3>
        <p>
          An AVL Tree is a self-balancing binary search tree where the height
          difference (balance factor) between left and right subtrees is at most
          1. It guarantees efficient performance by applying rotations to
          restore balance after each insert or delete operation.
        </p>

        <h4>📌 When to Use</h4>
        <ul>
          <li>When fast and balanced lookups are needed</li>
          <li>Better performance than unbalanced BSTs</li>
          <li>Used in databases, caches, and memory indexing</li>
        </ul>
      </section>
    </div>
  );
}
