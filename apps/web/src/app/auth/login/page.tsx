'use client';

import React from 'react';
import { LoginForm } from '@/components/forms/login-form';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, GraduationCap, CheckCircle2, Sparkles, Building2 } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Left / Hero Column - Desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow ornaments */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Brand Stamp */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-400/20">
            CUU
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Cavendish University
            </h1>
            <p className="text-xs text-amber-300 font-semibold tracking-wider uppercase">
              Uganda · Kampala
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-8 relative z-10 my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            CavPulse 2.0 Intelligent Attendance System
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white max-w-lg">
            Empowering Academic Excellence Through Seamless Presence Verification.
          </h2>

          <div className="space-y-4 max-w-md pt-2">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Dynamic Rotating QR Technology
                </h4>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Eliminates attendance fraud and proxy check-ins with time-bound cryptographic tokens.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Real-time Hall Sync
                </h4>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Instant live headcounts for lecturers via WebSocket streaming.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Automated Exam Eligibility Audits
                </h4>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Continuous tracking against Cavendish University 75% attendance policy threshold.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-indigo-300 flex items-center justify-between relative z-10 border-t border-white/10 pt-4">
          <span>ICT Directorate & Academic Registry</span>
          <span>© {new Date().getFullYear()} CavPulse</span>
        </div>
      </div>

      {/* Right / Form Column */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Top Brand (visible when left hero is hidden) */}
          <div className="lg:hidden flex flex-col items-center text-center space-y-2 mb-2">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                CavPulse
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Cavendish University Uganda
              </p>
            </div>
          </div>

          <Card className="border-border/80 shadow-xl bg-card">
            <CardContent className="p-6 sm:p-8 space-y-5">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Welcome to CavPulse
                </h3>
                <p className="text-xs text-muted-foreground">
                  Sign in with your official university credentials
                </p>
              </div>

              <LoginForm />
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Having trouble accessing your account? Contact{' '}
            <a
              href="mailto:support@cavendish.ac.ug"
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              itsupport@cavendish.ac.ug
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

