'use client';

import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  Filter,
  Check,
  X,
  Building2,
  BarChart2,
} from 'lucide-react';
import { StatCard } from '@/components/analytics/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export default function AcademicAdminDashboard() {
  const [disputes, setDisputes] = useState([
    {
      id: 'disp-1',
      studentName: 'Kasule Emmanuel',
      studentNumber: 'CUU/2023/0412',
      courseCode: 'CSC 3101',
      date: 'Nov 04, 2026',
      reason: 'Medical appointment at Nsambya Hospital with certified doctor note.',
      status: 'PENDING',
    },
    {
      id: 'disp-2',
      studentName: 'Achieng Gloria',
      studentNumber: 'CUU/2024/0119',
      courseCode: 'BIT 2102',
      date: 'Nov 06, 2026',
      reason: 'Camera scanner froze during session QR scan at 09:12 AM.',
      status: 'PENDING',
    },
    {
      id: 'disp-3',
      studentName: 'Mukisa David',
      studentNumber: 'CUU/2022/0890',
      courseCode: 'LL.B 4102',
      date: 'Nov 08, 2026',
      reason: 'Official university representation at inter-university moot court competition.',
      status: 'PENDING',
    },
  ]);

  const handleResolveDispute = (id: string, decision: 'APPROVED' | 'REJECTED') => {
    setDisputes((prev) => prev.filter((d) => d.id !== id));
    if (decision === 'APPROVED') {
      toast.success('Dispute approved. Student record updated to Excused.');
    } else {
      toast.error('Dispute rejected.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Academic Affairs & Compliance
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Cavendish University Uganda · Academic Standards & Attendance Policy Monitoring
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Student Compliance"
          value="87.8%"
          change={1.8}
          changeLabel="above 75% exam cutoff"
          icon={CheckCircle2}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400"
        />
        <StatCard
          title="Students At Academic Risk"
          value="142"
          change={-8.5}
          changeLabel="less than 75% turnout"
          icon={AlertTriangle}
          iconColor="text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400"
        />
        <StatCard
          title="Pending Disputes"
          value={disputes.length}
          icon={FileText}
          iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400"
        />
        <StatCard
          title="Monitored Courses"
          value="128"
          icon={Building2}
          iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400"
        />
      </div>

      {/* Disputes Review Queue */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Attendance Dispute Review Queue
              </CardTitle>
              <CardDescription className="text-xs">
                Student absence appeals requiring academic committee verification
              </CardDescription>
            </div>
            <Badge variant="warning" className="text-xs font-semibold">
              {disputes.length} Pending Actions
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Lecture Date</TableHead>
                <TableHead>Reason / Justification</TableHead>
                <TableHead className="text-right">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disputes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-xs text-muted-foreground">
                    All attendance disputes have been resolved.
                  </TableCell>
                </TableRow>
              ) : (
                disputes.map((d) => (
                  <TableRow key={d.id} className="text-xs">
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                      {d.studentName}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {d.studentNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-bold">
                        {d.courseCode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{d.date}</TableCell>
                    <TableCell className="max-w-xs text-slate-700 dark:text-slate-300">
                      {d.reason}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveDispute(d.id, 'APPROVED')}
                          className="h-7 px-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs gap-1"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveDispute(d.id, 'REJECTED')}
                          className="h-7 px-2 text-rose-600 border-rose-200 hover:bg-rose-50 text-xs gap-1"
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

