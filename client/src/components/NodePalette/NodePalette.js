import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  Mail,
  MessageSquare,
  FileSpreadsheet,
  GitBranch,
  Layers,
  Search,
  Plus,
  Bot,
} from 'lucide-react';

const PALETTE_ITEMS = [
  {
    category: 'Triggers',
    items: [
      {
        type: 'trigger',
        label: 'Webhook Trigger',
        description: 'Receives HTTP JSON payload',
        service: 'custom',
        action: 'webhook',
        icon: Zap,
        color: 'text-amber-400',
        config: { endpoint: '/api/v1/events' },
      },
      {
        type: 'trigger',
        label: 'Schedule Trigger',
        description: 'Periodic cron schedule',
        service: 'custom',
        action: 'schedule',
        icon: Zap,
        color: 'text-amber-400',
        config: { cron: '0 9 * * 1-5' },
      },
    ],
  },
  {
    category: 'AI Agents',
    items: [
      {
        type: 'agent',
        label: 'AI Sentiment & Urgency Agent',
        description: 'Scores sentiment, urgency & extracts intent',
        service: 'gemini',
        action: 'analyze_sentiment',
        icon: Sparkles,
        color: 'text-violet-400',
        config: { prompt: 'Analyze incoming text urgency.' },
      },
      {
        type: 'agent',
        label: 'AI Data Extraction Agent',
        description: 'Extracts structured entities & values',
        service: 'openai',
        action: 'extract_entities',
        icon: Bot,
        color: 'text-violet-400',
        config: { targetFields: 'name, email, total' },
      },
      {
        type: 'agent',
        label: 'AI Content Drafter',
        description: 'Drafts responses, summaries & alerts',
        service: 'gemini',
        action: 'summarize',
        icon: Sparkles,
        color: 'text-violet-400',
        config: { tone: 'professional' },
      },
    ],
  },
  {
    category: 'Integrations',
    items: [
      {
        type: 'integration',
        label: 'Gmail Send Email',
        description: 'Sends email to specified recipient',
        service: 'gmail',
        action: 'send_email',
        icon: Mail,
        color: 'text-rose-400',
        config: { to: 'operator@example.com', subject: 'Automated Alert' },
      },
      {
        type: 'integration',
        label: 'Slack Post Message',
        description: 'Posts message to Slack channel',
        service: 'slack',
        action: 'post_message',
        icon: MessageSquare,
        color: 'text-emerald-400',
        config: { channel: '#operations', text: 'Workflow alert triggered' },
      },
      {
        type: 'integration',
        label: 'Discord Send Alert',
        description: 'Sends notification to Discord channel',
        service: 'discord',
        action: 'post_message',
        icon: MessageSquare,
        color: 'text-indigo-400',
        config: { channel: '#alerts', text: 'Event logged' },
      },
      {
        type: 'integration',
        label: 'Google Sheets Append',
        description: 'Appends row data to spreadsheet',
        service: 'google-sheets',
        action: 'append_row',
        icon: FileSpreadsheet,
        color: 'text-teal-400',
        config: { spreadsheetId: 'ops-sheet-1', range: 'Sheet1!A:E' },
      },
    ],
  },
  {
    category: 'Logic & Flow',
    items: [
      {
        type: 'condition',
        label: 'Conditional Branch',
        description: 'Branch based on condition evaluation',
        service: 'custom',
        action: 'condition',
        icon: GitBranch,
        color: 'text-emerald-400',
        config: { expression: 'output.urgency == "P1"' },
      },
    ],
  },
];

export default function NodePalette({ onAddNode }) {
  const [searchTerm, setSearchTerm] = useState('');

  const onDragStart = (event, nodeData) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredCategories = PALETTE_ITEMS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.service.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="w-64 h-full bg-slate-950/80 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Header & Search */}
      <div className="p-3.5 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Node Palette</span>
          <span className="text-[10px] text-slate-500">Drag or Click +</span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search nodes..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Nodes list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {filteredCategories.map((cat, idx) => (
          <div key={idx} className="space-y-2">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              {cat.category}
            </div>

            <div className="space-y-1.5">
              {cat.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={itemIdx}
                    draggable
                    onDragStart={(e) => onDragStart(e, item)}
                    onClick={() => onAddNode && onAddNode(item)}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-600 hover:bg-slate-800/80 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg bg-slate-950/80 border border-white/5 ${item.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-200 truncate group-hover:text-white">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{item.description}</div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddNode && onAddNode(item);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white transition-all shrink-0 ml-1"
                      title="Add to canvas"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
