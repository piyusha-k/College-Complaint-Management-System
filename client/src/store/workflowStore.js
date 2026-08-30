import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import api from '../services/api';

export const useWorkflowStore = create((set, get) => ({
  activeWorkflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isDirty: false,
  isLoading: false,
  isSaving: false,
  error: null,

  setWorkflow: (workflow) => {
    set({
      activeWorkflow: workflow,
      nodes: workflow?.nodes || [],
      edges: workflow?.edges || [],
      selectedNode: null,
      isDirty: false,
      error: null,
    });
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true,
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    });
  },

  onConnect: (connection) => {
    const newEdge = {
      ...connection,
      id: `e_${connection.source}_${connection.target}_${Date.now()}`,
      animated: true,
    };
    set({
      edges: addEdge(newEdge, get().edges),
      isDirty: true,
    });
  },

  setSelectedNode: (node) => {
    set({ selectedNode: node });
  },

  addNode: (nodeData) => {
    const id = `node_${Date.now()}`;
    const newNode = {
      id,
      type: nodeData.type || 'action',
      position: nodeData.position || { x: 250, y: 100 + get().nodes.length * 120 },
      data: {
        label: nodeData.label || 'New Step',
        description: nodeData.description || '',
        service: nodeData.service || 'custom',
        action: nodeData.action || 'execute',
        config: nodeData.config || {},
      },
    };

    set({
      nodes: [...get().nodes, newNode],
      selectedNode: newNode,
      isDirty: true,
    });
    return newNode;
  },

  updateNodeData: (nodeId, updatedData) => {
    const updatedNodes = get().nodes.map((n) => {
      if (n.id === nodeId) {
        return {
          ...n,
          data: {
            ...n.data,
            ...updatedData,
          },
        };
      }
      return n;
    });

    const currentSelected = get().selectedNode;
    const newSelected = currentSelected && currentSelected.id === nodeId
      ? updatedNodes.find((n) => n.id === nodeId)
      : currentSelected;

    set({
      nodes: updatedNodes,
      selectedNode: newSelected,
      isDirty: true,
    });
  },

  removeNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
      isDirty: true,
    });
  },

  fetchWorkflow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/workflows/${id}`);
      const workflow = res.data.data.workflow;
      get().setWorkflow(workflow);
      set({ isLoading: false });
      return workflow;
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to fetch workflow';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  saveWorkflow: async () => {
    const { activeWorkflow, nodes, edges } = get();
    if (!activeWorkflow?._id) return;

    set({ isSaving: true });
    try {
      const res = await api.put(`/workflows/${activeWorkflow._id}`, {
        name: activeWorkflow.name,
        description: activeWorkflow.description,
        status: activeWorkflow.status,
        triggerConfig: activeWorkflow.triggerConfig,
        tags: activeWorkflow.tags,
        nodes,
        edges,
      });

      const updated = res.data.data.workflow;
      set({
        activeWorkflow: updated,
        nodes: updated.nodes,
        edges: updated.edges,
        isDirty: false,
        isSaving: false,
      });
      return updated;
    } catch (err) {
      set({ isSaving: false });
      throw err;
    }
  },
}));
