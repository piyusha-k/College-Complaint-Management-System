import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    } else if (!isLoading && isAuthenticated && adminOnly && user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router, adminOnly, user]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center text-slate-300">
        <div className="relative flex items-center justify-center mb-4">
          <div className="absolute w-12 h-12 rounded-full border-2 border-indigo-500/20 animate-ping"></div>
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
        <p className="text-sm font-medium tracking-wide text-slate-400">Authenticating Operator Session...</p>
      </div>
    );
  }

  return children;
}
