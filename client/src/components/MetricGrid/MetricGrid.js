import React from 'react';
import { GitFork, Activity, CheckCircle2, Clock, AlertTriangle, Zap } from 'lucide-react';

export default function MetricGrid({ metrics = {} }) {
  const cards = [
    {
      title: 'Open Complaints',
      value: metrics.activeWorkflows ?? 0,
      subValue: `of ${metrics.totalWorkflows ?? 0} total complaints`,
      icon: GitFork,
      color: 'from-violet-500/20 to-purple-500/5',
      borderColor: 'border-violet-500/30',
      iconColor: 'text-violet-400',
      badge: 'Live',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    },
    {
      title: 'Total Reports',
      value: metrics.totalExecutions ?? 0,
      subValue: `${metrics.runningExecutions ?? 0} currently active`,
      icon: Activity,
      color: 'from-cyan-500/20 to-blue-500/5',
      borderColor: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
      badge: `${metrics.runningExecutions ?? 0} Active`,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      title: 'Resolved Rate',
      value: `${metrics.successRate ?? 100}%`,
      subValue: `${metrics.completedExecutions ?? 0} resolved complaints`,
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/5',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      badge: 'High Reliability',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      title: 'Avg Resolution Time',
      value: `${((metrics.avgDurationMs ?? 0) / 1000).toFixed(2)}s`,
      subValue: `${metrics.failedExecutions ?? 0} escalated or pending`,
      icon: Clock,
      color: 'from-amber-500/20 to-orange-500/5',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      badge: 'Campus Support',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-gradient-to-b ${card.color} bg-slate-900/60 border ${card.borderColor} backdrop-blur-sm shadow-xl flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-2xl`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
              <div className={`p-2 rounded-xl bg-slate-950/60 border border-white/5 ${card.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="my-3">
              <div className="text-3xl font-extrabold text-white tracking-tight">{card.value}</div>
              <p className="text-xs text-slate-400 mt-1">{card.subValue}</p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                {card.badge}
              </span>
              <span className="text-[10px] text-slate-500">Complaint Flow</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
