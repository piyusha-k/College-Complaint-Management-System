import React, { useState } from 'react';
import {
  Activity,
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ChevronDown,
  ChevronRight,
  Clock,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

const getAgentBadge = (agent) => {
  switch (agent) {
    case 'planner':
      return {
        label: 'Planner Agent',
        color: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
        icon: Sparkles,
        dot: 'bg-violet-400',
      };
    case 'execution':
      return {
        label: 'Execution Agent',
        color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        icon: Play,
        dot: 'bg-cyan-400',
      };
    case 'validation':
      return {
        label: 'Validation Agent',
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        icon: ShieldCheck,
        dot: 'bg-emerald-400',
      };
    case 'recovery':
      return {
        label: 'Recovery Agent',
        color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: RotateCcw,
        dot: 'bg-amber-400',
      };
    case 'monitoring':
      return {
        label: 'Monitoring Agent',
        color: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
        icon: Radio,
        dot: 'bg-pink-400',
      };
    default:
      return {
        label: agent || 'Agent',
        color: 'bg-slate-700/40 text-slate-300 border-slate-600',
        icon: Activity,
        dot: 'bg-slate-400',
      };
  }
};

const getLevelBadge = (level) => {
  switch (level) {
    case 'success':
      return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    case 'warning':
      return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    case 'error':
      return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    default:
      return 'text-slate-400 border-slate-700 bg-slate-800/40';
  }
};

export default function TimelineView({ logs = [], isLive = false }) {
  const [expandedLogId, setExpandedLogId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Multi-Agent Execution Timeline
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {isLive && (
            <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Live Streaming
            </div>
          )}
          <span className="text-xs text-slate-500">{logs.length} Events</span>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center">
            <Radio className="w-8 h-8 mb-2 animate-pulse text-slate-600" />
            <p className="text-xs font-sans text-slate-400">Awaiting Agent Chain Execution Events...</p>
          </div>
        ) : (
          logs.map((log, idx) => {
            const agentMeta = getAgentBadge(log.agent);
            const Icon = agentMeta.icon;
            const isExpanded = expandedLogId === (log._id || log.id || idx);
            const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

            return (
              <div
                key={log._id || log.id || idx}
                className="relative pl-6 pb-2 border-l border-slate-800 group last:border-l-0"
              >
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center ${agentMeta.dot}`}
                />

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap font-sans">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${agentMeta.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        {agentMeta.label}
                      </span>

                      {log.nodeId && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {log.nodeId}
                        </span>
                      )}

                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getLevelBadge(
                          log.level
                        )}`}
                      >
                        {log.level || 'INFO'}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp || log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{log.message}</p>

                  {hasMetadata && (
                    <div className="pt-1">
                      <button
                        onClick={() => toggleExpand(log._id || log.id || idx)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-sans transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        {isExpanded ? 'Hide Payload' : 'View Payload Data'}
                      </button>

                      {isExpanded && (
                        <pre className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
