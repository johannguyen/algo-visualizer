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
    </Routes>
  );
}

export default App;
