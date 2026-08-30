import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import {
  Sparkles,
  Cpu,
  ArrowRight,
  Shield,
  Activity,
  Layers,
  Zap,
  Play,
  RotateCcw,
  CheckCircle,
  Radio,
  FileSpreadsheet,
  Mail,
  MessageSquare,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const agents = [
    {
      name: 'Planner Agent',
      role: 'DAG Resolution & Ordering',
      description: 'Parses complex graph topologies, validates DAG cycles, and generates deterministic step sequences with confidence scoring.',
      color: 'from-violet-500/20 to-purple-500/5',
      borderColor: 'border-violet-500/30',
      tagColor: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
      icon: Sparkles,
    },
    {
      name: 'Execution Agent',
      role: 'Autonomous Action Dispatch',
      description: 'Executes individual nodes against encrypted third-party credentials (Gmail, Slack, Sheets, Discord) or AI reasoning models.',
      color: 'from-cyan-500/20 to-blue-500/5',
      borderColor: 'border-cyan-500/30',
      tagColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      icon: Play,
    },
    {
      name: 'Validation Agent',
      role: 'Contract & Output Verification',
      description: 'Verifies data contracts and required fields between steps before allowing state transitions.',
      color: 'from-emerald-500/20 to-teal-500/5',
      borderColor: 'border-emerald-500/30',
      tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      icon: CheckCircle,
    },
    {
      name: 'Recovery Agent',
      role: 'Failure Classification & Backoff',
      description: 'Classifies runtime errors (AUTH_EXPIRED, RATE_LIMIT, API_FAILURE) and decides between exponential backoff retries and operator escalation.',
      color: 'from-amber-500/20 to-orange-500/5',
      borderColor: 'border-amber-500/30',
      tagColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      icon: RotateCcw,
    },
    {
      name: 'Monitoring Agent',
      role: 'Real-Time Audit & Telemetry',
      description: 'Persists granular execution audit logs to MongoDB and streams live Socket.IO events to operator consoles.',
      color: 'from-pink-500/20 to-rose-500/5',
      borderColor: 'border-pink-500/30',
      tagColor: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
      icon: Radio,
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Cpu className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              College Complaint Desk
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Campus Issue Tracker
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Student Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all border border-emerald-400/20 active:scale-95 flex items-center gap-1.5"
          >
            Submit Complaint <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-20 pb-28 flex flex-col items-center text-center overflow-hidden">
        {/* Glow background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
          <span>Fast, transparent campus issue resolution</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 leading-[1.15]">
          College Complaint <span className="text-emerald-400">Management System</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Students can report issues across classrooms, hostels, labs, Wi-Fi, infrastructure, and campus services, while admins manage assignments, status updates, and resolutions from one place.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/30 transition-all border border-emerald-400/30 active:scale-95 flex items-center gap-2"
          >
            Register Complaint <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-md transition-all active:scale-95"
          >
            Admin Login &rarr;
          </Link>
        </div>

        {/* Live Integrated Tools Row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500">
            Common complaint categories:
          </span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-rose-300">
            <Mail className="w-4 h-4 text-rose-400" /> Hostel
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-emerald-300">
            <MessageSquare className="w-4 h-4 text-emerald-400" /> Wi-Fi
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-indigo-300">
            <MessageSquare className="w-4 h-4 text-indigo-400" /> Classroom
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-teal-300">
            <FileSpreadsheet className="w-4 h-4 text-teal-400" /> Infrastructure
          </div>
        </div>
      </section>

      {/* Complaint lifecycle showcase */}
      <section className="px-6 lg:px-12 py-16 bg-slate-950/40 border-t border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Activity className="w-4 h-4" /> Complaint lifecycle
            </div>
            <h2 className="text-3xl font-extrabold text-white">How complaints move through the system</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Every report moves from submission to review, assignment, action, and final resolution with full visibility for students and admins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: 'Submitted',
                text: 'Students submit issue details, location, category, photo evidence, and urgency.',
                color: 'from-violet-500/20 to-purple-500/5',
                borderColor: 'border-violet-500/30',
                tagColor: 'text-violet-300 border-violet-500/30 bg-violet-500/10',
              },
              {
                title: 'Under Review',
                text: 'The admin team checks validity, categorizes the issue, and identifies the correct department.',
                color: 'from-cyan-500/20 to-blue-500/5',
                borderColor: 'border-cyan-500/30',
                tagColor: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
              },
              {
                title: 'Assigned',
                text: 'Complaints are routed to the right department, staff member, or maintenance team.',
                color: 'from-emerald-500/20 to-teal-500/5',
                borderColor: 'border-emerald-500/30',
                tagColor: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
              },
              {
                title: 'In Progress',
                text: 'Work begins on the issue with progress notes, comments, and ongoing updates.',
                color: 'from-amber-500/20 to-orange-500/5',
                borderColor: 'border-amber-500/30',
                tagColor: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
              },
              {
                title: 'Resolved',
                text: 'Department teams record the fix and notify the student with closure details.',
                color: 'from-pink-500/20 to-rose-500/5',
                borderColor: 'border-pink-500/30',
                tagColor: 'text-pink-300 border-pink-500/30 bg-pink-500/10',
              },
              {
                title: 'Closed',
                text: 'The issue is verified complete and kept in the campus history for accountability.',
                color: 'from-indigo-600/20 to-slate-900/80',
                borderColor: 'border-indigo-500/30',
                tagColor: 'text-indigo-300 border-indigo-500/30 bg-indigo-500/10',
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl bg-gradient-to-b ${item.color} bg-slate-900/60 border ${item.borderColor} backdrop-blur-sm shadow-xl flex flex-col justify-between transition-all hover:scale-[1.02]`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${item.tagColor}`}>
                      Step 0{idx + 1}
                    </span>
                    <Zap className="w-5 h-5 text-slate-300" />
                  </div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-6 lg:px-12 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>College Complaint Management System &copy; 2026. All rights reserved.</div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="hover:text-slate-300">
            Student Login
          </Link>
          <Link href="/register" className="hover:text-slate-300">
            Register Account
          </Link>
        </div>
      </footer>
    </div>
  );
}
