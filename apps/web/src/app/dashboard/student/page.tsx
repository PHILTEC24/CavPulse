'use client';

import React from 'react';
import Link from 'next/link';
import {
  QrCode,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BookOpen,
  MapPin,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ProgressRing } from '@/components/analytics/progress-ring';
import { StatCard } from '@/components/analytics/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/attendance/status-badge';
import { AttendanceStatus } from '@cavpulse/shared';
import { useAuth } from '@/hooks/use-auth';

export default function StudentDashboard() {
  const { user } = useAuth();

  const enrolledCourses = [
    {
      code: 'BIT 2102',
      name: 'Data Structures & Algorithms',
      attended: 11,
      total: 12,
      rate: 92,
      lecturer: 'Dr. Okello Peter',
    },
    {
      code: 'CSC 3101',
      name: 'Intelligent Systems & Machine Learning',
      attended: 9,
      total: 10,
      rate: 90,
      lecturer: 'Dr. Nabatanzi Sarah',
    },
    {
      code: 'BIT 3105',
      name: 'Cloud Infrastructure & Security',
      attended: 6,
      total: 9,
      rate: 67, // At risk (< 75%)
      lecturer: 'Eng. Mugisha Brian',
    },
    {
      code: 'CSC 1204',
      name: 'Object-Oriented Programming (Java)',
      attended: 12,
      total: 13,
      rate: 92,
      lecturer: 'Mr. Kato Joseph',
    },
  ];

  const recentHistory = [
    {
      id: 'h1',
      courseCode: 'BIT 2102',
      courseName: 'Data Structures & Algorithms',
      date: 'Today, Nov 10, 2026',
      time: '09:12 AM',
      status: AttendanceStatus.PRESENT,
      method: 'QR Code Scan',
    },
    {
      id: 'h2',
      courseCode: 'CSC 3101',
      courseName: 'Intelligent Systems',
      date: 'Friday, Nov 07, 2026',
      time: '02:05 PM',
      status: AttendanceStatus.PRESENT,
      method: 'QR Code Scan',
    },
    {
      id: 'h3',
      courseCode: 'BIT 3105',
      courseName: 'Cloud Infrastructure & Security',
      date: 'Wednesday, Nov 05, 2026',
      time: '04:45 PM',
      status: AttendanceStatus.LATE,
      method: 'QR Code Scan',
    },
    {
      id: 'h4',
      courseCode: 'BIT 3105',
      courseName: 'Cloud Infrastructure & Security',
      date: 'Monday, Nov 03, 2026',
      time: '04:30 PM',
      status: AttendanceStatus.ABSENT,
      method: 'System Recorded',
    },
  ];

  const overallRate = 85;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Hello, {user?.firstName || 'Student'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Student Reg: {user?.studentProfile?.studentNumber || 'CUU/2023/0182'} · Faculty of Science & Technology
          </p>
        </div>

        <Button asChild variant="cavpulse" size="sm" className="text-xs gap-1.5 shadow-indigo-600/25">
          <Link href="/dashboard/student/scan">
            <QrCode className="h-4 w-4" />
            Scan Lecture QR Code
          </Link>
        </Button>
      </div>

      {/* Hero Attendance Ring & Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Attendance Qualification Ring */}
        <Card className="border-border/80 shadow-xs flex flex-col items-center justify-center p-6 text-center bg-card">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Semester Exam Eligibility
          </h3>
          <ProgressRing
            percentage={overallRate}
            size={140}
            strokeWidth={12}
            label="Turnout"
            sublabel="Eligible for Exams (>= 75%)"
          />
          <p className="text-[11px] text-muted-foreground mt-4 max-w-xs leading-relaxed">
            University policy requires a minimum of 75% attendance in every course to qualify for final exams.
          </p>
        </Card>

        {/* Stats Column */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Total Lectures Attended"
            value="38 / 44"
            change={4.2}
            changeLabel="vs class average"
            icon={CheckCircle2}
            iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400"
          />
          <StatCard
            title="Courses At Risk (<75%)"
            value="1 Course"
            icon={AlertTriangle}
            iconColor="text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400"
          />
          <StatCard
            title="Active Registered Units"
            value="4 Courses"
            icon={BookOpen}
            iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400"
          />
          <StatCard
            title="On-Time Attendance"
            value="94%"
            change={1.2}
            changeLabel="high punctuality"
            icon={Clock}
            iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400"
          />
        </div>
      </div>

      {/* Courses Attendance Breakdown */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Course Attendance Breakdown
              </CardTitle>
              <CardDescription className="text-xs">
                Your compliance status across currently enrolled units
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Semester 2 · 2026/2027
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrolledCourses.map((c) => (
            <div
              key={c.code}
              className={`p-4 rounded-xl border transition-all ${
                c.rate < 75
                  ? 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20'
                  : 'border-border/80 bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                  {c.code}
                </span>
                <Badge
                  variant={c.rate >= 75 ? 'success' : 'destructive'}
                  className="text-[10px]"
                >
                  {c.rate >= 75 ? 'Qualified' : 'At Risk (< 75%)'}
                </Badge>
              </div>

              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mt-1">
                {c.name}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">{c.lecturer}</p>

              <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {c.attended} of {c.total} lectures attended
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {c.rate}%
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent History Table */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-semibold">
            Recent Attendance Scans & History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600">{item.courseCode}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.courseName}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    {item.date} · {item.time} ({item.method})
                  </p>
                </div>

                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

