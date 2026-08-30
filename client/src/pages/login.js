import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { Cpu, Lock, Mail, ArrowRight, Loader2, Sparkles, Key } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      const redirectUrl = router.query.redirect || '/dashboard';
      router.push(redirectUrl);
    }
  };

  const handleQuickDemoFill = (role = 'student') => {
    if (role === 'admin') {
      setEmail('admin@college.edu');
      setPassword('admin123');
    } else {
      setEmail('student@college.edu');
      setPassword('student123');
    }
    setFormError(null);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/15 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[1px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">College Complaint Desk</span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Campus Portal Login</h2>
          <p className="text-xs text-slate-400">Access your student or admin dashboard for complaint management.</p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-5">
          {(error || formError) && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <span className="font-semibold">Error:</span> {formError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">College Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all border border-emerald-400/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  Sign In to Portal <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Quick Fill Helper */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block text-center">
              Quick Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('student')}
                className="py-1.5 px-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-600 text-[11px] text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                <Key className="w-3 h-3 text-emerald-400" /> Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('admin')}
                className="py-1.5 px-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-600 text-[11px] text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                <Key className="w-3 h-3 text-cyan-400" /> Admin Demo
              </button>
            </div>
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-400">
          Need a campus account?{' '}
          <Link href="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline">
            Register new account &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
