'use client';

import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Radio,
  BarChart3,
  UserPlus,
  CalendarPlus,
  Download,
  ShieldCheck,
  Building2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { StatCard } from '@/components/analytics/stat-card';
import { AttendanceChart } from '@/components/analytics/attendance-chart';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UserForm } from '@/components/forms/user-form';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const deptAttendanceData = [
    { date: 'Computing & IT', present: 88, late: 6, absent: 6, excused: 0, rate: 88 },
    { date: 'Business & Mgt', present: 82, late: 8, absent: 10, excused: 0, rate: 82 },
    { date: 'Faculty of Law', present: 91, late: 4, absent: 5, excused: 0, rate: 91 },
    { date: 'Public Health', present: 85, late: 5, absent: 10, excused: 0, rate: 85 },
    { date: 'Socio-Economic', present: 79, late: 11, absent: 10, excused: 0, rate: 79 },
  ];

  const recentAuditEvents = [
    {
      id: 'a1',
      action: 'Session Started',
      user: 'Dr. Okello Peter',
      detail: 'BIT 2102 Data Structures & Algorithms · Main Hall A',
      time: '10 mins ago',
      type: 'session',
    },
    {
      id: 'a2',
      action: 'Batch Attendance Verified',
      user: 'CavPulse System',
      detail: '42 students verified via Dynamic QR · Ggaba Campus',
      time: '18 mins ago',
      type: 'attendance',
    },
    {
      id: 'a3',
      action: 'Manual Correction Approved',
      user: 'HoD Prof. Sarah Nabatanzi',
      detail: 'Student Namagembe Sarah (CUU/2023/0182) marked Excused',
      time: '1 hour ago',
      type: 'correction',
    },
    {
      id: 'a4',
      action: 'Timetable Slot Updated',
      user: 'Academic Registry',
      detail: 'BBA 1104 moved to Room B-12 for Semester 2',
      time: '3 hours ago',
      type: 'timetable',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            University Executive Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cavendish University Uganda · Real-time Academic & Attendance Operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="cavpulse"
            size="sm"
            onClick={() => setIsUserModalOpen(true)}
            className="text-xs gap-1.5"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>

          <Button asChild variant="outline" size="sm" className="text-xs gap-1.5">
            <Link href="/dashboard/lecturer/sessions">
              <Radio className="h-4 w-4 text-emerald-600" />
              Active Sessions
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Students"
          value="4,820"
          change={5.4}
          changeLabel="vs last semester"
          icon={Users}
          iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400"
        />
        <StatCard
          title="Active Teaching Staff"
          value="184"
          change={2.1}
          changeLabel="staff verified"
          icon={GraduationCap}
          iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400"
        />
        <StatCard
          title="Today's Lecture Sessions"
          value="68"
          change={0}
          changeLabel="14 currently live"
          icon={Radio}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400"
        />
        <StatCard
          title="University Attendance Rate"
          value="86.4%"
          change={3.2}
          changeLabel="above 75% target"
          icon={BarChart3}
          iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400"
        />
      </div>

      {/* Charts & Operational Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Comparison Chart */}
        <div className="lg:col-span-2">
          <AttendanceChart
            data={deptAttendanceData}
            title="Faculty & Department Turnout Breakdown"
            description="Comparative attendance performance across academic units"
            defaultChartType="bar"
          />
        </div>

        {/* Live Audit Log Feed */}
        <div className="lg:col-span-1">
          <Card className="border-border/80 shadow-xs h-full flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  Recent Audit Feed
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  Real-time
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 divide-y divide-border/60 overflow-y-auto max-h-[380px]">
              {recentAuditEvents.map((event) => (
                <div key={event.id} className="py-3 first:pt-0 last:pb-0 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>{event.action}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-normal">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                    {event.detail}
                  </p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                    By {event.user}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Creation Modal */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register New University User</DialogTitle>
            <DialogDescription className="text-xs">
              Create an academic staff, student, or administrative account on CavPulse.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSubmitSuccess={() => setIsUserModalOpen(false)}
            onCancel={() => setIsUserModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

