// src/components/HeapVisualizer.tsx

import { useState, type JSX } from "react";
import { Link } from "react-router-dom";
import { Heap, type HeapStep } from "../structures/Heap";
import styles from "./HeapVisualizer.module.css";

// --- Type Definitions for all data structures ---
interface GraphNode {
  id: string;
  x: number;
  y: number;
}
interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}
interface DijkstraStep {
  heapState: HeapNode[];
  distances: { [node: string]: number };
  previous: { [node: string]: string | null };
  currentNodeId: string | null;
  neighborId: string | null;
  pathUpdated: boolean;
  description: string;
  visited: Set<string>;
}
interface Task {
  name: string;
  priority: number;
}
interface NodeWithDistance {
  id: string;
  distance: number;
}
interface Event {
  description: string;
  time: number;
}
interface StreamItem<T> {
  value: T;
  listIndex: number;
  elementIndex: number;
}

type HeapNode = number | Task | NodeWithDistance | Event | StreamItem<number>;

// --- Type Guards and Comparators ---
const isTask = (node: HeapNode): node is Task =>
  typeof node === "object" && node !== null && "priority" in node;
const isNodeWithDistance = (node: HeapNode): node is NodeWithDistance =>
  typeof node === "object" && node !== null && "distance" in node;
const isEvent = (node: HeapNode): node is Event =>
  typeof node === "object" && node !== null && "time" in node;
const isStreamItem = (node: HeapNode): node is StreamItem<number> =>
  typeof node === "object" && node !== null && "listIndex" in node;

const minComparator = (a: HeapNode, b: HeapNode): number => {
  let valA: number, valB: number;
  if (isTask(a)) valA = a.priority;
  else if (isNodeWithDistance(a)) valA = a.distance;
  else if (isEvent(a)) valA = a.time;
  else if (isStreamItem(a)) valA = a.value;
  else valA = a;
  if (isTask(b)) valB = b.priority;
  else if (isNodeWithDistance(b)) valB = b.distance;
  else if (isEvent(b)) valB = b.time;
  else if (isStreamItem(b)) valB = b.value;
  else valB = b;
  return valA - valB;
};
const maxComparator = (a: HeapNode, b: HeapNode): number => minComparator(b, a);

export default function HeapVisualizer(): JSX.Element {
  const [heapType] = useState<"min" | "max">("min");
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);

  // State for generic demos
  const [steps, setSteps] = useState<HeapStep<HeapNode>[]>([]);
  const [stepIndex, setStepIndex] = useState<number>(0);

  // State for Dijkstra's geometric demo
  const [dijkstraSteps, setDijkstraSteps] = useState<DijkstraStep[]>([]);
  const [dijkstraStepIndex, setDijkstraStepIndex] = useState(0);
  const [isDijkstraDemo, setIsDijkstraDemo] = useState(false);

  const [log, setLog] = useState<string[]>([]);

  // Single function to reset all state before running a demo
  const resetState = () => {
    setSteps([]);
    setStepIndex(0);
    setDijkstraSteps([]);
    setDijkstraStepIndex(0);
    setIsDijkstraDemo(false);
    setLog([]);
  };

  const runDemo = async (demoFn: () => void) => {
    setIsDemoRunning(true);
    resetState();
    await new Promise((resolve) => setTimeout(resolve, 50));
    demoFn();
    setIsDemoRunning(false);
  };

  // --- All 6 Demo Functions with Logging Restored ---

  const demoPriorityQueue = (): void => {
    setIsDijkstraDemo(false);
    const demoHeap = new Heap<Task>(
      heapType === "min" ? minComparator : maxComparator
    );
    const tasks: Task[] = [
      { name: "Low battery", priority: 30 },
      { name: "Critical update", priority: 10 },
      { name: "Background sync", priority: 99 },
      { name: "User action", priority: 20 },
    ];
    const allDemoSteps: HeapStep<Task>[] = [];
    const demoLog: string[] = [`🚀 Starting Priority Queue Demo...`];

    tasks.forEach((task) => {
      demoLog.push(`Inserting "${task.name}" (priority: ${task.priority})`);
      demoHeap.insert(task);
      allDemoSteps.push(...demoHeap.getSteps());
    });

    demoLog.push("✅ All tasks inserted. Now extracting by priority...");
    while (demoHeap.size() > 0) {
      const task = demoHeap.extractRoot()!;
      demoLog.push(`Extracting "${task.name}"...`);
      allDemoSteps.push(...demoHeap.getSteps());
    }
    demoLog.push("🏁 Demo Complete!");
    setSteps(allDemoSteps as HeapStep<HeapNode>[]);
    setLog(demoLog);
  };

  const demoTopKElements = (): void => {
    setIsDijkstraDemo(false);
    const k = 3;
    const data = [90, 85, 95, 100, 80, 75, 98, 88];
    const minHeap = new Heap<number>(minComparator);
    const allDemoSteps: HeapStep<number>[] = [];
    const demoLog: string[] = [`🚀 Demo: Finding Top ${k} Elements...`];
    data.forEach((item) => {
      demoLog.push(`Processing item: ${item}`);
      if (minHeap.size() < k) {
        demoLog.push(`   - Heap has < ${k} items. Inserting ${item}.`);
        minHeap.insert(item);
      } else if (item > (minHeap.getData()[0] ?? -Infinity)) {
        demoLog.push(
          `   - ${item} > heap's smallest (${
            minHeap.getData()[0]
          }). Replacing...`
        );
        minHeap.extractRoot();
        allDemoSteps.push(...minHeap.getSteps());
        minHeap.insert(item);
      } else {
        demoLog.push(
          `   - ${item} is not larger than heap's smallest. Ignoring.`
        );
      }
      allDemoSteps.push(...minHeap.getSteps());
    });
    demoLog.push(`🏁 Demo Complete! Heap contains top ${k} elements.`);
    setSteps(allDemoSteps as HeapStep<HeapNode>[]);
    setLog(demoLog);
  };

  const demoEventScheduler = (): void => {
    setIsDijkstraDemo(false);
    const minHeap = new Heap<Event>(minComparator);
    const allDemoSteps: HeapStep<Event>[] = [];
    const demoLog: string[] = [`🚀 Demo: Event Scheduler...`];
    const events: Event[] = [
      { description: "Send analytics", time: 1050 },
      { description: "Check updates", time: 300 },
      { description: "Render UI", time: 100 },
      { description: "User click", time: 101 },
    ];
    events.forEach((event) => {
      demoLog.push(`Scheduling: "${event.description}" at time ${event.time}`);
      minHeap.insert(event);
      allDemoSteps.push(...minHeap.getSteps());
    });
    demoLog.push(`--- Executing events in order ---`);
    while (minHeap.size() > 0) {
      const event = minHeap.extractRoot()!;
      demoLog.push(`Executing @ ${event.time}: "${event.description}"`);
      allDemoSteps.push(...minHeap.getSteps());
    }
    demoLog.push(`🏁 Demo Complete!`);
    setSteps(allDemoSteps as HeapStep<HeapNode>[]);
    setLog(demoLog);
  };

  const demoMergeKSortedLists = (): void => {
    setIsDijkstraDemo(false);
    const lists = [
      [1, 4, 5],
      [1, 3, 4],
      [2, 6],
    ];
    const minHeap = new Heap<StreamItem<number>>(minComparator);
    const allDemoSteps: HeapStep<StreamItem<number>>[] = [];
    const demoLog: string[] = [`🚀 Demo: Merging K Sorted Lists...`];
    const mergedList: number[] = [];
    lists.forEach((list, listIndex) => {
      if (list.length > 0) {
        demoLog.push(
          `Inserting first element from list #${listIndex}: ${list[0]}`
        );
        minHeap.insert({ value: list[0], listIndex, elementIndex: 0 });
        allDemoSteps.push(...minHeap.getSteps());
      }
    });
    demoLog.push(`--- Extracting from heap to build merged list ---`);
    while (minHeap.size() > 0) {
      const { value, listIndex, elementIndex } = minHeap.extractRoot()!;
      mergedList.push(value);
      demoLog.push(
        `Extracted ${value} (from list #${listIndex}). Merged: [${mergedList.join(
          ", "
        )}]`
      );
      allDemoSteps.push(...minHeap.getSteps());
      const nextElementIndex = elementIndex + 1;
      if (nextElementIndex < lists[listIndex].length) {
        const nextValue = lists[listIndex][nextElementIndex];
        demoLog.push(
          `   -> Inserting next from list #${listIndex}: ${nextValue}`
        );
        minHeap.insert({
          value: nextValue,
          listIndex,
          elementIndex: nextElementIndex,
        });
        allDemoSteps.push(...minHeap.getSteps());
      }
    }
    demoLog.push(
      `🏁 Demo Complete! Final Merged List: [${mergedList.join(", ")}]`
    );
    setSteps(allDemoSteps as HeapStep<HeapNode>[]);
    setLog(demoLog);
  };

  const demoMedianOfStream = (): void => {
    setIsDijkstraDemo(false);
    const low = new Heap<number>(maxComparator);
    const high = new Heap<number>(minComparator);
    const stream = [5, 15, 1, 3, 8, 7, 9];
    const demoLog: string[] = [`🚀 Demo: Finding Median of a Stream...`];
    stream.forEach((num) => {
      demoLog.push(`--- Processing: ${num} ---`);
      if (low.size() === 0 || num < (low.getData()[0] ?? 0)) low.insert(num);
      else high.insert(num);
      if (low.size() > high.size() + 1) high.insert(low.extractRoot()!);
      else if (high.size() > low.size() + 1) low.insert(high.extractRoot()!);
      let median;
      if (low.size() === high.size())
        median = ((low.getData()[0] ?? 0) + (high.getData()[0] ?? 0)) / 2;
      else
        median =
          low.size() > high.size() ? low.getData()[0] : high.getData()[0];
      demoLog.push(
        `Low heap (max): [${low.getData()}] | High heap (min): [${high.getData()}]`
      );
      demoLog.push(`Current Median: ${median}`);
    });
    demoLog.push(`🏁 Demo Complete!`);
    setLog(demoLog);
    setSteps([]);
  };

  const demoDijkstra = () => {
    setIsDijkstraDemo(true);
    const nodes: GraphNode[] = [
      { id: "A", x: 100, y: 200 },
      { id: "B", x: 300, y: 100 },
      { id: "C", x: 300, y: 300 },
      { id: "D", x: 500, y: 200 },
      { id: "E", x: 700, y: 300 },
    ];
    const edges: GraphEdge[] = [
      { source: "A", target: "B", weight: 4 },
      { source: "A", target: "C", weight: 2 },
      { source: "B", target: "C", weight: 5 },
      { source: "B", target: "D", weight: 10 },
      { source: "C", target: "D", weight: 3 },
      { source: "C", target: "E", weight: 6 },
      { source: "D", target: "E", weight: 4 },
    ];
    const startNode = "A";
    const minHeap = new Heap<NodeWithDistance>(minComparator);
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    nodes.forEach((n) => {
      distances[n.id] = Infinity;
      previous[n.id] = null;
    });
    distances[startNode] = 0;
    const visited = new Set<string>();
    const localDijkstraSteps: DijkstraStep[] = [];
    const demoLog: string[] = []; // *** LOGGING ARRAY FOR DIJKSTRA ***

    const addStep = (
      heap: Heap<NodeWithDistance>,
      desc: string,
      current: string | null,
      neighbor: string | null = null,
      updated: boolean = false
    ) => {
      localDijkstraSteps.push({
        heapState: [...heap.getData()] as HeapNode[],
        distances: { ...distances },
        previous: { ...previous },
        currentNodeId: current,
        neighborId: neighbor,
        pathUpdated: updated,
        description: desc,
        visited: new Set(visited),
      });
    };

    const logAction = (message: string) => demoLog.push(message);

    logAction(`🚀 Starting Dijkstra's from node '${startNode}'...`);
    addStep(
      minHeap,
      `Initialization: Distances set to ∞, start node is 0.`,
      null
    );

    minHeap.insert({ id: startNode, distance: 0 });
    logAction(`- Added start node 'A' to priority queue.`);
    addStep(
      minHeap,
      `Add start node '${startNode}' to the priority queue.`,
      startNode
    );

    while (minHeap.size() > 0) {
      const { id: u } = minHeap.extractRoot()!;
      logAction(`---`);
      logAction(`- Extracted '${u}' from queue. Visiting node...`);

      if (visited.has(u)) {
        logAction(`- Node '${u}' already visited. Skipping.`);
        addStep(minHeap, `Node '${u}' was already visited. Skipping.`, u);
        continue;
      }

      visited.add(u);
      logAction(`- Path to '${u}' (${distances[u]}) is now final.`);
      addStep(
        minHeap,
        `Visiting node '${u}'. Its path (${distances[u]}) is final.`,
        u
      );

      const neighbors = edges.filter((e) => e.source === u || e.target === u);
      for (const edge of neighbors) {
        const v = edge.source === u ? edge.target : edge.source;
        if (visited.has(v)) continue;

        const newDistThruU = distances[u] + edge.weight;
        logAction(
          `  - Checking neighbor '${v}'. Path via '${u}' is ${newDistThruU}.`
        );
        addStep(
          minHeap,
          `Checking neighbor '${v}'. Path via '${u}' is ${distances[u]} + ${edge.weight} = ${newDistThruU}.`,
          u,
          v
        );

        if (newDistThruU < distances[v]) {
          logAction(`    ✅ Shorter path to '${v}' found!`);
          distances[v] = newDistThruU;
          previous[v] = u;
          addStep(
            minHeap,
            `✅ Shorter path to '${v}' found! Predecessor is now '${u}'.`,
            u,
            v,
            true
          );
          minHeap.insert({ id: v, distance: newDistThruU });
          addStep(
            minHeap,
            `Adding/updating '${v}' in queue with new distance ${newDistThruU}.`,
            u,
            v,
            true
          );
        } else {
          logAction(`    ❌ Path not shorter.`);
          addStep(
            minHeap,
            `❌ Path to '${v}' (${newDistThruU}) not shorter than best (${distances[v]}).`,
            u,
            v
          );
        }
      }
    }
    logAction(`---`);
    logAction("🏁 Algorithm complete! All reachable nodes visited.");
    addStep(
      minHeap,
      "🏁 Algorithm complete! All reachable nodes visited.",
      null
    );

    setDijkstraSteps(localDijkstraSteps);
    setLog(demoLog);
  };

  // --- RENDER LOGIC ---
  const previousStep = () =>
    isDijkstraDemo
      ? dijkstraStepIndex > 0 && setDijkstraStepIndex(dijkstraStepIndex - 1)
      : stepIndex > 0 && setStepIndex(stepIndex - 1);
  const nextStep = () =>
    isDijkstraDemo
      ? dijkstraStepIndex < dijkstraSteps.length - 1 &&
        setDijkstraStepIndex(dijkstraStepIndex + 1)
      : stepIndex < steps.length - 1 && setStepIndex(stepIndex + 1);

  const renderGenericHeapTree = (): JSX.Element => {
    if (steps.length === 0)
      return (
        <div className={styles.treeContainer}>
          <p>Run a non-Dijkstra demo to begin.</p>
        </div>
      );
    const currentStepIndex =
      stepIndex < steps.length ? stepIndex : steps.length - 1;
    if (currentStepIndex < 0)
      return (
        <div className={styles.treeContainer}>
          <p>No steps to show.</p>
        </div>
      );

    const { heapState, highlights } = steps[currentStepIndex];
    if (!heapState || heapState.length === 0)
      return (
        <div className={styles.treeContainer}>
          <p>Heap is empty for this step.</p>
        </div>
      );

    const nodePositions: { x: number; y: number }[] = [];
    const elements: JSX.Element[] = [];
    const totalDepth = Math.floor(Math.log2(heapState.length)) + 1;
    heapState.forEach((_, index) => {
      const level = Math.floor(Math.log2(index + 1));
      const posInLevel = index - (2 ** level - 1);
      const y = level * 100 + 60;
      const totalWidth = 800;
      const nodesInLevel = 2 ** level;
      const x = (totalWidth / (nodesInLevel + 1)) * (posInLevel + 1);
      nodePositions[index] = { x, y };
      if (index > 0) {
        const parentIndex = Math.floor((index - 1) / 2);
        const parentPos = nodePositions[parentIndex];
        const childPos = { x, y };
        const angle =
          (Math.atan2(childPos.y - parentPos.y, childPos.x - parentPos.x) *
            180) /
          Math.PI;
        const distance = Math.sqrt(
          (childPos.x - parentPos.x) ** 2 + (childPos.y - parentPos.y) ** 2
        );
        elements.push(
          <div
            key={`line-${index}`}
            className={styles.connectorLine}
            style={{
              left: `${parentPos.x}px`,
              top: `${parentPos.y}px`,
              width: `${distance}px`,
              transform: `rotate(${angle}deg)`,
            }}
          />
        );
      }
    });
    heapState.forEach((node, index) => {
      const highlightClass = highlights[index]
        ? styles[`genericNode--${highlights[index]}`]
        : "";
      const { x, y } = nodePositions[index];
      const fullText = JSON.stringify(node);
      let displayText = fullText;
      if (displayText.length > 15) {
        displayText = displayText.substring(0, 15) + "...";
      }
      elements.push(
        <div
          key={`node-${index}`}
          className={`${styles.genericNode} ${highlightClass}`}
          style={{ left: x, top: y }}
          title={fullText}
        >
          {displayText}
        </div>
      );
    });
    return (
      <div
        className={styles.treeContainer}
        style={{ height: `${totalDepth * 100 + 20}px` }}
      >
        {elements}
      </div>
    );
  };

  const renderDijkstraVisualization = (): JSX.Element => {
    if (dijkstraSteps.length === 0)
      return <p>Run the Dijkstra Demo to see the visualization.</p>;
    const nodes: GraphNode[] = [
      { id: "A", x: 100, y: 200 },
      { id: "B", x: 300, y: 100 },
      { id: "C", x: 300, y: 300 },
      { id: "D", x: 500, y: 200 },
      { id: "E", x: 700, y: 300 },
    ];
    const edges: GraphEdge[] = [
      { source: "A", target: "B", weight: 4 },
      { source: "A", target: "C", weight: 2 },
      { source: "B", target: "C", weight: 5 },
      { source: "B", target: "D", weight: 10 },
      { source: "C", target: "D", weight: 3 },
      { source: "C", target: "E", weight: 6 },
      { source: "D", target: "E", weight: 4 },
    ];
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const step = dijkstraSteps[dijkstraStepIndex];
    return (
      <div className={styles.dijkstraContainer}>
        <svg className={styles.dijkstraSvg} viewBox="0 0 800 400">
          {edges.map((edge, i) => {
            const sourceNode = nodeMap.get(edge.source)!;
            const targetNode = nodeMap.get(edge.target)!;
            const isPath =
              step.previous[edge.source] === edge.target ||
              step.previous[edge.target] === edge.source;
            const isBeingChecked =
              (edge.source === step.currentNodeId &&
                edge.target === step.neighborId) ||
              (edge.target === step.currentNodeId &&
                edge.source === step.neighborId);
            return (
              <g key={i}>
                {" "}
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  className={`${styles.edgeLine} ${
                    isBeingChecked ? styles.edgeChecking : ""
                  } ${isPath ? styles.edgeOnPath : ""}`}
                />{" "}
                <text
                  x={(sourceNode.x + targetNode.x) / 2}
                  y={(sourceNode.y + targetNode.y) / 2}
                  className={styles.edgeWeight}
                >
                  {edge.weight}
                </text>{" "}
              </g>
            );
          })}
          {nodes.map((node) => {
            const dist = step.distances[node.id];
            const isCurrent = node.id === step.currentNodeId;
            const isNeighbor = node.id === step.neighborId;
            const pathUpdated = isNeighbor && step.pathUpdated;
            const isVisited = step.visited.has(node.id);
            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                {" "}
                <circle
                  cx="0"
                  cy="0"
                  r="25"
                  className={`${styles.graphNode} ${
                    isVisited ? styles.nodeVisited : ""
                  } ${isCurrent ? styles.nodeCurrent : ""} ${
                    isNeighbor ? styles.nodeNeighbor : ""
                  }`}
                />{" "}
                <text
                  textAnchor="middle"
                  dy="-35"
                  className={styles.distanceLabel}
                >
                  {dist === Infinity ? "∞" : dist}
                </text>{" "}
                {pathUpdated && (
                  <text
                    textAnchor="middle"
                    dy="-35"
                    className={`${styles.distanceLabel} ${styles.distanceUpdated}`}
                  >
                    {dist}
                  </text>
                )}{" "}
                <text textAnchor="middle" dy="5" className={styles.nodeLabel}>
                  {node.id}
                </text>{" "}
              </g>
            );
          })}
        </svg>
        <div className={styles.dijkstraHeap}>
          <h4>Priority Queue (Min-Heap)</h4>
          <div className={styles.heapGrid}>
            {step.heapState.length > 0 ? (
              step.heapState.map((node, i) => (
                <div key={i} className={styles.node}>
                  {JSON.stringify(node)}
                </div>
              ))
            ) : (
              <p>Empty</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        ← Back to Dashboard
      </Link>
      <h1 className={styles.title}>Heap Visualizer</h1>
      <p className={styles.meta}>
        A generic binary heap demonstrating multiple use cases.
      </p>
      <div className={styles.traversal}>
        <h3 className={styles.demoTitle}>Run a Full Demo</h3>
        <div className={styles.traversalButtons}>
          <button
            onClick={() => runDemo(demoPriorityQueue)}
            disabled={isDemoRunning}
            className={`${styles.button} ${styles.secondary}`}
          >
            Priority Queue
          </button>
          <button
            onClick={() => runDemo(demoTopKElements)}
            disabled={isDemoRunning}
            className={`${styles.button} ${styles.secondary}`}
          >
            Top-K Elements
          </button>
          <button
            onClick={() => runDemo(demoEventScheduler)}
            disabled={isDemoRunning}
            className={`${styles.button} ${styles.secondary}`}
          >
            Event Scheduler
          </button>
          <button
            onClick={() => runDemo(demoMergeKSortedLists)}
            disabled={isDemoRunning}
            className={`${styles.button} ${styles.secondary}`}
          >
            Merge K Lists
          </button>
          <button
            onClick={() => runDemo(demoMedianOfStream)}
            disabled={isDemoRunning}
            className={`${styles.button} ${styles.secondary}`}
          >
            Median of Stream
          </button>
          <button
            onClick={() => runDemo(demoDijkstra)}
            disabled={isDemoRunning}
            className={`${styles.button} ${styles.secondary}`}
          >
            Dijkstra's Algorithm
          </button>
        </div>
      </div>
      <div className={styles.visualizer}>
        {isDijkstraDemo
          ? renderDijkstraVisualization()
          : renderGenericHeapTree()}
      </div>
      <div className={styles.stepControls}>
        <button onClick={previousStep} className={styles.button}>
          Previous
        </button>
        <span>
          Step: {isDijkstraDemo ? dijkstraStepIndex + 1 : stepIndex + 1} /{" "}
          {isDijkstraDemo ? dijkstraSteps.length || 1 : steps.length || 1}
        </span>
        <button onClick={nextStep} className={styles.button}>
          Next
        </button>
      </div>
      <div className={styles.detailsBox}>
        <p className={styles.details}>
          <strong>📌 Current Action:</strong>{" "}
          {isDijkstraDemo
            ? dijkstraSteps[dijkstraStepIndex]?.description || "Ready."
            : steps[stepIndex]?.description || "Ready."}
        </p>
      </div>
      {log.length > 0 && (
        <div className={styles.logContainer}>
          <h3>Operation Log</h3>
          <div className={styles.logBox}>
            {log.map((entry, i) => (
              <div key={i}>{entry}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
