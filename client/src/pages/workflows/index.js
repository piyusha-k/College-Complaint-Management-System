import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import AppShell from '@/components/AppShell/AppShell';
import api from '@/services/api';
import {
  GitFork,
  Sparkles,
  Plus,
  Play,
  Copy,
  Trash2,
  Edit,
  Search,
  Filter,
  Layers,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';

export default function WorkflowsListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [runningWorkflowId, setRunningWorkflowId] = useState(null);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/workflows', {
        params: { search: searchTerm, status: selectedStatus },
      });
      setWorkflows(res.data.data.workflows);
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWorkflows();
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await api.post(`/workflows/${id}/duplicate`);
      setWorkflows([res.data.data.workflow, ...workflows]);
    } catch (err) {
      alert(`Failed to duplicate: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      setWorkflows(workflows.filter((w) => w._id !== id));
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleExecute = async (id) => {
    setRunningWorkflowId(id);
    try {
      const res = await api.post(`/workflows/${id}/execute`, { inputs: { triggeredVia: 'Workflows Directory' } });
      const execId = res.data.data.executionId;
      router.push(`/executions/${execId}`);
    } catch (err) {
      alert(`Execution failed to start: ${err.message}`);
      setRunningWorkflowId(null);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell breadcrumbs={[{ label: 'Workflows Directory' }]}>
        <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <GitFork className="w-6 h-6 text-indigo-400" /> Automated Workflows
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Visual DAG workflows powered by multi-agent reasoning and third-party integrations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/workflows/builder"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/20 flex items-center gap-2 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Workflow Builder
              </Link>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search workflows by name or tag..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </form>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          {/* Workflows Grid */}
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
              <p className="text-xs">Loading workflow inventory...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="p-16 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
              <GitFork className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No workflows found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create a workflow manually or describe an automation in the AI Builder to generate a complete visual
                graph in seconds.
              </p>
              <Link
                href="/workflows/builder"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" /> Launch AI Builder
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workflows.map((wf) => (
                <div
                  key={wf._id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-xl group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          wf.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {wf.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">v{wf.version || 1}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {wf.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {wf.description || 'No description provided.'}
                    </p>

                    {/* Tags */}
                    {wf.tags && wf.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {wf.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-indigo-300 border border-slate-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Metrics & Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{wf.nodes?.length || 0} Nodes</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDuplicate(wf._id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(wf._id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={`/workflows/${wf._id}`}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 transition-colors"
                        title="Edit Canvas"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleExecute(wf._id)}
                        disabled={runningWorkflowId === wf._id}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {runningWorkflowId === wf._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        Run
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
