import { Routes, Route } from "react-router-dom";
import StackVisualizer from "./dataStructures/StackVisualizer";
import Dashboard from "./components/Dashboard";
import QueueVisualizer from "./dataStructures/QueueVisualizer";
import LinkedListVisualizer from "./dataStructures/LinkedListVisualizer";
import DoublyLinkedListVisualizer from "./dataStructures/DoubleLinkedListVisualizer";
import DequeVisualizer from "./dataStructures/DequeVisualizer";
import HashMapVisualizer from "./dataStructures/HashMapVisualizer";
import SetVisualizer from "./dataStructures/SetVisualizer";
import BinaryTreeVisualizer from "./dataStructures/BinaryTreeVisualizer";
import BSTVisualizer from "./dataStructures/BSTVisualizer";
import AVLTreeVisualizer from "./dataStructures/AVLTreeVisualizer";
import RedBlackTreeVisualizer from "./dataStructures/RedBlackTreeVisualizer";
import HeapVisualizer from "./dataStructures/HeapVisualizer";
import GraphVisualizer from "./dataStructures/GraphVisualizer";
import HashTableVisualizer from "./dataStructures/HashTableVisualizer";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/stack" element={<StackVisualizer />} />
      <Route path="/queue" element={<QueueVisualizer />} />
      <Route path="/linked-list" element={<LinkedListVisualizer />} />
      <Route path="/deque" element={<DequeVisualizer />} />
      <Route
        path="/doubly-linked-list"
        element={<DoublyLinkedListVisualizer />}
      />
      <Route path="/hashmap" element={<HashMapVisualizer />} />
      <Route path="/set" element={<SetVisualizer />} />
      <Route path="/binary-tree" element={<BinaryTreeVisualizer />} />
      <Route path="/binary-search-tree" element={<BSTVisualizer />} />
      <Route path="/avl-tree" element={<AVLTreeVisualizer />} />
      <Route path="/red-black-tree" element={<RedBlackTreeVisualizer />} />
      <Route path="/heap" element={<HeapVisualizer />} />
      <Route path="/graph" element={<GraphVisualizer />} />
      <Route path="/hash-table" element={<HashTableVisualizer />} />
      <Route path="/sorting" element={<div>Sorting Algorithms</div>} />
      <Route path="/searching" element={<div>Searching Algorithms</div>} />
      <Route
        path="/dynamic-programming"
        element={<div>Dynamic Programming</div>}
      />
      <Route path="/backtracking" element={<div>Backtracking</div>} />
      <Route path="/greedy" element={<div>Greedy Algorithms</div>} />
      <Route
        path="/divide-and-conquer"
        element={<div>Divide and Conquer</div>}
      />
    </Routes>
  );
}

export default App;
