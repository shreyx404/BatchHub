/* ============================================================
   Unit 6 — Graph
   ============================================================
   Adjacency List graph with BFS, DFS, shortest path,
   topological sort, and both adjacency representations.
   Supports directed and undirected, weighted and unweighted.
   ============================================================ */

/**
 * Graph using Adjacency List representation.
 *
 * Vertices are stored as a Map: vertexId → { data, edges }
 * Edges are stored as arrays of { to, weight } per vertex.
 *
 * BFS: O(V + E) — uses Queue
 * DFS: O(V + E) — uses Stack / recursion
 * Topological Sort: O(V + E) — using DFS
 * Space: O(V + E)
 */
export class Graph {
  /**
   * @param {boolean} [directed=false] - If true, edges are one-way
   */
  constructor(directed = false) {
    this.directed = directed;
    /** @type {Map<string, { data: any, edges: { to: string, weight: number }[] }>} */
    this._adjacencyList = new Map();
    this.history = [];
  }

  /**
   * Add a vertex to the graph.
   * @param {string} id - Unique identifier
   * @param {any} [data] - Optional data payload
   */
  addVertex(id, data = null) {
    if (!this._adjacencyList.has(id)) {
      this._adjacencyList.set(id, { data, edges: [] });
      this.history.push({
        op: 'addVertex',
        args: { id, data },
      });
    }
  }

  /**
   * Remove a vertex and all its edges.
   * @param {string} id
   */
  removeVertex(id) {
    if (!this._adjacencyList.has(id)) return;

    // Remove all edges pointing to this vertex
    for (const [vertexId, vertex] of this._adjacencyList) {
      vertex.edges = vertex.edges.filter(e => e.to !== id);
    }

    this._adjacencyList.delete(id);
    this.history.push({ op: 'removeVertex', args: { id } });
  }

  /**
   * Add an edge between two vertices.
   * @param {string} from
   * @param {string} to
   * @param {number} [weight=1]
   */
  addEdge(from, to, weight = 1) {
    // Auto-create vertices if they don't exist
    if (!this._adjacencyList.has(from)) this.addVertex(from);
    if (!this._adjacencyList.has(to)) this.addVertex(to);

    const fromVertex = this._adjacencyList.get(from);

    // Avoid duplicate edges
    if (!fromVertex.edges.find(e => e.to === to)) {
      fromVertex.edges.push({ to, weight });
    }

    // For undirected graphs, add reverse edge
    if (!this.directed) {
      const toVertex = this._adjacencyList.get(to);
      if (!toVertex.edges.find(e => e.to === from)) {
        toVertex.edges.push({ to: from, weight });
      }
    }

    this.history.push({ op: 'addEdge', args: { from, to, weight } });
  }

  /**
   * Remove an edge between two vertices.
   * @param {string} from
   * @param {string} to
   */
  removeEdge(from, to) {
    const fromVertex = this._adjacencyList.get(from);
    if (fromVertex) {
      fromVertex.edges = fromVertex.edges.filter(e => e.to !== to);
    }

    if (!this.directed) {
      const toVertex = this._adjacencyList.get(to);
      if (toVertex) {
        toVertex.edges = toVertex.edges.filter(e => e.to !== from);
      }
    }

    this.history.push({ op: 'removeEdge', args: { from, to } });
  }

  /**
   * Get all neighbor IDs of a vertex.
   * @param {string} id
   * @returns {string[]}
   */
  getNeighbors(id) {
    const vertex = this._adjacencyList.get(id);
    return vertex ? vertex.edges.map(e => e.to) : [];
  }

  /**
   * Get vertex data.
   * @param {string} id
   * @returns {any}
   */
  getVertexData(id) {
    const vertex = this._adjacencyList.get(id);
    return vertex ? vertex.data : null;
  }

  /* ── Traversals ── */

  /**
   * Breadth-First Search.
   * Uses a queue to explore vertices level by level.
   *
   * Time: O(V + E)
   * Space: O(V)
   *
   * @param {string} startId - Starting vertex
   * @returns {{ visited: string[], steps: Object[] }}
   */
  bfs(startId) {
    if (!this._adjacencyList.has(startId)) {
      return { visited: [], steps: [] };
    }

    const visited = new Set();
    const queue = [startId];
    const result = [];
    const steps = [];

    visited.add(startId);

    while (queue.length > 0) {
      const current = queue.shift();
      result.push(current);

      const neighbors = this.getNeighbors(current);
      const newNeighbors = [];

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
          newNeighbors.push(neighbor);
        }
      }

      steps.push({
        vertex: current,
        action: 'visit',
        queue: [...queue],
        discovered: newNeighbors,
        description: `Visit '${current}' → discover [${newNeighbors.join(', ')}] → queue: [${queue.join(', ')}]`,
      });
    }

    return { visited: result, steps };
  }

  /**
   * Depth-First Search (iterative, using stack).
   *
   * Time: O(V + E)
   * Space: O(V)
   *
   * @param {string} startId - Starting vertex
   * @returns {{ visited: string[], steps: Object[] }}
   */
  dfs(startId) {
    if (!this._adjacencyList.has(startId)) {
      return { visited: [], steps: [] };
    }

    const visited = new Set();
    const stack = [startId];
    const result = [];
    const steps = [];

    while (stack.length > 0) {
      const current = stack.pop();

      if (visited.has(current)) continue;
      visited.add(current);
      result.push(current);

      const neighbors = this.getNeighbors(current).reverse(); // Reverse for consistent ordering
      const newNeighbors = [];

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
          newNeighbors.push(neighbor);
        }
      }

      steps.push({
        vertex: current,
        action: 'visit',
        stack: [...stack],
        discovered: newNeighbors,
        description: `Visit '${current}' → push [${newNeighbors.join(', ')}] → stack: [${stack.join(', ')}]`,
      });
    }

    return { visited: result, steps };
  }

  /**
   * Find the shortest path between two vertices using BFS.
   * Works only for unweighted graphs (or uniform weight).
   *
   * @param {string} from
   * @param {string} to
   * @returns {{ path: string[], distance: number } | null}
   */
  shortestPath(from, to) {
    if (!this._adjacencyList.has(from) || !this._adjacencyList.has(to)) {
      return null;
    }

    const visited = new Set();
    const queue = [{ vertex: from, path: [from] }];
    visited.add(from);

    while (queue.length > 0) {
      const { vertex, path } = queue.shift();

      if (vertex === to) {
        return { path, distance: path.length - 1 };
      }

      for (const neighbor of this.getNeighbors(vertex)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ vertex: neighbor, path: [...path, neighbor] });
        }
      }
    }

    return null; // No path found
  }

  /**
   * Topological Sort using DFS (Kahn's algorithm alternative).
   * Only valid for Directed Acyclic Graphs (DAGs).
   *
   * Time: O(V + E)
   * Space: O(V)
   *
   * @returns {{ order: string[], steps: Object[] }}
   */
  topologicalSort() {
    if (!this.directed) {
      throw new Error('Topological sort requires a directed graph');
    }

    const visited = new Set();
    const stack = [];
    const steps = [];

    const dfsVisit = (vertexId) => {
      visited.add(vertexId);
      const neighbors = this.getNeighbors(vertexId);

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfsVisit(neighbor);
        }
      }

      stack.push(vertexId);
      steps.push({
        vertex: vertexId,
        action: 'finish',
        currentOrder: [...stack].reverse(),
        description: `Finished '${vertexId}' → push to result`,
      });
    };

    // Visit all vertices (handles disconnected components)
    for (const [vertexId] of this._adjacencyList) {
      if (!visited.has(vertexId)) {
        dfsVisit(vertexId);
      }
    }

    const order = stack.reverse();
    return { order, steps };
  }

  /* ── Representation Exports ── */

  /**
   * Get the adjacency list representation.
   * @returns {Object} { vertexId: [neighborId, ...], ... }
   */
  getAdjacencyList() {
    const result = {};
    for (const [id, vertex] of this._adjacencyList) {
      result[id] = vertex.edges.map(e => ({
        to: e.to,
        weight: e.weight,
      }));
    }
    return result;
  }

  /**
   * Get the adjacency matrix representation.
   * @returns {{ matrix: number[][], labels: string[] }}
   */
  getAdjacencyMatrix() {
    const labels = [...this._adjacencyList.keys()];
    const n = labels.length;
    const indexMap = new Map(labels.map((id, i) => [id, i]));

    const matrix = Array.from({ length: n }, () => Array(n).fill(0));

    for (const [id, vertex] of this._adjacencyList) {
      const fromIdx = indexMap.get(id);
      for (const edge of vertex.edges) {
        const toIdx = indexMap.get(edge.to);
        if (toIdx !== undefined) {
          matrix[fromIdx][toIdx] = edge.weight;
        }
      }
    }

    return { matrix, labels };
  }

  /**
   * Get all vertex IDs.
   * @returns {string[]}
   */
  get vertices() {
    return [...this._adjacencyList.keys()];
  }

  /**
   * Get all edges as { from, to, weight } objects.
   * @returns {{ from: string, to: string, weight: number }[]}
   */
  get edges() {
    const edgeList = [];
    const seen = new Set();

    for (const [id, vertex] of this._adjacencyList) {
      for (const edge of vertex.edges) {
        const key = this.directed
          ? `${id}->${edge.to}`
          : [id, edge.to].sort().join('<->');

        if (!seen.has(key)) {
          seen.add(key);
          edgeList.push({ from: id, to: edge.to, weight: edge.weight });
        }
      }
    }

    return edgeList;
  }

  /**
   * Get the vertex count.
   */
  get vertexCount() {
    return this._adjacencyList.size;
  }

  /**
   * Get the edge count.
   */
  get edgeCount() {
    return this.edges.length;
  }
}

/**
 * Create a sample subject-relationship graph from BatchHub data.
 * Subjects are vertices; edges connect subjects that share post tags.
 *
 * @param {Object[]} subjects - Array of subject objects
 * @param {Object[]} posts - Array of post objects
 * @returns {Graph}
 */
export function buildSubjectGraph(subjects, posts) {
  const graph = new Graph(false); // Undirected

  // Add subjects as vertices
  for (const subject of subjects) {
    graph.addVertex(subject.id, { name: subject.name, code: subject.code });
  }

  // Build tag-to-subjects mapping
  const tagToSubjects = new Map();
  for (const post of posts) {
    if (!post.subject_id || !post.tags) continue;
    for (const tag of post.tags) {
      if (!tagToSubjects.has(tag)) {
        tagToSubjects.set(tag, new Set());
      }
      tagToSubjects.get(tag).add(post.subject_id);
    }
  }

  // Connect subjects that share tags
  for (const [, subjectIds] of tagToSubjects) {
    const ids = [...subjectIds];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        graph.addEdge(ids[i], ids[j]);
      }
    }
  }

  return graph;
}
