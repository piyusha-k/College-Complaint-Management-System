import React, { useEffect } from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { X, CheckCircle2, AlertTriangle, AlertOctagon, Info, CheckCheck } from 'lucide-react';
import Link from 'next/link';

export default function NotificationDrawer() {
  const { isDrawerOpen, setDrawerOpen, notifications, unreadCount, fetchNotifications, markAsRead } = useNotificationStore();

  useEffect(() => {
    if (isDrawerOpen) {
      fetchNotifications();
    }
  }, [isDrawerOpen, fetchNotifications]);

  if (!isDrawerOpen) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'escalation':
      case 'failure':
        return <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100">Live Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAsRead('all')}
                  className="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center">
                <Info className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No notifications recorded yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id || n.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    n.isRead
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-75'
                      : 'bg-slate-800/50 border-slate-700/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getTypeIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-200 truncate">{n.title}</p>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>

                      {n.executionId && (
                        <div className="mt-2 flex items-center justify-between">
                          <Link
                            href={`/executions/${typeof n.executionId === 'object' ? n.executionId._id : n.executionId}`}
                            onClick={() => setDrawerOpen(false)}
                            className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
                          >
                            View Execution Run &rarr;
                          </Link>
                          {!n.isRead && (
                            <button
                              onClick={() => markAsRead(n._id || n.id)}
                              className="text-[10px] text-slate-500 hover:text-slate-300"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
