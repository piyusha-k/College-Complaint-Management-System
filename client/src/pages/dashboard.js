import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import AppShell from '@/components/AppShell/AppShell';
import MetricGrid from '@/components/MetricGrid/MetricGrid';
import api from '@/services/api';
import { getSocket } from '@/services/socket';
import {
  Sparkles,
  Play,
  GitFork,
  Activity,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Radio,
  Cpu,
  Layers,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await api.get('/workflows/dashboard');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen for live global execution updates
    const socket = getSocket();
    if (socket) {
      const handleExecutionUpdate = () => {
        fetchDashboardData(false);
      };

      const handleAgentActivity = (activity) => {
        setData((prev) => {
          if (!prev) return prev;
          const newFeed = [
            {
              id: activity.id || Date.now(),
              agent: activity.agent,
              level: activity.level,
              message: activity.message,
              timestamp: activity.timestamp || new Date(),
              workflowName: 'Execution Event',
              nodeId: activity.nodeId,
            },
            ...(prev.activityFeed || []).slice(0, 11),
          ];
          return { ...prev, activityFeed: newFeed };
        });
      };

      socket.on('execution:update', handleExecutionUpdate);
      socket.on('agent:activity', handleAgentActivity);

      return () => {
        socket.off('execution:update', handleExecutionUpdate);
        socket.off('agent:activity', handleAgentActivity);
      };
    }
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData(false);
  };

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
      <AppShell breadcrumbs={[{ label: 'Operations Dashboard' }]}>
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                Operator Mission Console
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Autonomous workflow orchestrator, live agent execution telemetry, and status monitors.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all active:scale-95"
                title="Refresh Metrics"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              </button>

              <Link
                href="/workflows/builder"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/20 active:scale-95 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" /> Prompt-to-Workflow
              </Link>
            </div>
          </div>

          {/* Metric Grid KPIs */}
          <MetricGrid metrics={data?.metrics || {}} />

          {/* Dual Split: Recent Executions & Agent Activity Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Recent Executions Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Recent Workflow Executions
                  </h2>
                </div>
                <Link
                  href="/executions"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  View All Runs <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
                {!data?.recentExecutions || data.recentExecutions.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 space-y-3">
                    <Activity className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                    <p className="text-xs">No execution runs recorded yet.</p>
                    <Link
                      href="/workflows"
                      className="inline-block px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium"
                    >
                      Run a Workflow &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Workflow Name</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Duration</th>
                          <th className="py-3 px-4">Confidence</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {data.recentExecutions.map((exec) => (
                          <tr key={exec.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-200">{exec.workflowName}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {new Date(exec.startTime).toLocaleString()}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">{getStatusBadge(exec.status)}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-300">
                              {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : 'In progress...'}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-indigo-300">
                              {Math.round((exec.confidence || 0.95) * 100)}%
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Link
                                href={`/executions/${exec.id}`}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 border border-slate-700 hover:border-indigo-500/40 text-[11px] font-medium transition-all"
                              >
                                Timeline &rarr;
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

            {/* Right 1 Col: Live AI Activity Feed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-pink-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Live Agent Telemetry
                  </h2>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live
                </span>
              </div>

              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-3 shadow-xl max-h-[460px] overflow-y-auto">
                {!data?.activityFeed || data.activityFeed.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No active agent events streaming. Run an automation to observe the 5-agent chain in action.
                  </div>
                ) : (
                  data.activityFeed.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold uppercase tracking-wider text-indigo-300">
                          {act.agent?.toUpperCase()} AGENT
                        </span>
                        <span className="text-slate-500 font-mono">
                          {new Date(act.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-snug text-[11px]">{act.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
