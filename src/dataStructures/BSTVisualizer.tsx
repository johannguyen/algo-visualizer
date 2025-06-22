import { useState, type JSX } from "react";
import { Link } from "react-router-dom";
import { BSTree, TreeNode } from "../structures/BSTree";
import styles from "./BSTVisualizer.module.css";

type Person = { name: string };

export default function BSTVisualizer() {
  const [tree] = useState(
    () => new BSTree<Person>((a, b) => a.name.localeCompare(b.name))
  );
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [highlight, setHighlight] = useState<Set<string>>(new Set());
  const [log, setLog] = useState<string[]>([]);
  const [path, setPath] = useState<TreeNode<Person>[]>([]);
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

  const renderTree = (node: TreeNode<Person> | null): JSX.Element | null => {
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
      <h2 className={styles.title}>📐 Binary Search Tree (Generic Type)</h2>
      <p className={styles.meta}>
        Supports custom types like <code>{`{ name: string }`}</code>
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
          <strong>📊 Time Complexity:</strong> Insert/Search – O(log n) if
          balanced
        </p>
        <p>
          <strong>📦 Space Complexity:</strong> O(n)
        </p>
      </div>

      <section className={styles.info}>
        <h3>🧠 What is a Binary Search Tree?</h3>
        <p>
          A BST organizes elements such that each node’s left child is less than
          itself, and the right is greater — enabling fast lookup and sorted
          storage.
        </p>

        <h4>📌 When to Use</h4>
        <ul>
          <li>Fast sorted lookup for objects (e.g., user names)</li>
          <li>Organizing data in memory with log-time access</li>
          <li>Foundation for balanced trees like AVL, Red-Black</li>
        </ul>
      </section>
    </div>
  );
}
