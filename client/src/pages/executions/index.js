import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import AppShell from '@/components/AppShell/AppShell';
import api from '@/services/api';
import { getSocket } from '@/services/socket';
import {
  PlaySquare,
  Activity,
  CheckCircle2,
  AlertOctagon,
  Radio,
  Clock,
  Filter,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function ExecutionsListPage() {
  const [executions, setExecutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchExecutions = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await api.get('/executions', {
        params: { status: statusFilter },
      });
      setExecutions(res.data.data.executions);
    } catch (err) {
      console.error('Failed to load executions:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExecutions();

    const socket = getSocket();
    if (socket) {
      const handleExecutionUpdate = () => {
        fetchExecutions(false);
      };

      socket.on('execution:update', handleExecutionUpdate);
      return () => {
        socket.off('execution:update', handleExecutionUpdate);
      };
    }
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> COMPLETED
          </span>
        );
      case 'RUNNING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 animate-pulse">
            <Radio className="w-3 h-3 text-cyan-400" /> RUNNING
          </span>
        );
      case 'RETRYING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            RETRYING
          </span>
        );
      case 'PAUSED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            PAUSED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            CANCELLED
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3" /> FAILED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            {status || 'PENDING'}
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell breadcrumbs={[{ label: 'Executions History' }]}>
        <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <PlaySquare className="w-6 h-6 text-emerald-400" /> Complaint Timeline
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Track complaint status updates, assignments, and resolution history across campus teams.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsRefreshing(true);
                  fetchExecutions(false);
                }}
                disabled={isRefreshing}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all active:scale-95"
                title="Refresh List"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-400 font-semibold">Filter by Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Complaints</option>
                <option value="COMPLETED">Resolved</option>
                <option value="RUNNING">In Progress</option>
                <option value="FAILED">Escalated</option>
                <option value="PAUSED">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <span className="text-xs text-slate-500 font-mono">{executions.length} Complaints Logged</span>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
            {isLoading ? (
              <div className="p-16 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
                <p className="text-xs">Loading execution timeline runs...</p>
              </div>
            ) : executions.length === 0 ? (
              <div className="p-16 text-center text-slate-500 space-y-3">
                <Activity className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-300">No executions recorded</h3>
                <p className="text-xs text-slate-500">Submit a complaint to start tracking resolution history.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Run Identifier</th>
                      <th className="py-3.5 px-4">Workflow Name</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Retries</th>
                      <th className="py-3.5 px-4">Timestamp</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {executions.map((exec) => (
                      <tr key={exec._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4 font-mono text-[11px] text-slate-400">
                          {exec._id.slice(0, 8)}...
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-200">
                          {exec.workflowSnapshot?.name || exec.workflowId?.name || 'Complaint' }
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(exec.status)}</td>
                        <td className="py-4 px-4 font-mono text-slate-300">
                          {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : 'In progress...'}
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-400">{exec.retryCount || 0}</td>
                        <td className="py-4 px-4 text-slate-400 text-[11px]">
                          {new Date(exec.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/executions/${exec._id}`}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold inline-flex items-center gap-1 transition-all"
                          >
                            Live Timeline <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
