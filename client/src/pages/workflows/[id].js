import React, { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import AppShell from '@/components/AppShell/AppShell';
import WorkflowCanvas from '@/components/WorkflowCanvas/WorkflowCanvas';
import NodePalette from '@/components/NodePalette/NodePalette';
import NodeConfigPanel from '@/components/NodeConfigPanel/NodeConfigPanel';
import { useWorkflowStore } from '@/store/workflowStore';
import api from '@/services/api';
import {
  Save,
  Play,
  ArrowLeft,
  Loader2,
  Check,
  Sparkles,
  GitFork,
  Settings,
  Clock,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;

  const {
    activeWorkflow,
    nodes,
    edges,
    selectedNode,
    isDirty,
    isLoading,
    isSaving,
    fetchWorkflow,
    saveWorkflow,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    addNode,
    updateNodeData,
    removeNode,
  } = useWorkflowStore();

  const [isExecuting, setIsExecuting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchWorkflow(id);
    }
  }, [id, fetchWorkflow]);

  const handleNodeClick = useCallback(
    (_, node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData) return;

      try {
        const item = JSON.parse(rawData);
        // Estimate position based on drop coordinates
        const reactFlowBounds = event.currentTarget.getBoundingClientRect();
        const position = {
          x: Math.round(event.clientX - reactFlowBounds.left - 100),
          y: Math.round(event.clientY - reactFlowBounds.top - 40),
        };

        addNode({
          type: item.type,
          label: item.label,
          description: item.description,
          service: item.service,
          action: item.action,
          config: item.config,
          position,
        });
      } catch (err) {
        console.error('Failed to parse dropped node:', err);
      }
    },
    [addNode]
  );

  const handleSave = async () => {
    try {
      await saveWorkflow();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      alert(`Failed to save workflow: ${err.message}`);
    }
  };

  const handleExecute = async () => {
    if (isDirty) {
      await handleSave();
    }

    setIsExecuting(true);
    try {
      const res = await api.post(`/workflows/${id}/execute`, {
        inputs: { source: 'Visual Canvas Editor' },
      });
      const execId = res.data.data.executionId;
      router.push(`/executions/${execId}`);
    } catch (err) {
      alert(`Execution failed: ${err.message}`);
      setIsExecuting(false);
    }
  };

  if (isLoading || !activeWorkflow) {
    return (
      <ProtectedRoute>
        <AppShell breadcrumbs={[{ label: 'Workflows', href: '/workflows' }, { label: 'Editor' }]}>
          <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
            <p className="text-xs">Loading workflow graph...</p>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell
        breadcrumbs={[
          { label: 'Workflows', href: '/workflows' },
          { label: activeWorkflow.name || 'Editor' },
        ]}
      >
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-[#090d16]">
          {/* Top Canvas Toolbar */}
          <div className="h-14 border-b border-slate-800 bg-slate-950/80 px-4 flex items-center justify-between shrink-0 z-10">
            <div className="flex items-center gap-3">
              <Link
                href="/workflows"
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Back to Workflows"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-xs font-bold text-slate-100">{activeWorkflow.name}</h1>
                  <span className="text-[10px] text-slate-500 font-mono">v{activeWorkflow.version || 1}</span>
                  {isDirty && (
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      Unsaved
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  saveSuccess
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 active:scale-95'
                }`}
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : saveSuccess ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-indigo-400" />
                )}
                {saveSuccess ? 'Saved!' : 'Save Workflow'}
              </button>

              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/20 transition-all border border-indigo-400/20 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {isExecuting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Run Agents Now
              </button>
            </div>
          </div>

          {/* Canvas Workspace: Left Palette | Canvas | Right Config */}
          <div className="flex-1 flex overflow-hidden relative">
            <NodePalette onAddNode={(item) => addNode(item)} />

            <div className="flex-1 relative h-full">
              <WorkflowCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              />
            </div>

            {selectedNode && (
              <NodeConfigPanel
                node={selectedNode}
                allNodes={nodes}
                onUpdate={updateNodeData}
                onDelete={removeNode}
                onClose={() => setSelectedNode(null)}
              />
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
