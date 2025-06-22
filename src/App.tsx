import { Routes, Route } from "react-router-dom";
import StackVisualizer from "./dataStructures/StackVisualizer";
import Dashboard from "./components/Dashboard";
import QueueVisualizer from "./dataStructures/QueueVisualizer";
import LinkedListVisualizer from "./dataStructures/LinkedListVisualizer";
import DoublyLinkedListVisualizer from "./dataStructures/DoubleLinkedListVisualizer";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/stack" element={<StackVisualizer />} />
      <Route path="/queue" element={<QueueVisualizer />} />
      <Route path="/linked-list" element={<LinkedListVisualizer />} />
      <Route
        path="/doubly-linked-list"
        element={<DoublyLinkedListVisualizer />}
      />
    </Routes>
  );
}

export default App;
