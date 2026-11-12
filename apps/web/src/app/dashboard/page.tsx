'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getRoleDashboardPath } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.replace('/auth/login');
      } else {
        const dest = getRoleDashboardPath(user.role);
        router.replace(dest);
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="h-64 flex flex-col items-center justify-center space-y-3">
      <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      <p className="text-xs text-muted-foreground font-medium">
        Redirecting to your role dashboard...
      </p>
    </div>
  );
}

