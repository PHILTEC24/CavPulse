'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Radio,
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Play,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LectureSessionStatus } from '@cavpulse/shared';
import { getSessionStatusBadgeColor, formatDate } from '@/lib/utils';

export default function LecturerSessionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LectureSessionStatus>('ALL');

  const sessions = [
    {
      id: 'sess-active-1',
      courseCode: 'BIT 2102',
      courseName: 'Data Structures & Algorithms',
      date: '2026-11-10',
      time: '09:00 AM – 11:00 AM',
      room: 'Main Hall A, Ggaba Campus',
      status: LectureSessionStatus.ACTIVE,
      present: 42,
      registered: 52,
    },
    {
      id: 'sess-sched-2',
      courseCode: 'CSC 3101',
      courseName: 'Intelligent Systems & Machine Learning',
      date: '2026-11-10',
      time: '02:00 PM – 04:00 PM',
      room: 'Lab 3, Kingsgate Campus',
      status: LectureSessionStatus.SCHEDULED,
      present: 0,
      registered: 46,
    },
    {
      id: 'sess-closed-3',
      courseCode: 'BIT 2102',
      courseName: 'Data Structures & Algorithms',
      date: '2026-11-08',
      time: '09:00 AM – 11:00 AM',
      room: 'Main Hall A, Ggaba Campus',
      status: LectureSessionStatus.CLOSED,
      present: 48,
      registered: 52,
    },
    {
      id: 'sess-closed-4',
      courseCode: 'CSC 3101',
      courseName: 'Intelligent Systems & Machine Learning',
      date: '2026-11-06',
      time: '02:00 PM – 04:00 PM',
      room: 'Lab 3, Kingsgate Campus',
      status: LectureSessionStatus.CLOSED,
      present: 44,
      registered: 46,
    },
    {
      id: 'sess-closed-5',
      courseCode: 'BIT 3105',
      courseName: 'Cloud Infrastructure & Security',
      date: '2026-11-04',
      time: '04:30 PM – 06:30 PM',
      room: 'Room 204, Ggaba Campus',
      status: LectureSessionStatus.CLOSED,
      present: 32,
      registered: 38,
    },
  ];

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.room.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Lecture Sessions Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create, launch live QR verification, and review attendance records.
          </p>
        </div>

        <Button asChild variant="cavpulse" size="sm" className="text-xs gap-1.5 shadow-indigo-600/25">
          <Link href="/dashboard/lecturer/sessions/sess-active-1">
            <Radio className="h-4 w-4" />
            Launch Active Session
          </Link>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by course code, name, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-9 px-3 text-xs rounded-md border border-input bg-background focus:ring-1 focus:ring-indigo-500"
        >
          <option value="ALL">All Session Statuses</option>
          <option value={LectureSessionStatus.ACTIVE}>Active / Live</option>
          <option value={LectureSessionStatus.SCHEDULED}>Scheduled</option>
          <option value={LectureSessionStatus.CLOSED}>Closed</option>
        </select>
      </div>

      {/* Sessions Table Card */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Room / Campus</TableHead>
                <TableHead>Attendance Turnout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id} className="text-xs">
                  <TableCell>
                    <div className="space-y-0.5">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {session.courseCode}
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {session.courseName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5 text-muted-foreground">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {session.date}
                      </span>
                      <p className="text-[11px]">{session.time}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {session.room}
                  </TableCell>
                  <TableCell>
                    {session.status === LectureSessionStatus.SCHEDULED ? (
                      <span className="text-muted-foreground text-[11px] italic">
                        Not started yet
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {session.present} / {session.registered} students
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          ({Math.round((session.present / session.registered) * 100)}% turnout)
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSessionStatusBadgeColor(
                        session.status
                      )}`}
                    >
                      {session.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant={session.status === LectureSessionStatus.ACTIVE ? 'cavpulse' : 'outline'} className="text-xs gap-1">
                      <Link href={`/dashboard/lecturer/sessions/${session.id}`}>
                        {session.status === LectureSessionStatus.ACTIVE ? (
                          <>
                            <Radio className="h-3 w-3 animate-pulse" /> Live Room
                          </>
                        ) : session.status === LectureSessionStatus.SCHEDULED ? (
                          <>
                            <Play className="h-3 w-3" /> Start
                          </>
                        ) : (
                          'View Log'
                        )}
                      </Link>
                    </Button>
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

