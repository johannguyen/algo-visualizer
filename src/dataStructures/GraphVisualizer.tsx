// src/components/GraphVisualizer.tsx

import React, { useState, useEffect, useRef } from "react";
import { Graph, type GraphData, type GraphStep } from "../structures/Graph"; // Assumes Graph.ts is in structures folder
import styles from "./GraphVisualizer.module.css";

// --- DATASETS & CONFIGURATION ---
const graphDatasets: {
  [key: string]: GraphData & { info: string; algorithms: string[] };
} = {
  social: {
    info: "A social network. Edges represent friendships. Good for finding connection paths.",
    algorithms: ["bfs", "dfs"],
    isDirected: false,
    isWeighted: false,
    nodes: [
      { id: "Alice" },
      { id: "Bob" },
      { id: "Charlie" },
      { id: "Diana" },
      { id: "Eve" },
      { id: "Frank" },
      { id: "Grace" },
    ],
    edges: [
      { source: "Alice", target: "Bob" },
      { source: "Alice", target: "Charlie" },
      { source: "Bob", target: "Diana" },
      { source: "Charlie", target: "Diana" },
      { source: "Diana", target: "Eve" },
      { source: "Eve", target: "Frank" },
      { source: "Eve", target: "Grace" },
    ],
  },
  flights: {
    info: "Flight routes between cities. Edges are weighted by distance. Find the shortest flight path.",
    algorithms: ["dijkstra"],
    isDirected: true,
    isWeighted: true,
    nodes: [
      { id: "NYC" },
      { id: "LAX" },
      { id: "CHI" },
      { id: "MIA" },
      { id: "DAL" },
      { id: "SEA" },
    ],
    edges: [
      { source: "NYC", target: "CHI", weight: 740 },
      { source: "NYC", target: "MIA", weight: 1090 },
      { source: "CHI", target: "LAX", weight: 1745 },
      { source: "CHI", target: "DAL", weight: 800 },
      { source: "MIA", target: "DAL", weight: 1120 },
      { source: "DAL", target: "LAX", weight: 1235 },
      { source: "LAX", target: "SEA", weight: 960 },
      { source: "SEA", target: "CHI", weight: 1730 },
    ],
  },
  tasks: {
    info: "Project task dependencies. A directed acyclic graph (DAG). Find a valid order to complete tasks.",
    algorithms: ["topo-sort"],
    isDirected: true,
    isWeighted: false,
    nodes: [
      { id: "A" }, // Entry 1
      { id: "B" }, // Entry 2
      { id: "C" }, // Shared child of A, B
      { id: "D" }, // Depends on B
      { id: "E" }, // Depends on C
      { id: "F" }, // Depends on D, E
      { id: "G" }, // Depends on F (final)
      { id: "H" }, // Independent task
    ],
    edges: [
      { source: "A", target: "C" },
      { source: "B", target: "C" },
      { source: "B", target: "D" },
      { source: "C", target: "E" },
      { source: "D", target: "F" },
      { source: "E", target: "F" },
      { source: "F", target: "G" },
      // H is not connected; it's an independent task
    ],
  },
};

const algorithmDetails: {
  [key: string]: { name: string; needsStart: boolean; needsEnd: boolean };
} = {
  bfs: { name: "Breadth-First Search (BFS)", needsStart: true, needsEnd: true },
  dfs: { name: "Depth-First Search (DFS)", needsStart: true, needsEnd: true },
  dijkstra: { name: "Dijkstra's Algorithm", needsStart: true, needsEnd: true },
  "topo-sort": { name: "Topological Sort", needsStart: false, needsEnd: false },
};

type NodePosition = { x: number; y: number };
type Positions = { [nodeId: string]: NodePosition };

const GraphVisualizer: React.FC = () => {
  const [activeGraphKey, setActiveGraphKey] = useState<string>("social");
  const [graphInstance, setGraphInstance] = useState<Graph>(
    new Graph(graphDatasets["social"])
  );
  const [activeAlgorithm, setActiveAlgorithm] = useState<string>("bfs");
  const [startNode, setStartNode] = useState<string>("");
  const [endNode, setEndNode] = useState<string>("");
  const [steps, setSteps] = useState<GraphStep[]>([]);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [log, setLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [positions, setPositions] = useState<Positions>({});
  const svgRef = useRef<SVGSVGElement>(null);

  // --- ROBUST HIERARCHICAL LAYOUT EFFECT (FIXED) ---
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 400;

    // Special case for the tasks graph
    if (activeGraphKey === "tasks") {
      // 1. Compute topological levels
      const nodes = graphInstance.nodes;
      const edges = graphInstance.edges;
      const indegree: Record<string, number> = {};
      nodes.forEach((n) => (indegree[n.id] = 0));
      edges.forEach((e) => indegree[e.target]++);
      // Find all roots
      const roots = nodes.filter((n) => indegree[n.id] === 0).map((n) => n.id);

      // Assign levels using BFS/toposort
      const levelMap: Record<string, number> = {};
      const queue: [string, number][] = roots.map((id) => [id, 0]);
      roots.forEach((id) => (levelMap[id] = 0));
      while (queue.length > 0) {
        const [curr, lvl] = queue.shift()!;
        edges
          .filter((e) => e.source === curr)
          .forEach((e) => {
            // Only update if deeper level
            if (
              levelMap[e.target] === undefined ||
              levelMap[e.target] < lvl + 1
            ) {
              levelMap[e.target] = lvl + 1;
              queue.push([e.target, lvl + 1]);
            }
          });
      }

      // Group nodes by level
      const maxLevel = Math.max(...Object.values(levelMap));
      const levelNodes: Record<number, string[]> = {};
      Object.entries(levelMap).forEach(([id, lvl]) => {
        if (!levelNodes[lvl]) levelNodes[lvl] = [];
        levelNodes[lvl].push(id);
      });

      // 2. Assign positions, spacing out horizontally by level
      const verticalGap = (height - 100) / (maxLevel + 1);
      const newPositions: Positions = {};
      for (let lvl = 0; lvl <= maxLevel; ++lvl) {
        const ids = levelNodes[lvl] || [];
        const horizontalGap = (width - 100) / (ids.length + 1);
        ids.forEach((id, idx) => {
          newPositions[id] = {
            x: horizontalGap * (idx + 1) + 50,
            y: verticalGap * lvl + 60,
          };
        });
      }

      // There might be unconnected nodes (not in levelMap)
      for (const n of nodes) {
        if (!(n.id in newPositions)) {
          // Put them at the bottom, spaced horizontally
          const y = height - 40;
          const others = Object.keys(newPositions).length;
          newPositions[n.id] = {
            x: 60 + others * 60,
            y,
          };
        }
      }

      setPositions(newPositions);
      return;
    }

    // Default for other graphs: your original robust hierarchical logic
    const calculateLayout = () => {
      if (width === 0 || height === 0) return;
      const newPositions: Positions = {};
      const visited = new Set<string>();
      const levels: string[][] = [];

      const rootNode = graphInstance.nodes[0]?.id;
      if (!rootNode) {
        setPositions({});
        return;
      }

      // BFS to determine levels for all components
      const bfsForLayout = (startNodeId: string, startLevel: number) => {
        const queue: [string, number][] = [[startNodeId, startLevel]];
        visited.add(startNodeId);

        while (queue.length > 0) {
          const [currentNodeId, level] = queue.shift()!;
          if (!levels[level]) levels[level] = [];
          levels[level].push(currentNodeId);

          const neighbors =
            graphInstance.adjacencyList.get(currentNodeId) || [];
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor.node)) {
              visited.add(neighbor.node);
              queue.push([neighbor.node, level + 1]);
            }
          }
        }
      };

      // Run BFS for all components to build the levels array
      bfsForLayout(rootNode, 0);
      for (const node of graphInstance.nodes) {
        if (!visited.has(node.id)) {
          bfsForLayout(node.id, levels.length);
        }
      }

      // Calculate spacing based on the determined levels
      const verticalGap = (height - 100) / (levels.length + 1);

      levels.forEach((level, levelIndex) => {
        const horizontalGap = (width - 100) / (level.length + 1);
        level.forEach((nodeId, nodeIndex) => {
          newPositions[nodeId] = {
            x: horizontalGap * (nodeIndex + 1) + 50,
            y: verticalGap * (levelIndex + 1) + 25,
          };
        });
      });

      setPositions(newPositions);
    };

    const resizeObserver = new ResizeObserver(calculateLayout);
    resizeObserver.observe(svg);
    return () => resizeObserver.unobserve(svg);
  }, [graphInstance, activeGraphKey]);

  const resetState = () => {
    setSteps([]);
    setStepIndex(0);
    setLog([]);
    setStartNode("");
    setEndNode("");
  };

  const handleGraphChange = (key: string) => {
    if (isRunning) return;
    setActiveGraphKey(key);
    const data = graphDatasets[key];
    const firstAlgo = data.algorithms[0];
    setGraphInstance(new Graph(data));
    setActiveAlgorithm(firstAlgo);
    resetState();
  };

  const runBuildDemo = async () => {
    setIsRunning(true);
    resetState();
    await new Promise((resolve) => setTimeout(resolve, 50));
    const [generatedSteps, generatedLog] = graphInstance.runBuildDemo();
    setSteps(generatedSteps);
    setLog(generatedLog);
    setIsRunning(false);
  };

  const runAlgorithmDemo = async () => {
    const algoNeeds = algorithmDetails[activeAlgorithm];
    if (
      (algoNeeds.needsStart && !startNode) ||
      (algoNeeds.needsEnd && !endNode)
    ) {
      setLog(["Please select the required start and/or end nodes."]);
      setSteps([]);
      setStepIndex(0);
      return;
    }
    setIsRunning(true);
    setSteps([]);
    setStepIndex(0);
    setLog([]);
    await new Promise((resolve) => setTimeout(resolve, 50));
    let generatedSteps: GraphStep[] = [];
    let generatedLog: string[] = [];
    switch (activeAlgorithm) {
      case "bfs":
        [generatedSteps, generatedLog] = graphInstance.runBfs(
          startNode,
          endNode
        );
        break;
      case "dfs":
        [generatedSteps, generatedLog] = graphInstance.runDfs(
          startNode,
          endNode
        );
        break;
      case "dijkstra":
        [generatedSteps, generatedLog] = graphInstance.runDijkstra(
          startNode,
          endNode
        );
        break;
      case "topo-sort":
        [generatedSteps, generatedLog] = graphInstance.runTopologicalSort();
        break;
    }
    setSteps(generatedSteps);
    setLog(generatedLog);
    setIsRunning(false);
  };

  const previousStep = () => stepIndex > 0 && setStepIndex(stepIndex - 1);
  const nextStep = () =>
    stepIndex < steps.length - 1 && setStepIndex(stepIndex + 1);

  const currentStep = steps[stepIndex];
  const algoNeeds = algorithmDetails[activeAlgorithm] || {
    needsStart: false,
    needsEnd: false,
  };

  const nodesToRender = currentStep?.nodesToRender || graphInstance.nodes;
  const edgesToRender = currentStep?.edgesToRender || graphInstance.edges;

  return (
    <div className={styles.container}>
      <a href="/" className={styles.backButton}>
        ← Back to Dashboard
      </a>
      <h1 className={styles.title}>Graph Visualizer</h1>
      <p className={styles.meta}>
        A visualizer for common graph algorithms, demonstrating traversal,
        pathfinding, and sorting.
      </p>

      <div className={styles.demoSection}>
        <h3 className={styles.demoTitle}>
          Graph Setup &amp; Algorithm Selection
        </h3>
        <div className={styles.controlsGrid}>
          <div>
            <label className={styles.label}>1. Use Case</label>
            <div className={styles.tabContainer}>
              {Object.keys(graphDatasets).map((key) => (
                <button
                  key={key}
                  onClick={() => handleGraphChange(key)}
                  className={`${styles.tab} ${
                    activeGraphKey === key ? styles.active : ""
                  }`}
                  disabled={isRunning}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={styles.label}>2. Algorithm</label>
            <select
              value={activeAlgorithm}
              onChange={(e) => setActiveAlgorithm(e.target.value)}
              disabled={isRunning}
              className={styles.selectDropdown}
            >
              {graphDatasets[activeGraphKey].algorithms.map((algo) => (
                <option key={algo} value={algo}>
                  {algorithmDetails[algo].name}
                </option>
              ))}
            </select>
          </div>
          {(algoNeeds.needsStart || algoNeeds.needsEnd) && (
            <div>
              <label className={styles.label}>3. Parameters</label>
              <div className={styles.parameterGroup}>
                {algoNeeds.needsStart && (
                  <select
                    value={startNode}
                    onChange={(e) => setStartNode(e.target.value)}
                    disabled={isRunning}
                    className={styles.selectDropdown}
                  >
                    <option value="">Select Start Node</option>
                    {graphInstance.nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.id}
                      </option>
                    ))}
                  </select>
                )}
                {algoNeeds.needsEnd && (
                  <select
                    value={endNode}
                    onChange={(e) => setEndNode(e.target.value)}
                    disabled={isRunning}
                    className={styles.selectDropdown}
                  >
                    <option value="">Select End Node</option>
                    {graphInstance.nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.id}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}
          <div className={styles.actionButtons}>
            <button
              onClick={runBuildDemo}
              disabled={isRunning}
              className={`${styles.button} ${styles.secondary}`}
            >
              Visualize Build
            </button>
            <button
              onClick={runAlgorithmDemo}
              disabled={isRunning}
              className={`${styles.button} ${styles.primary}`}
            >
              Run Algorithm
            </button>
          </div>
        </div>
      </div>

      <div className={styles.visualizer}>
        <svg ref={svgRef} className={styles.graphSvg} viewBox="0 0 800 400">
          {Object.keys(positions).length > 0 &&
            edgesToRender.map((edge) => {
              const sourceNode = positions[edge.source];
              const targetNode = positions[edge.target];
              if (!sourceNode || !targetNode) return null;
              const edgeId1 = `${edge.source}-${edge.target}`;
              const edgeId2 = `${edge.target}-${edge.source}`;
              const edgeState =
                currentStep?.edgeStates[edgeId1] ||
                currentStep?.edgeStates[edgeId2] ||
                "default";
              return (
                <g key={edgeId1}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    className={`${styles.edgeLine} ${styles[edgeState]}`}
                  />
                  {graphInstance.isWeighted && (
                    <text
                      x={(sourceNode.x + targetNode.x) / 2}
                      y={(sourceNode.y + targetNode.y) / 2 - 5}
                      className={styles.edgeWeight}
                    >
                      {edge.weight}
                    </text>
                  )}
                </g>
              );
            })}
          {Object.keys(positions).length > 0 &&
            nodesToRender.map((node) => {
              const pos = positions[node.id];
              if (!pos) return null;
              const nodeState = currentStep?.nodeStates[node.id] || "default";
              return (
                <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r="20"
                    className={`${styles.graphNode} ${styles[nodeState]}`}
                  />
                  <text textAnchor="middle" dy="5" className={styles.nodeLabel}>
                    {node.id}
                  </text>
                  {currentStep?.distances &&
                    currentStep.distances[node.id] !== undefined && (
                      <text
                        textAnchor="middle"
                        dy="-28"
                        className={styles.distanceLabel}
                      >
                        {currentStep.distances[node.id]}
                      </text>
                    )}
                </g>
              );
            })}
        </svg>
      </div>

      <div className={styles.stepControls}>
        <button
          onClick={previousStep}
          className={styles.button}
          disabled={stepIndex === 0 || isRunning}
        >
          Previous
        </button>
        <span>
          Step: {steps.length > 0 ? stepIndex + 1 : 0} / {steps.length}
        </span>
        <button
          onClick={nextStep}
          className={styles.button}
          disabled={stepIndex >= steps.length - 1 || isRunning}
        >
          Next
        </button>
      </div>

      {currentStep && currentStep.queueState && (
        <div className={styles.queueContainer}>
          <h4>Data Structure (Queue/Stack)</h4>
          <div className={styles.queueBox}>
            {currentStep.queueState.length > 0
              ? currentStep.queueState.join(", ")
              : "Empty"}
          </div>
        </div>
      )}

      <div className={styles.detailsBox}>
        <p className={styles.details}>
          <strong>📌 Current Action:</strong>{" "}
          {currentStep?.description || "Ready to run a demo."}
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
};

export default GraphVisualizer;
