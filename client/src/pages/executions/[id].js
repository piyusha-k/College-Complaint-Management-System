import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import AppShell from '@/components/AppShell/AppShell';
import WorkflowCanvas from '@/components/WorkflowCanvas/WorkflowCanvas';
import TimelineView from '@/components/ExecutionLogs/TimelineView';
import api from '@/services/api';
import { getSocket, joinExecutionRoom, leaveExecutionRoom } from '@/services/socket';
import {
  PlaySquare,
  Pause,
  Play,
  Square,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertOctagon,
  Radio,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  FileJson,
} from 'lucide-react';

export default function ExecutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('split'); // 'split' | 'timeline' | 'graph' | 'data'
  const [isActionPending, setIsActionPending] = useState(false);

  const fetchExecutionData = async () => {
    try {
      const res = await api.get(`/executions/${id}/timeline`);
      setExecution(res.data.data.execution);
      setLogs(res.data.data.logs || []);
    } catch (err) {
      console.error('Failed to load execution timeline:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    fetchExecutionData();
    joinExecutionRoom(id);

    const socket = getSocket();
    if (socket) {
      const handleAgentEvent = (event) => {
        setLogs((prev) => [...prev, event]);
      };

      const handleStatusChange = (statusData) => {
        setExecution((prev) => (prev ? { ...prev, ...statusData } : prev));
      };

      socket.on('agent:event', handleAgentEvent);
      socket.on('execution:status', handleStatusChange);

      return () => {
        socket.off('agent:event', handleAgentEvent);
        socket.off('execution:status', handleStatusChange);
        leaveExecutionRoom(id);
      };
    }
  }, [id]);

  const handlePause = async () => {
    setIsActionPending(true);
    try {
      await api.post(`/executions/${id}/pause`);
      fetchExecutionData();
    } catch (err) {
      alert(`Pause failed: ${err.message}`);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleResume = async () => {
    setIsActionPending(true);
    try {
      await api.post(`/executions/${id}/resume`);
      fetchExecutionData();
    } catch (err) {
      alert(`Resume failed: ${err.message}`);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to terminate this execution?')) return;
    setIsActionPending(true);
    try {
      await api.post(`/executions/${id}/cancel`);
      fetchExecutionData();
    } catch (err) {
      alert(`Cancel failed: ${err.message}`);
    } finally {
      setIsActionPending(false);
    }
  };

  if (isLoading || !execution) {
    return (
      <ProtectedRoute>
        <AppShell breadcrumbs={[{ label: 'Executions', href: '/executions' }, { label: 'Audit Run' }]}>
          <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
            <p className="text-xs">Synchronizing execution timeline stream...</p>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const snapshot = execution.workflowSnapshot || {};
  const isRunning = execution.status === 'RUNNING' || execution.status === 'PENDING' || execution.status === 'RETRYING';
  const isPaused = execution.status === 'PAUSED';

  return (
    <ProtectedRoute>
      <AppShell
        breadcrumbs={[
          { label: 'Executions', href: '/executions' },
          { label: `Run #${id.slice(0, 8)}` },
        ]}
      >
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-[#090d16]">
          {/* Top Control Bar */}
          <div className="h-16 border-b border-slate-800 bg-slate-950/80 px-4 lg:px-6 flex items-center justify-between shrink-0 z-10">
            <div className="flex items-center gap-3">
              <Link
                href="/executions"
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Back to executions"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xs font-bold text-slate-100">{snapshot.name || 'Workflow Run'}</h1>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      execution.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : execution.status === 'RUNNING'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse'
                        : execution.status === 'FAILED'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : execution.status === 'PAUSED'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {execution.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5">
                  <span className="font-mono">ID: {execution._id}</span>
                  {execution.duration ? (
                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      <Clock className="w-3 h-3" /> {(execution.duration / 1000).toFixed(2)}s
                    </span>
                  ) : null}
                  <span className="text-indigo-400 font-mono">
                    Planner Confidence: {Math.round((execution.agentMetrics?.plannerConfidence || 0.95) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Execution Controls & Tabs */}
            <div className="flex items-center gap-3">
              {/* Tab Selector */}
              <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
                <button
                  onClick={() => setActiveTab('split')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === 'split' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === 'timeline'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Agent Timeline
                </button>
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === 'data' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Outputs & Data
                </button>
              </div>

              {/* Pause / Resume / Cancel Buttons */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                {isRunning && (
                  <button
                    onClick={handlePause}
                    disabled={isActionPending}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1 transition-all"
                    title="Pause Execution"
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                )}

                {isPaused && (
                  <button
                    onClick={handleResume}
                    disabled={isActionPending}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-md"
                  >
                    <Play className="w-3.5 h-3.5" /> Resume
                  </button>
                )}

                {isRunning && (
                  <button
                    onClick={handleCancel}
                    disabled={isActionPending}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-rose-400 text-xs font-semibold flex items-center gap-1 transition-all"
                    title="Cancel Execution"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden p-4">
            {activeTab === 'split' && (
              <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Workflow Graph Snapshot with Current Node highlight */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden relative shadow-xl flex flex-col">
                  <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      Runtime Graph Snapshot
                    </span>
                    {execution.currentNode && (
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 animate-pulse">
                        Active Node: {execution.currentNode}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <WorkflowCanvas
                      nodes={snapshot.nodes || []}
                      edges={snapshot.edges || []}
                      readOnly={true}
                      activeNodeId={execution.currentNode}
                    />
                  </div>
                </div>

                {/* Right: Live Agent Timeline */}
                <div className="h-full">
                  <TimelineView logs={logs} isLive={isRunning} />
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="h-full max-w-4xl mx-auto">
                <TimelineView logs={logs} isLive={isRunning} />
              </div>
            )}

            {activeTab === 'data' && (
              <div className="h-full max-w-4xl mx-auto overflow-y-auto space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-indigo-400" />
                    Accumulated Step Outputs
                  </h3>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                    {JSON.stringify(execution.outputs || execution.nodeOutputs || {}, null, 2)}
                  </pre>
                </div>

                {execution.error && execution.error.message && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
                    <div className="font-bold text-rose-400 flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4" />
                      Execution Error Diagnostics
                    </div>
                    <p className="text-rose-200 font-semibold">{execution.error.message}</p>
                    {execution.error.stack && (
                      <pre className="p-3 rounded-lg bg-slate-950 border border-rose-500/20 text-[11px] font-mono text-rose-300 overflow-x-auto">
                        {execution.error.stack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
