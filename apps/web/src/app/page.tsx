'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, redirectToDashboard } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        redirectToDashboard();
      } else {
        router.replace('/auth/login');
      }
    }
  }, [isLoading, isAuthenticated, redirectToDashboard, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 animate-pulse">
          <span className="font-black text-xl">CU</span>
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Loading CavPulse...
        </p>
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
      </div>
    </div>
  );
}

