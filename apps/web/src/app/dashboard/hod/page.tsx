'use client';

import React from 'react';
import {
  Building2,
  Users,
  BookOpen,
  AlertTriangle,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { StatCard } from '@/components/analytics/stat-card';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function HodDashboard() {
  const departmentCourses = [
    {
      code: 'BIT 2102',
      name: 'Data Structures & Algorithms',
      lecturer: 'Dr. Okello Peter',
      registered: 52,
      averageAttendance: 88,
      status: 'On Track',
    },
    {
      code: 'CSC 3101',
      name: 'Intelligent Systems & Machine Learning',
      lecturer: 'Dr. Nabatanzi Sarah',
      registered: 46,
      averageAttendance: 92,
      status: 'Excellent',
    },
    {
      code: 'BIT 3105',
      name: 'Cloud Infrastructure & Security',
      lecturer: 'Eng. Mugisha Brian',
      registered: 38,
      averageAttendance: 71,
      status: 'Attention Needed',
    },
    {
      code: 'CSC 1204',
      name: 'Object-Oriented Programming (Java)',
      lecturer: 'Mr. Kato Joseph',
      registered: 64,
      averageAttendance: 84,
      status: 'On Track',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Department of Computing & Information Technology
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Faculty of Science & Technology · Cavendish University Uganda
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Department Students"
          value="684"
          change={4.2}
          icon={Users}
          iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400"
        />
        <StatCard
          title="Active Lecturers"
          value="24"
          icon={GraduationCap}
          iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400"
        />
        <StatCard
          title="Department Average Rate"
          value="85.3%"
          change={2.6}
          icon={CheckCircle2}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400"
        />
        <StatCard
          title="Students Below 75%"
          value="28"
          change={-12.5}
          changeLabel="decreasing"
          icon={AlertTriangle}
          iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400"
        />
      </div>

      {/* Courses in Department Table */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-semibold">
            Department Course Performance & Adherence
          </CardTitle>
          <CardDescription className="text-xs">
            Attendance benchmarks across semester units
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Assigned Lecturer</TableHead>
                <TableHead>Class Size</TableHead>
                <TableHead>Avg Attendance</TableHead>
                <TableHead className="text-right">Academic Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentCourses.map((c) => (
                <TableRow key={c.code} className="text-xs">
                  <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                    {c.code}
                  </TableCell>
                  <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                    {c.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.lecturer}</TableCell>
                  <TableCell className="font-mono">{c.registered} students</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={c.averageAttendance}
                        className="w-20 h-2"
                        indicatorClassName={
                          c.averageAttendance >= 75 ? 'bg-emerald-600' : 'bg-amber-500'
                        }
                      />
                      <span className="font-bold">{c.averageAttendance}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        c.averageAttendance >= 90
                          ? 'success'
                          : c.averageAttendance >= 75
                          ? 'cavpulse'
                          : 'warning'
                      }
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

