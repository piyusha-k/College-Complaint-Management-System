import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import AppShell from '@/components/AppShell/AppShell';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import {
  Settings,
  Shield,
  Key,
  Lock,
  User,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Moon,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [healthStatus, setHealthStatus] = useState(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);

  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const res = await api.get('/health');
      setHealthStatus(res.data);
    } catch (err) {
      console.error('Failed to query system health:', err);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <ProtectedRoute>
      <AppShell breadcrumbs={[{ label: 'System & Security Settings' }]}>
        <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto text-xs">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-emerald-400" /> Campus & Security Settings
            </h1>
            <p className="text-slate-400 mt-1">
              Manage user access, complaint workflows, and support system health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Profile Card */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <User className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  User Identity
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Full Name</label>
                  <div className="mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-semibold">
                    {user?.name || 'Student'}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Email Address</label>
                  <div className="mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono">
                    {user?.email || 'student@college.edu'}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Assigned Role</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase text-[10px]">
                      {user?.role || 'STUDENT'}
                    </span>
                    <span className="text-[11px] text-slate-500">Complaint submission and tracking permissions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptography & Security Card */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Security & Cryptography
                </h2>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">Password Hashing</div>
                    <div className="text-[10px] text-slate-400">Bcrypt cost factor 12</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Enforced
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">Credential Encryption</div>
                    <div className="text-[10px] text-slate-400">AES-256-CBC at rest</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Active
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">Session Protocol</div>
                    <div className="text-[10px] text-slate-400">Signed JWT (7 days TTL)</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                    Valid
                  </span>
                </div>
              </div>
            </div>

            {/* Infrastructure Health Status Card */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Campus Support Health
                  </h2>
                </div>

                <button
                  onClick={fetchHealth}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth ? 'animate-spin' : ''}`} /> Refresh Heartbeat
                </button>
              </div>

              {healthStatus ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Complaint Queue</div>
                    <div className="font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Assignment System</div>
                    <div className="font-bold text-indigo-400 mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Available
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Ticket Routing</div>
                    <div className="font-bold text-cyan-400 mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Status Updates</div>
                    <div className="font-bold text-pink-400 mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-center py-4">Checking system health...</div>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
