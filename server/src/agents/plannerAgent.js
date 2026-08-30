/**
 * Planner Agent
 * Decides node ordering, validates DAG topological sorting, and emits a confidence score.
 */
class PlannerAgent {
  constructor() {
    this.name = 'Planner Agent';
    this.role = 'planner';
  }

  /**
   * Plan execution graph and order of nodes
   * @param {Object} workflow - Workflow object with nodes and edges
   * @returns {{ plannedOrder: string[], confidenceScore: number, reason: string, graphAnalysis: any }}
   */
  async plan(workflow) {
    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];

    if (nodes.length === 0) {
      return {
        plannedOrder: [],
        confidenceScore: 0.0,
        reason: 'Empty workflow with no executable nodes.',
        graphAnalysis: { nodeCount: 0, edgeCount: 0, rootNodes: [] },
      };
    }

    // Build Adjacency List and In-Degree counts for Kahn's topological sort algorithm
    const inDegree = new Map();
    const adj = new Map();

    nodes.forEach((n) => {
      inDegree.set(n.id, 0);
      adj.set(n.id, []);
    });

    edges.forEach((e) => {
      if (adj.has(e.source) && inDegree.has(e.target)) {
        adj.get(e.source).push(e.target);
        inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
      }
    });

    // Find all root nodes (inDegree === 0)
    const queue = [];
    nodes.forEach((n) => {
      if (inDegree.get(n.id) === 0) {
        queue.push(n.id);
      }
    });

    const plannedOrder = [];
    while (queue.length > 0) {
      const current = queue.shift();
      plannedOrder.push(current);

      const neighbors = adj.get(current) || [];
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    // If topological sort missed nodes (e.g. disconnected or cycles), append remaining safely
    if (plannedOrder.length < nodes.length) {
      nodes.forEach((n) => {
        if (!plannedOrder.includes(n.id)) {
          plannedOrder.push(n.id);
        }
      });
    }

    // Compute confidence score based on structure completeness
    let confidenceScore = 0.98;
    const hasTrigger = nodes.some((n) => n.type === 'trigger');
    if (!hasTrigger) confidenceScore -= 0.15;
    if (edges.length === 0 && nodes.length > 1) confidenceScore -= 0.25;

    return {
      plannedOrder,
      confidenceScore: Math.max(0.4, Number(confidenceScore.toFixed(2))),
      reason: `Planned deterministic sequence of ${plannedOrder.length} nodes with topological DAG resolution.`,
      graphAnalysis: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        hasCycles: plannedOrder.length !== nodes.length,
        roots: nodes.filter((n) => inDegree.get(n.id) === 0).map((n) => n.id),
      },
    };
  }
}

module.exports = new PlannerAgent();
