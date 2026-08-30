import React, { useState, useEffect } from 'react';
import { X, Trash2, Sliders, Info, Variable, Check } from 'lucide-react';

export default function NodeConfigPanel({ node, allNodes = [], onUpdate, onDelete, onClose }) {
  if (!node) return null;

  const data = node.data || {};
  const [label, setLabel] = useState(data.label || '');
  const [description, setDescription] = useState(data.description || '');
  const [service, setService] = useState(data.service || 'custom');
  const [action, setAction] = useState(data.action || 'execute');
  const [configJson, setConfigJson] = useState(JSON.stringify(data.config || {}, null, 2));
  const [configError, setConfigError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLabel(data.label || '');
    setDescription(data.description || '');
    setService(data.service || 'custom');
    setAction(data.action || 'execute');
    setConfigJson(JSON.stringify(data.config || {}, null, 2));
    setConfigError(null);
    setIsSaved(false);
  }, [node.id, data]);

  const handleApply = () => {
    try {
      const parsedConfig = configJson.trim() === '' ? {} : JSON.parse(configJson);
      setConfigError(null);

      onUpdate(node.id, {
        label,
        description,
        service,
        action,
        config: parsedConfig,
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      setConfigError('Invalid JSON format in configuration');
    }
  };

  const otherNodes = allNodes.filter((n) => n.id !== node.id);

  return (
    <div className="w-80 h-full bg-slate-950/90 border-l border-slate-800 flex flex-col shrink-0 shadow-2xl z-20">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Node Configuration</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Node ID indicator */}
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Node Identifier</span>
          <span className="font-mono text-indigo-300">{node.id}</span>
        </div>

        {/* Label */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-300">Step Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-300">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Service */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-300">Service / Provider</label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="custom">Custom / System Logic</option>
            <option value="gmail">Gmail</option>
            <option value="slack">Slack</option>
            <option value="discord">Discord</option>
            <option value="google-sheets">Google Sheets</option>
            <option value="gemini">Google Gemini AI</option>
            <option value="openai">OpenAI / OpenRouter</option>
          </select>
        </div>

        {/* Action */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-300">Action Method</label>
          <input
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-100 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Config JSON */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-300">Parameters (JSON)</label>
            {configError && <span className="text-[10px] text-rose-400 font-medium">{configError}</span>}
          </div>
          <textarea
            rows={6}
            value={configJson}
            onChange={(e) => {
              setConfigJson(e.target.value);
              setConfigError(null);
            }}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-100 font-mono text-[11px] focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>

        {/* Template Variables Helper */}
        {otherNodes.length > 0 && (
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold uppercase">
              <Variable className="w-3 h-3 text-indigo-400" />
              Dynamic Upstream Variables
            </div>
            <div className="space-y-1">
              {otherNodes.slice(0, 4).map((n) => (
                <div key={n.id} className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[120px]">{n.data?.label || n.id}</span>
                  <code className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300 border border-slate-800">
                    {`{{${n.id}.output}}`}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={() => onDelete(node.id)}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Delete Node"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={handleApply}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all ${
            isSaved
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-95'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5" /> Applied!
            </>
          ) : (
            'Apply Changes'
          )}
        </button>
      </div>
    </div>
  );
}
