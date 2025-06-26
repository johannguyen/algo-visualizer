import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const items = [
    { name: "Stack", path: "/stack" },
    { name: "Queue", path: "/queue" },
    { name: "Linked List", path: "/linked-list" },
    { name: "Doubly Linked List", path: "/doubly-linked-list" },
    { name: "Deque", path: "/deque" },
    { name: "HashMap", path: "/hashmap" },
    { name: "Set", path: "/set" },
    { name: "Binary Tree", path: "/binary-tree" },
    { name: "Binary Search Tree", path: "/binary-search-tree" },
    { name: "AVL Tree", path: "/avl-tree" },
    { name: "Red-Black Tree", path: "/red-black-tree" },
    { name: "Heap", path: "/heap" },
    { name: "Graph", path: "/graph" },
    { name: "Hash Table", path: "/hash-table" },
    { name: "Sorting Algorithms", path: "/sorting" },
    { name: "Searching Algorithms", path: "/searching" },
    { name: "Dynamic Programming", path: "/dynamic-programming" },
    { name: "Backtracking", path: "/backtracking" },
    { name: "Greedy Algorithms", path: "/greedy" },
    { name: "Divide and Conquer", path: "/divide-and-conquer" },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🧠 Algorithm & Data Structure Visualizer</h1>
      <div className={styles.grid}>
        {items.map((item) => (
          <div
            key={item.name}
            onClick={() => navigate(item.path)}
            className={styles.card}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}
