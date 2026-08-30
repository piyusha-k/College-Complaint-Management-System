import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Zap,
  Cpu,
  Mail,
  MessageSquare,
  FileSpreadsheet,
  Layers,
  Sparkles,
  GitBranch,
  CheckCircle,
} from 'lucide-react';

const getServiceIcon = (service, type) => {
  const s = (service || '').toLowerCase();
  if (s === 'gmail') return <Mail className="w-4 h-4 text-rose-400" />;
  if (s === 'slack') return <MessageSquare className="w-4 h-4 text-emerald-400" />;
  if (s === 'discord') return <MessageSquare className="w-4 h-4 text-indigo-400" />;
  if (s === 'google-sheets') return <FileSpreadsheet className="w-4 h-4 text-teal-400" />;
  if (s === 'gemini' || s === 'openai' || s === 'anthropic' || type === 'agent') {
    return <Sparkles className="w-4 h-4 text-violet-400" />;
  }
  if (type === 'trigger') return <Zap className="w-4 h-4 text-amber-400" />;
  if (type === 'condition') return <GitBranch className="w-4 h-4 text-cyan-400" />;
  return <Layers className="w-4 h-4 text-slate-400" />;
};

export const TriggerNode = memo(({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-2xl bg-slate-900/90 border transition-all min-w-[220px] shadow-xl ${
        selected
          ? 'border-amber-400 shadow-amber-500/20 ring-2 ring-amber-400/30'
          : 'border-amber-500/40 hover:border-amber-400/70'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
          {getServiceIcon(data.service, 'trigger')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Trigger Event</div>
          <div className="text-xs font-semibold text-slate-100 truncate">{data.label || 'Trigger'}</div>
        </div>
      </div>
      {data.description && <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{data.description}</p>}
      <Handle type="source" position={Position.Bottom} className="!bg-amber-400" />
    </div>
  );
});

export const AgentNode = memo(({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-2xl bg-slate-900/90 border transition-all min-w-[220px] shadow-xl ${
        selected
          ? 'border-violet-400 shadow-violet-500/20 ring-2 ring-violet-400/30'
          : 'border-violet-500/40 hover:border-violet-400/70'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-violet-400" />
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <Sparkles className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-violet-400">AI Agent Step</div>
          <div className="text-xs font-semibold text-slate-100 truncate">{data.label || 'Agent Decision'}</div>
        </div>
      </div>
      {data.description && <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{data.description}</p>}
      <Handle type="source" position={Position.Bottom} className="!bg-violet-400" />
    </div>
  );
});

export const IntegrationNode = memo(({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-2xl bg-slate-900/90 border transition-all min-w-[220px] shadow-xl ${
        selected
          ? 'border-cyan-400 shadow-cyan-500/20 ring-2 ring-cyan-400/30'
          : 'border-cyan-500/40 hover:border-cyan-400/70'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-cyan-400" />
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          {getServiceIcon(data.service, 'integration')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            {data.service || 'Integration'}
          </div>
          <div className="text-xs font-semibold text-slate-100 truncate">{data.label || 'Dispatch Action'}</div>
        </div>
      </div>
      {data.description && <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{data.description}</p>}
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400" />
    </div>
  );
});

export const ConditionNode = memo(({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-2xl bg-slate-900/90 border transition-all min-w-[220px] shadow-xl ${
        selected
          ? 'border-emerald-400 shadow-emerald-500/20 ring-2 ring-emerald-400/30'
          : 'border-emerald-500/40 hover:border-emerald-400/70'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-emerald-400" />
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <GitBranch className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Logic / Branch</div>
          <div className="text-xs font-semibold text-slate-100 truncate">{data.label || 'Condition Check'}</div>
        </div>
      </div>
      {data.description && <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{data.description}</p>}
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-400" />
    </div>
  );
});

export const ActionNode = memo(({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-2xl bg-slate-900/90 border transition-all min-w-[220px] shadow-xl ${
        selected
          ? 'border-indigo-400 shadow-indigo-500/20 ring-2 ring-indigo-400/30'
          : 'border-slate-700 hover:border-slate-500'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-indigo-400" />
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <Layers className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Action Step</div>
          <div className="text-xs font-semibold text-slate-100 truncate">{data.label || 'Action'}</div>
        </div>
      </div>
      {data.description && <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{data.description}</p>}
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-400" />
    </div>
  );
});
