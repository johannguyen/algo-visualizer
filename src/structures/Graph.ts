// src/structures/Graph.ts

// --- TYPE DEFINITIONS ---
export interface Node {
  id: string;
}

export interface Edge {
  source: string;
  target: string;
  weight?: number;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
  isDirected?: boolean;
  isWeighted?: boolean;
}

// Defines the visual state of the graph at a single step
export interface GraphStep {
  nodesToRender: Node[];
  edgesToRender: Edge[];
  nodeStates: {
    [nodeId: string]:
      | "current"
      | "neighbor"
      | "visited"
      | "path"
      | "subpath"
      | "default";
  };
  edgeStates: {
    [edgeId: string]: "checking" | "onPath" | "subpath" | "default";
  };
  distances?: { [nodeId: string]: number | "∞" };
  description: string;
  queueState?: string[];
}

export class Graph {
  public nodes: Node[];
  public edges: Edge[];
  public isDirected: boolean;
  public isWeighted: boolean;
  public adjacencyList: Map<string, { node: string; weight: number }[]>;

  constructor(data: GraphData) {
    this.nodes = data.nodes;
    this.edges = data.edges;
    this.isDirected = data.isDirected ?? false;
    this.isWeighted = data.isWeighted ?? false;
    this.adjacencyList = new Map();
    this.buildAdjacencyList();
  }

  private buildAdjacencyList(): void {
    this.nodes.forEach((node) => {
      this.adjacencyList.set(node.id, []);
    });
    this.edges.forEach((edge) => {
      this.adjacencyList
        .get(edge.source)!
        .push({ node: edge.target, weight: edge.weight || 1 });
      if (!this.isDirected) {
        this.adjacencyList
          .get(edge.target)!
          .push({ node: edge.source, weight: edge.weight || 1 });
      }
    });
  }

  // --- VISUALIZATION RUNNERS ---

  public runBuildDemo(): [GraphStep[], string[]] {
    const steps: GraphStep[] = [];
    const log: string[] = ["🚀 Visualizing Graph Construction..."];
    const nodesToRender: Node[] = [];
    const edgesToRender: Edge[] = [];

    for (const node of this.nodes) {
      nodesToRender.push(node);
      log.push(`- Adding node '${node.id}'`);
      steps.push({
        nodesToRender: [...nodesToRender],
        edgesToRender: [...edgesToRender],
        nodeStates: { [node.id]: "current" },
        edgeStates: {},
        description: `Adding node '${node.id}' to the graph.`,
      });
    }

    for (const edge of this.edges) {
      edgesToRender.push(edge);
      log.push(`- Adding edge from '${edge.source}' to '${edge.target}'`);
      steps.push({
        nodesToRender: [...nodesToRender],
        edgesToRender: [...edgesToRender],
        nodeStates: { [edge.source]: "neighbor", [edge.target]: "neighbor" },
        edgeStates: { [`${edge.source}-${edge.target}`]: "checking" },
        description: `Linking node '${edge.source}' and '${edge.target}'.`,
      });
    }

    log.push("🏁 Graph construction complete!");
    steps.push({
      nodesToRender: [...nodesToRender],
      edgesToRender: [...edgesToRender],
      nodeStates: {},
      edgeStates: {},
      description: "Graph construction complete! Ready to run an algorithm.",
    });

    return [steps, log];
  }

  public runBfs(
    startNodeId: string,
    endNodeId: string
  ): [GraphStep[], string[]] {
    const steps: GraphStep[] = [];
    const log: string[] = [
      `🚀 Starting Breadth-First Search (Level-by-Level)...`,
    ];
    const queue: [string, string[]][] = [[startNodeId, [startNodeId]]];
    const visited = new Set<string>([startNodeId]);
    log.push(`- Initialized BFS Queue with start node: [${startNodeId}]`);
    steps.push({
      nodesToRender: this.nodes,
      edgesToRender: this.edges,
      description: `Initialization: Add start node '${startNodeId}' to the BFS Queue. The queue is FIFO (First-In, First-Out).`,
      nodeStates: { [startNodeId]: "neighbor" },
      edgeStates: {},
      queueState: [startNodeId],
    });

    while (queue.length > 0) {
      const [currentNodeId, path] = queue.shift()!;
      log.push(
        `---`,
        `- Dequeued '${currentNodeId}'. The path to get here is [${path.join(
          " -> "
        )}].`
      );

      const nodeStates: GraphStep["nodeStates"] = {};
      visited.forEach((v) => (nodeStates[v] = "visited"));
      path.forEach((p) => (nodeStates[p] = "subpath")); // Highlight the subpath
      nodeStates[currentNodeId] = "current";

      const edgeStates: GraphStep["edgeStates"] = {};
      for (let i = 0; i < path.length - 1; i++) {
        edgeStates[`${path[i]}-${path[i + 1]}`] = "subpath";
      }

      steps.push({
        nodesToRender: this.nodes,
        edgesToRender: this.edges,
        description: `Visiting '${currentNodeId}'. Highlighting the path taken to reach it.`,
        nodeStates,
        edgeStates,
        queueState: queue.map((q) => q[0]),
      });

      if (currentNodeId === endNodeId) {
        log.push(
          `✅ Found target node '${endNodeId}'!`,
          `🏁 Path: ${path.join(" -> ")}`
        );
        const finalEdgeStates: GraphStep["edgeStates"] = {};
        for (let i = 0; i < path.length - 1; i++)
          finalEdgeStates[`${path[i]}-${path[i + 1]}`] = "onPath";

        const finalNodeStates: GraphStep["nodeStates"] = {};
        path.forEach((id) => {
          finalNodeStates[id] = "path";
        });

        steps.push({
          nodesToRender: this.nodes,
          edgesToRender: this.edges,
          description: `Target found! Highlighting the shortest path in green: ${path.join(
            " -> "
          )}.`,
          nodeStates: finalNodeStates,
          edgeStates: finalEdgeStates,
          queueState: [],
        });
        return [steps, log];
      }

      const neighbors = this.adjacencyList.get(currentNodeId) || [];
      log.push(
        `  - Checking neighbors of '${currentNodeId}': [${neighbors
          .map((n) => n.node)
          .join(", ")}]`
      );
      for (const neighbor of neighbors) {
        const neighborId = neighbor.node;
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push([neighborId, [...path, neighborId]]);
          log.push(
            `    - Neighbor '${neighborId}' not visited. Adding to back of BFS Queue.`
          );
          steps.push({
            nodesToRender: this.nodes,
            edgesToRender: this.edges,
            description: `Neighbor '${neighborId}' is unvisited. Adding it (and its path) to the queue.`,
            nodeStates: { ...nodeStates, [neighborId]: "neighbor" },
            edgeStates: {
              ...edgeStates,
              [`${currentNodeId}-${neighborId}`]: "checking",
            },
            queueState: queue.map((q) => q[0]),
          });
        }
      }
    }
    log.push(`---`, `❌ Target node not found. Queue is empty.`);
    steps.push({
      nodesToRender: this.nodes,
      edgesToRender: this.edges,
      description: `Target '${endNodeId}' was not reachable.`,
      nodeStates: {},
      edgeStates: {},
    });
    return [steps, log];
  }

  public runDfs(
    startNodeId: string,
    endNodeId: string
  ): [GraphStep[], string[]] {
    const steps: GraphStep[] = [];
    const log: string[] = [`🚀 Starting Depth-First Search (Dive-Deep)...`];
    const stack: [string, string[]][] = [[startNodeId, [startNodeId]]];
    const visited = new Set<string>();
    log.push(`- Initialized DFS Stack with start node: [${startNodeId}]`);
    steps.push({
      nodesToRender: this.nodes,
      edgesToRender: this.edges,
      description: `Initialization: Push start node '${startNodeId}' onto the DFS Stack. The stack is LIFO (Last-In, First-Out).`,
      nodeStates: { [startNodeId]: "neighbor" },
      edgeStates: {},
      queueState: [startNodeId],
    });

    while (stack.length > 0) {
      const [currentNodeId, path] = stack.pop()!;
      if (visited.has(currentNodeId)) {
        log.push(
          `- Node '${currentNodeId}' from stack already visited. Skipping.`
        );
        continue;
      }
      visited.add(currentNodeId);
      log.push(
        `---`,
        `- Popped '${currentNodeId}' from stack. Visiting node...`
      );

      const nodeStates: GraphStep["nodeStates"] = {};
      visited.forEach((v) => (nodeStates[v] = "visited"));
      path.forEach((p) => (nodeStates[p] = "subpath"));
      nodeStates[currentNodeId] = "current";

      const edgeStates: GraphStep["edgeStates"] = {};
      for (let i = 0; i < path.length - 1; i++) {
        edgeStates[`${path[i]}-${path[i + 1]}`] = "subpath";
      }

      steps.push({
        nodesToRender: this.nodes,
        edgesToRender: this.edges,
        description: `Visiting '${currentNodeId}' (from top of stack). Highlighting the current path.`,
        nodeStates,
        edgeStates,
        queueState: stack.map((s) => s[0]),
      });

      if (currentNodeId === endNodeId) {
        log.push(
          `✅ Found target node '${endNodeId}'!`,
          `🏁 Path: ${path.join(" -> ")}`
        );
        const finalEdgeStates: GraphStep["edgeStates"] = {};
        for (let i = 0; i < path.length - 1; i++)
          finalEdgeStates[`${path[i]}-${path[i + 1]}`] = "onPath";
        const finalNodeStates: GraphStep["nodeStates"] = {};
        path.forEach((id) => {
          finalNodeStates[id] = "path";
        });
        steps.push({
          nodesToRender: this.nodes,
          edgesToRender: this.edges,
          description: `Target found! Highlighting a path: ${path.join(
            " -> "
          )}.`,
          nodeStates: finalNodeStates,
          edgeStates: finalEdgeStates,
          queueState: [],
        });
        return [steps, log];
      }

      const neighbors = this.adjacencyList.get(currentNodeId) || [];
      log.push(
        `  - Checking neighbors of '${currentNodeId}': [${neighbors
          .map((n) => n.node)
          .join(", ")}]`
      );
      for (let i = neighbors.length - 1; i >= 0; i--) {
        const neighbor = neighbors[i];
        if (!visited.has(neighbor.node)) {
          stack.push([neighbor.node, [...path, neighbor.node]]);
          log.push(
            `    - Neighbor '${neighbor.node}' not visited. Pushing to DFS Stack.`
          );
          steps.push({
            nodesToRender: this.nodes,
            edgesToRender: this.edges,
            description: `Neighbor '${neighbor.node}' is unvisited. Push it onto the stack to explore it immediately.`,
            nodeStates: { ...nodeStates, [neighbor.node]: "neighbor" },
            edgeStates: {
              ...edgeStates,
              [`${currentNodeId}-${neighbor.node}`]: "checking",
            },
            queueState: stack.map((s) => s[0]),
          });
        }
      }
    }
    log.push(`---`, `❌ Target node not found. Stack is empty.`);
    steps.push({
      nodesToRender: this.nodes,
      edgesToRender: this.edges,
      description: `Target '${endNodeId}' was not reachable.`,
      nodeStates: {},
      edgeStates: {},
    });
    return [steps, log];
  }

  public runDijkstra(
    startNodeId: string,
    endNodeId: string
  ): [GraphStep[], string[]] {
    const steps: GraphStep[] = [];
    const log: string[] = [
      `🚀 Starting Dijkstra's Algorithm from '${startNodeId}'...`,
    ];
    const distances: { [key: string]: number } = {};
    const prev: { [key: string]: string | null } = {};
    const pq: { [key: string]: number } = {};
    const visited = new Set<string>();
    this.nodes.forEach((node) => {
      distances[node.id] = Infinity;
      prev[node.id] = null;
    });
    distances[startNodeId] = 0;
    pq[startNodeId] = 0;
    const getDistancesForStep = () => {
      const d: { [id: string]: number | "∞" } = {};
      this.nodes.forEach(
        (n) => (d[n.id] = distances[n.id] === Infinity ? "∞" : distances[n.id])
      );
      return d;
    };
    log.push(
      "- Initialization: All distances set to ∞, except start node (0). Added to Priority Queue."
    );
    steps.push({
      nodesToRender: this.nodes,
      edgesToRender: this.edges,
      description:
        "Initialization: All distances are ∞, start node is 0. Added to Priority Queue.",
      nodeStates: { [startNodeId]: "current" },
      edgeStates: {},
      distances: getDistancesForStep(),
      queueState: Object.keys(pq),
    });

    while (Object.keys(pq).length > 0) {
      const u = Object.keys(pq).reduce((a, b) => (pq[a] < pq[b] ? a : b));
      delete pq[u];
      if (visited.has(u)) continue;
      visited.add(u);
      log.push(
        `---`,
        `- Extracted '${u}' from PQ. Visiting node with shortest distance (${distances[u]}).`
      );

      const visitedNodeStates: GraphStep["nodeStates"] = {};
      visited.forEach((id) => {
        visitedNodeStates[id] = "visited";
      });
      visitedNodeStates[u] = "current";

      steps.push({
        nodesToRender: this.nodes,
        edgesToRender: this.edges,
        description: `Choose '${u}' from Priority Queue (cost: ${distances[u]}) and mark as visited. This path is now final.`,
        nodeStates: visitedNodeStates,
        edgeStates: {},
        distances: getDistancesForStep(),
        queueState: Object.keys(pq),
      });
      if (u === endNodeId) {
        log.push(`✅ Found shortest path to target node '${endNodeId}'!`);
        break;
      }
      const neighbors = this.adjacencyList.get(u) || [];
      log.push(`  - Checking neighbors of '${u}'...`);
      for (const neighbor of neighbors) {
        const v = neighbor.node;
        const weight = neighbor.weight as number;
        const newDistThruU = distances[u] + weight;
        log.push(
          `    - Checking neighbor '${v}'. Current distance: ${distances[v]}. Path via '${u}': ${newDistThruU}.`
        );
        const currentEdge = `${u}-${v}`;
        const checkingNodeStates: GraphStep["nodeStates"] = {
          ...visitedNodeStates,
          [v]: "neighbor",
        };

        steps.push({
          nodesToRender: this.nodes,
          edgesToRender: this.edges,
          description: `Checking path to '${v}' via '${u}'. New cost: ${distances[u]} + ${weight} = ${newDistThruU}.`,
          nodeStates: checkingNodeStates,
          edgeStates: { [currentEdge]: "checking" },
          distances: getDistancesForStep(),
          queueState: Object.keys(pq),
        });
        if (newDistThruU < distances[v]) {
          distances[v] = newDistThruU;
          prev[v] = u;
          pq[v] = newDistThruU;
          log.push(
            `      ✅ Shorter path found! Updating distance for '${v}' to ${newDistThruU} and adding to PQ.`
          );
          steps.push({
            nodesToRender: this.nodes,
            edgesToRender: this.edges,
            description: `✅ Shorter path to '${v}' found! Updating its cost to ${newDistThruU} in the Priority Queue.`,
            nodeStates: checkingNodeStates,
            edgeStates: { [currentEdge]: "checking" },
            distances: getDistancesForStep(),
            queueState: Object.keys(pq),
          });
        }
      }
    }
    const path: string[] = [];
    let current: string | null = endNodeId;
    while (current) {
      path.unshift(current);
      current = prev[current];
    }
    if (path[0] === startNodeId) {
      log.push(
        `---`,
        `🏁 Algorithm Complete. Shortest path to '${endNodeId}': ${path.join(
          " -> "
        )} (Cost: ${distances[endNodeId]})`
      );
      const finalEdgeStates: GraphStep["edgeStates"] = {};
      for (let i = 0; i < path.length - 1; i++)
        finalEdgeStates[`${path[i]}-${path[i + 1]}`] = "onPath";
      const finalNodeStates: GraphStep["nodeStates"] = {};
      path.forEach((id) => {
        finalNodeStates[id] = "path";
      });
      steps.push({
        nodesToRender: this.nodes,
        edgesToRender: this.edges,
        description: `Shortest path found! Highlighting path with cost: ${distances[endNodeId]}.`,
        nodeStates: finalNodeStates,
        edgeStates: finalEdgeStates,
        distances: getDistancesForStep(),
      });
    } else {
      log.push(`---`, `❌ Target node '${endNodeId}' was not reachable.`);
      steps.push({
        nodesToRender: this.nodes,
        edgesToRender: this.edges,
        description: `Target '${endNodeId}' was not reachable.`,
        nodeStates: {},
        edgeStates: {},
        distances: getDistancesForStep(),
      });
    }
    return [steps, log];
  }

  public runTopologicalSort(): [GraphStep[], string[]] {
    const steps: GraphStep[] = [];
    const log: string[] = ["🚀 Starting Topological Sort..."];
    const inDegree = new Map<string, number>();
    this.nodes.forEach((node) => inDegree.set(node.id, 0));
    this.edges.forEach((edge) =>
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
    );
    const queue: string[] = [];
    this.nodes.forEach((node) => {
      if (inDegree.get(node.id) === 0) queue.push(node.id);
    });
    log.push(
      `- Initializing in-degrees and finding nodes with 0: [${queue.join(
        ", "
      )}]`
    );
    const initialNodeStates: GraphStep["nodeStates"] = {};
    queue.forEach((id) => {
      initialNodeStates[id] = "neighbor";
    });
    steps.push({
      nodesToRender: this.nodes,
      edgesToRender: this.edges,
      description: `Initialization: Found nodes with 0 incoming edges to start the sort queue.`,
      nodeStates: initialNodeStates,
      edgeStates: {},
      queueState: [...queue],
    });

    const result: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      result.push(u);
      log.push(
        `---`,
        `- Dequeued '${u}'. Adding to sorted list: [${result.join(", ")}]`
      );
      const nodeStates: GraphStep["nodeStates"] = {};
      result.forEach((id) => {
        nodeStates[id] = "path";
      });
      nodeStates[u] = "current";
      steps.push({
        nodesToRender: this.nodes,
        edgesToRender: this.edges,
        description: `Adding '${u}' to the final sorted list. It will now be marked as 'visited' (green).`,
        nodeStates,
        edgeStates: {},
        queueState: [...queue],
      });

      const neighbors = this.adjacencyList.get(u) || [];
      log.push(`  - Updating neighbors of '${u}'...`);
      for (const neighbor of neighbors) {
        const v = neighbor.node;
        inDegree.set(v, (inDegree.get(v) || 1) - 1);
        log.push(
          `    - Decrementing in-degree of '${v}'. New count: ${inDegree.get(
            v
          )}.`
        );
        if (inDegree.get(v) === 0) {
          queue.push(v);
          log.push(`      ✅ In-degree of '${v}' is 0. Adding to queue.`);
          const nextNodeStates: GraphStep["nodeStates"] = {};
          result.forEach((id) => {
            nextNodeStates[id] = "path";
          });
          nextNodeStates[v] = "neighbor";
          steps.push({
            nodesToRender: this.nodes,
            edgesToRender: this.edges,
            description: `In-degree of '${v}' is now 0. Adding to sort queue.`,
            nodeStates: nextNodeStates,
            edgeStates: { [`${u}-${v}`]: "checking" },
            queueState: [...queue],
          });
        }
      }
    }
    if (result.length !== this.nodes.length) {
      log.push(`---`, `❌ Error: Graph contains a cycle!`);
      steps.push({
        nodesToRender: this.nodes,
        edgesToRender: this.edges,
        description:
          "Error: A cycle was detected in the graph. Cannot complete sort.",
        nodeStates: {},
        edgeStates: {},
      });
    } else {
      log.push(`---`, `🏁 Sort complete! Final order: ${result.join(" -> ")}`);
      const finalNodeStates: GraphStep["nodeStates"] = {};
      result.forEach((id) => {
        finalNodeStates[id] = "path";
      });
      steps.push({
        nodesToRender: this.nodes,
        edgesToRender: this.edges,
        description: `Final sorted order: ${result.join(" -> ")}`,
        nodeStates: finalNodeStates,
        edgeStates: {},
      });
    }
    return [steps, log];
  }
}
