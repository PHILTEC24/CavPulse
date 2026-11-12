'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  Filter,
  UserX,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import { AttendanceStatus, WsAttendanceUpdate } from '@cavpulse/shared';
import { useSocketSession } from '@/hooks/use-socket';
import { formatTime } from '@/lib/utils';

export interface LiveAttendee {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  status: AttendanceStatus;
  recordedAt: string;
  isNew?: boolean;
}

interface LiveSessionAttendanceProps {
  sessionId: string;
  initialRecords?: LiveAttendee[];
  totalRegistered?: number;
}

export function LiveSessionAttendance({
  sessionId,
  initialRecords = [],
  totalRegistered = 45,
}: LiveSessionAttendanceProps) {
  const [attendees, setAttendees] = useState<LiveAttendee[]>(initialRecords);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AttendanceStatus>('ALL');

  // Sync initial records
  useEffect(() => {
    if (initialRecords.length > 0) {
      setAttendees(initialRecords);
    }
  }, [initialRecords]);

  // Handle incoming real-time socket events
  const handleIncomingAttendance = (data: WsAttendanceUpdate) => {
    setAttendees((prev) => {
      // Check if already in list
      const existingIdx = prev.findIndex((a) => a.studentId === data.studentId);
      const newEntry: LiveAttendee = {
        id: `att-${Date.now()}-${data.studentId}`,
        studentId: data.studentId,
        studentName: data.studentName,
        studentNumber: data.studentNumber,
        status: data.status,
        recordedAt: data.recordedAt || new Date().toISOString(),
        isNew: true,
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], status: data.status, isNew: true };
        return copy;
      }
      return [newEntry, ...prev];
    });

    // Clear new indicator after 4 seconds
    setTimeout(() => {
      setAttendees((prev) =>
        prev.map((a) => (a.studentId === data.studentId ? { ...a, isNew: false } : a))
      );
    }, 4000);
  };

  // Subscribe to WebSocket session room
  useSocketSession({
    sessionId,
    onAttendanceRecorded: handleIncomingAttendance,
  });

  // Calculate live statistics
  const stats = useMemo(() => {
    const presentCount = attendees.filter((a) => a.status === AttendanceStatus.PRESENT).length;
    const lateCount = attendees.filter((a) => a.status === AttendanceStatus.LATE).length;
    const excusedCount = attendees.filter((a) => a.status === AttendanceStatus.EXCUSED).length;
    const totalPresentAndLate = presentCount + lateCount;
    const absentCount = Math.max(0, totalRegistered - totalPresentAndLate - excusedCount);
    const rate = totalRegistered > 0 ? Math.round((totalPresentAndLate / totalRegistered) * 100) : 0;

    return {
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      excused: excusedCount,
      totalCheckedIn: totalPresentAndLate,
      rate,
    };
  }, [attendees, totalRegistered]);

  // Filtered attendees
  const filteredAttendees = useMemo(() => {
    return attendees.filter((a) => {
      const matchesSearch =
        a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.studentNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [attendees, searchQuery, statusFilter]);

  return (
    <Card className="flex flex-col h-full border-border/80 shadow-md bg-card">
      <CardHeader className="p-4 sm:p-5 border-b bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-base sm:text-lg">
              Live Attendance Feed
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{stats.totalCheckedIn} / {totalRegistered} Verified</span>
          </div>
        </div>

        {/* Live Stat Badges */}
        <div className="grid grid-cols-4 gap-2 pt-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg p-2 text-center">
            <span className="text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-400 block">
              Present
            </span>
            <span className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
              {stats.present}
            </span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg p-2 text-center">
            <span className="text-[10px] uppercase font-semibold text-amber-700 dark:text-amber-400 block">
              Late
            </span>
            <span className="text-lg font-bold text-amber-800 dark:text-amber-200">
              {stats.late}
            </span>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-lg p-2 text-center">
            <span className="text-[10px] uppercase font-semibold text-rose-700 dark:text-rose-400 block">
              Absent
            </span>
            <span className="text-lg font-bold text-rose-800 dark:text-rose-200">
              {stats.absent}
            </span>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-lg p-2 text-center">
            <span className="text-[10px] uppercase font-semibold text-indigo-700 dark:text-indigo-400 block">
              Turnout
            </span>
            <span className="text-lg font-bold text-indigo-800 dark:text-indigo-200">
              {stats.rate}%
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex gap-2 pt-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search student or reg number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-9 px-2 text-xs rounded-md border border-input bg-background focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value={AttendanceStatus.PRESENT}>Present</option>
            <option value={AttendanceStatus.LATE}>Late</option>
            <option value={AttendanceStatus.EXCUSED}>Excused</option>
          </select>
        </div>
      </CardHeader>

      {/* Attendance List */}
      <CardContent className="p-0 flex-1 overflow-y-auto max-h-[500px] divide-y divide-border">
        {filteredAttendees.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground space-y-2">
            <Users className="h-8 w-8 mx-auto opacity-40" />
            <p className="text-sm font-medium">No check-ins recorded yet</p>
            <p className="text-xs">
              Waiting for students to scan the session QR code.
            </p>
          </div>
        ) : (
          filteredAttendees.map((att) => (
            <div
              key={att.id}
              className={`p-3.5 flex items-center justify-between text-xs transition-colors duration-300 ${
                att.isNew
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-inset ring-emerald-400'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    att.status === AttendanceStatus.PRESENT
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {att.studentName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {att.studentName}
                    </span>
                    {att.isNew && (
                      <span className="flex items-center text-[10px] text-emerald-600 font-bold gap-0.5">
                        <Sparkles className="h-3 w-3" /> Just now
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {att.studentNumber}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground">
                  {formatTime(att.recordedAt)}
                </span>
                <StatusBadge status={att.status} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

