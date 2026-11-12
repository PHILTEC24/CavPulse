'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, QrCode, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QrScannerComponent } from '@/components/attendance/qr-scanner';

export default function StudentScanPage() {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-9 w-9">
          <Link href="/dashboard/student">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-indigo-600" />
            Lecture Attendance Scanner
          </h1>
          <p className="text-xs text-muted-foreground">
            Cavendish University Uganda · Secure Location-Aware Verification
          </p>
        </div>
      </div>

      {/* Main Scanner Container */}
      <QrScannerComponent />
    </div>
  );
}

