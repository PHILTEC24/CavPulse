'use client';

import React from 'react';
import Link from 'next/link';
import {
  Radio,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '@/components/analytics/stat-card';
import { AttendanceChart } from '@/components/analytics/attendance-chart';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';

export default function LecturerDashboard() {
  const { user } = useAuth();

  const todayLectures = [
    {
      id: 'sess-active-1',
      slotId: 'slot-1',
      code: 'BIT 2102',
      name: 'Data Structures & Algorithms',
      room: 'Main Hall A, Ggaba Campus',
      time: '09:00 AM – 11:00 AM',
      registered: 52,
      isActive: true,
      currentTurnout: 42,
    },
    {
      id: 'sess-sched-2',
      slotId: 'slot-2',
      code: 'CSC 3101',
      name: 'Intelligent Systems & Machine Learning',
      room: 'Computer Lab 3, Kingsgate Campus',
      time: '02:00 PM – 04:00 PM',
      registered: 46,
      isActive: false,
    },
    {
      id: 'sess-sched-3',
      slotId: 'slot-3',
      code: 'BIT 3105',
      name: 'Cloud Infrastructure & Security',
      room: 'Room 204, Ggaba Campus',
      time: '04:30 PM – 06:30 PM',
      registered: 38,
      isActive: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome back, {user ? `${user.firstName} ${user.lastName}` : 'Lecturer'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Faculty of Science & Technology · Cavendish University Uganda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="cavpulse" size="sm" className="text-xs gap-1.5 shadow-indigo-600/25">
            <Link href="/dashboard/lecturer/sessions/sess-active-1">
              <Play className="h-3.5 w-3.5 fill-current" />
              Open Live Session
            </Link>
          </Button>
        </div>
      </div>

      {/* Active Session Indicator Banner */}
      <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider">
                Active Lecture Session
              </Badge>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                42 Students Checked In
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              BIT 2102: Data Structures & Algorithms
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
              <span>Main Hall A · Ggaba Campus</span>
              <span>·</span>
              <span>Started at 09:00 AM</span>
            </p>
          </div>
        </div>

        <Button asChild variant="cavpulse" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shrink-0">
          <Link href="/dashboard/lecturer/sessions/sess-active-1">
            Display Session QR <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Enrolled Students"
          value="136"
          icon={Users}
          iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400"
        />
        <StatCard
          title="Average Attendance Rate"
          value="88.2%"
          change={3.4}
          changeLabel="above faculty avg"
          icon={CheckCircle2}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400"
        />
        <StatCard
          title="Lectures Taught This Term"
          value="34"
          icon={Calendar}
          iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400"
        />
        <StatCard
          title="Students At Risk (<75%)"
          value="7"
          change={-2}
          changeLabel="needs follow up"
          icon={AlertTriangle}
          iconColor="text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400"
        />
      </div>

      {/* Today's Schedule & Attendance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Lectures */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Today&apos;s Lecture Schedule
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Classes assigned to you for today
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  3 Lectures
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {todayLectures.map((lec) => (
                <div
                  key={lec.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    lec.isActive
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-border/80 hover:border-slate-300 bg-card'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-600 text-white font-bold text-xs">
                        {lec.code}
                      </Badge>
                      {lec.isActive ? (
                        <Badge variant="success" className="text-[10px]">
                          LIVE NOW
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">
                          Scheduled
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {lec.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {lec.time}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {lec.room}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {lec.isActive ? (
                      <Button asChild size="sm" variant="cavpulse" className="text-xs gap-1">
                        <Link href={`/dashboard/lecturer/sessions/${lec.id}`}>
                          Manage Live <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline" className="text-xs gap-1">
                        <Link href={`/dashboard/lecturer/sessions/${lec.id}`}>
                          <Play className="h-3 w-3" /> Start Session
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Attendance Trend Chart */}
        <div className="lg:col-span-1">
          <AttendanceChart
            title="Class Turnout Trend"
            description="Overall attendance over past 7 weeks"
            defaultChartType="line"
          />
        </div>
      </div>
    </div>
  );
}

