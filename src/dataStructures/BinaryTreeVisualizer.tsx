import { useCallback, useState, type JSX } from "react";
import { TreeNode, BinaryTree } from "../structures/BinaryTree";
import { Link } from "react-router-dom";
import styles from "./BinaryTreeVisualizer.module.css";

type DemoType = "none" | "org" | "game";

export default function BinaryTreeVisualizer() {
  const [tree] = useState(() => new BinaryTree<string>());
  const [root, setRoot] = useState<TreeNode<string> | null>(null);
  const [highlight, setHighlight] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [demo, setDemo] = useState<DemoType>("none");

  const [gameNode, setGameNode] = useState<TreeNode<string> | null>(null);
  const [gamePath, setGamePath] = useState<string[]>([]);

  const setupOrgChart = useCallback(() => {
    const ceo = new TreeNode("CEO");
    ceo.left = new TreeNode("CTO");
    ceo.right = new TreeNode("CFO");

    ceo.left.left = new TreeNode("Dev Lead");
    ceo.left.right = new TreeNode("QA Lead");
    ceo.left.left.left = new TreeNode("Frontend Dev");
    ceo.left.left.right = new TreeNode("Backend Dev");

    ceo.right.left = new TreeNode("Accountant");
    ceo.right.right = new TreeNode("Analyst");
    ceo.right.right.right = new TreeNode("Data Scientist");

    tree.root = ceo;
    setRoot(ceo);
    setDemo("org");
    setHighlight(new Set());
    setLog([]);
  }, [tree]);

  const setupGame = useCallback(() => {
    const start = new TreeNode("See an enemy?");
    start.left = new TreeNode("Engage or retreat?");
    start.right = new TreeNode("Hide or distract?");
    start.left.left = new TreeNode("Fight bravely");
    start.left.right = new TreeNode("Run away");
    start.left.left.left = new TreeNode("Use sword");
    start.left.left.right = new TreeNode("Use bow");
    start.right.right = new TreeNode("Throw distraction");
    start.right.left = new TreeNode("Hide in bushes");
    start.right.right.right = new TreeNode("Throw rock");

    tree.root = start;
    setRoot(start);
    setGameNode(start);
    setGamePath([]);
    setDemo("game");
    setHighlight(new Set());
    setLog([]);
  }, [tree]);

  const dfsSearch = (
    node: TreeNode<string> | null,
    target: string,
    path: string[]
  ): boolean => {
    if (!node) return false;
    path.push(node.value);
    if (node.value.toLowerCase() === target.toLowerCase()) return true;
    if (dfsSearch(node.left, target, path)) return true;
    if (dfsSearch(node.right, target, path)) return true;
    path.pop();
    return false;
  };

  const searchOrg = () => {
    const path: string[] = [];
    const found = dfsSearch(root, search.trim(), path);
    setHighlight(new Set(found ? path : []));
  };

  const handleGameClick = (selected: TreeNode<string>) => {
    if (!selected) return;
    setGamePath((prev) => [...prev, selected.value]);
    if (!selected.left && !selected.right) {
      setLog([`🎯 Final decision: ${selected.value}`]);
      setGameNode(null);
    } else {
      setGameNode(selected);
    }
  };

  const renderNode = (node: TreeNode<string> | null): JSX.Element | null => {
    if (!node) return null;
    const isHighlighted = highlight.has(node.value);
    const isInGamePath = gamePath.includes(node.value);

    return (
      <div
        className={`${styles.nodeBox} ${
          isHighlighted || isInGamePath ? styles.highlighted : ""
        }`}
      >
        <div className={styles.node}>{node.value}</div>
        <div className={styles.children}>
          {node.left && renderNode(node.left)}
          {node.right && renderNode(node.right)}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        ← Back to Dashboard
      </Link>
      <h2 className={styles.title}>🌳 Binary Tree Visualizer</h2>
      <p className={styles.meta}>
        Java: <code>BinaryTree&lt;T&gt;</code> | .NET:{" "}
        <code>BinaryTree&lt;T&gt;</code>
      </p>

      <div className={styles.buttonRow}>
        <button className={styles.button} onClick={setupOrgChart}>
          Org Chart
        </button>
        <button className={styles.button} onClick={setupGame}>
          Game Decision
        </button>
      </div>

      {demo === "org" && (
        <div className={styles.controlRow}>
          <input
            className={styles.input}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name (e.g. QA Lead)"
          />
          <button className={styles.button} onClick={searchOrg}>
            Search
          </button>
        </div>
      )}

      <div className={styles.treeArea}>{renderNode(root)}</div>

      {demo === "game" && gameNode && (
        <div className={styles.gameArea}>
          <h3>🎮 Make a Decision</h3>
          <p className={styles.gameNode}>Q: {gameNode.value}</p>
          <div className={styles.decisionButtons}>
            {gameNode.left && (
              <button
                onClick={() => handleGameClick(gameNode.left!)}
                className={styles.button}
              >
                {gameNode.left.value}
              </button>
            )}
            {gameNode.right && (
              <button
                onClick={() => handleGameClick(gameNode.right!)}
                className={styles.button}
              >
                {gameNode.right.value}
              </button>
            )}
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className={styles.logBox}>
          {log.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      <div className={styles.details}>
        <p>
          <strong>📊 Time Complexity:</strong> Insert O(log n) (balanced),
          Traversal O(n)
        </p>
        <p>
          <strong>📦 Space Complexity:</strong> O(n)
        </p>
      </div>

      <section className={styles.info}>
        <h3>🧠 What is a Binary Tree?</h3>
        <p>
          A binary tree is a structure where each node has up to two children.
          It's used in parsing, routing, decision-making, and balancing
          structures like heaps, BSTs, and expression trees.
        </p>

        <h4>📌 When to Use</h4>
        <ul>
          <li>Modeling decision flows or games</li>
          <li>Storing hierarchical data (like org charts)</li>
          <li>Enabling fast insert/search (in BSTs)</li>
          <li>Recursion-based traversal, such as expression evaluation</li>
        </ul>
      </section>
    </div>
  );
}
