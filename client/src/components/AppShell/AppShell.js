import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { getSocket, joinUserRoom } from '../../services/socket';
import NotificationDrawer from './NotificationDrawer';
import {
  LayoutDashboard,
  GitFork,
  Sparkles,
  PlaySquare,
  Plug,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Zap,
  Activity,
  Cpu,
  Layers,
  Shield,
} from 'lucide-react';

export default function AppShell({ children, breadcrumbs = [] }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { unreadCount, setDrawerOpen, addNotification, fetchNotifications } = useNotificationStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();
    if (socket && user?.id) {
      joinUserRoom(user.id);

      const handleNewNotification = (notification) => {
        addNotification(notification);
      };

      socket.on('notification:new', handleNewNotification);
      return () => {
        socket.off('notification:new', handleNewNotification);
      };
    }
  }, [user, addNotification, fetchNotifications]);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Workflows', href: '/workflows', icon: GitFork },
    { name: 'AI Builder', href: '/workflows/builder', icon: Sparkles, badge: 'AI Studio' },
    { name: 'Executions', href: '/executions', icon: PlaySquare },
    { name: 'Integrations', href: '/integrations', icon: Plug },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
        {/* Left: Brand & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  Agentflow
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Ops
                </span>
              </div>
            </div>
          </Link>

          {/* Breadcrumb path */}
          {breadcrumbs.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 pl-4 border-l border-slate-800">
              <Link href="/dashboard" className="hover:text-slate-200 transition-colors">
                Console
              </Link>
              {breadcrumbs.map((b, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  {b.href ? (
                    <Link href={b.href} className="hover:text-slate-200 transition-colors">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-slate-200 font-medium">{b.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Action CTAs & User Controls */}
        <div className="flex items-center gap-3">
          <Link
            href="/workflows/builder"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/20 transition-all border border-indigo-400/20 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" /> Prompt-to-Workflow
          </Link>

          {/* Real-time Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Orchestrator: Active</span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-xs text-white shadow-inner">
              {user?.name ? user.name[0].toUpperCase() : 'O'}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-medium text-slate-200 leading-tight truncate max-w-[120px]">
                {user?.name || 'Operator'}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                {user?.role || 'operator'}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* App Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-slate-800/80 bg-slate-950/40 backdrop-blur-sm hidden md:flex flex-col justify-between p-3">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Operations Center
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* 5-Agent Architecture Legend in sidebar */}
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-[11px] space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Agentic Chain
            </div>
            <div className="space-y-1.5 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                <span>Planner Agent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Execution Agent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Validation Agent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Recovery Agent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                <span>Monitoring Agent</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative">{children}</main>
      </div>

      {/* Slide-over Notifications */}
      <NotificationDrawer />
    </div>
  );
}
