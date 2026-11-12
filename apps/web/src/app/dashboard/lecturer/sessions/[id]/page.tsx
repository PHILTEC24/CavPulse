'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Radio,
  Clock,
  Users,
  CheckCircle2,
  StopCircle,
  UserPlus,
  ArrowLeft,
  Share2,
  Sparkles,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrDisplay } from '@/components/attendance/qr-display';
import { LiveSessionAttendance, LiveAttendee } from '@/components/attendance/live-session';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AttendanceStatus, LectureSessionStatus } from '@cavpulse/shared';
import { formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = (params?.id as string) || 'sess-active-1';

  // Session state
  const [isActive, setIsActive] = useState<boolean>(true);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(1840); // e.g. 30 mins running
  const [isCloseModalOpen, setIsCloseModalOpen] = useState<boolean>(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);

  // Manual check-in form fields
  const [manualStudentName, setManualStudentName] = useState('');
  const [manualStudentNumber, setManualStudentNumber] = useState('');
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>(AttendanceStatus.PRESENT);
  const [manualNotes, setManualNotes] = useState('');

  // Initial dummy live attendee data
  const [initialAttendees, setInitialAttendees] = useState<LiveAttendee[]>([
    {
      id: 'att-1',
      studentId: 'std-1',
      studentName: 'Namagembe Sarah',
      studentNumber: 'CUU/2023/0182',
      status: AttendanceStatus.PRESENT,
      recordedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
      id: 'att-2',
      studentId: 'std-2',
      studentName: 'Mukasa Ronald',
      studentNumber: 'CUU/2023/0244',
      status: AttendanceStatus.PRESENT,
      recordedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    {
      id: 'att-3',
      studentId: 'std-3',
      studentName: 'Auma Brenda',
      studentNumber: 'CUU/2024/0091',
      status: AttendanceStatus.LATE,
      recordedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
    {
      id: 'att-4',
      studentId: 'std-4',
      studentName: 'Tumusiime Brian',
      studentNumber: 'CUU/2023/0501',
      status: AttendanceStatus.PRESENT,
      recordedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ]);

  // Elapsed timer clock
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const formatElapsed = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCloseSession = () => {
    setIsActive(false);
    setIsCloseModalOpen(false);
    toast.success('Lecture session ended. Final attendance records locked.');
  };

  const handleManualCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudentName.trim() || !manualStudentNumber.trim()) {
      toast.error('Student Name and Registration Number are required');
      return;
    }

    const newEntry: LiveAttendee = {
      id: `manual-${Date.now()}`,
      studentId: `std-${Date.now()}`,
      studentName: manualStudentName.trim(),
      studentNumber: manualStudentNumber.trim(),
      status: manualStatus,
      recordedAt: new Date().toISOString(),
      isNew: true,
    };

    setInitialAttendees((prev) => [newEntry, ...prev]);
    setIsManualModalOpen(false);
    setManualStudentName('');
    setManualStudentNumber('');
    setManualNotes('');
    toast.success(`Recorded attendance for ${newEntry.studentName}`);
  };

  return (
    <div className="space-y-6">
      {/* Session Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <Link href="/dashboard/lecturer/sessions">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                BIT 2102: Data Structures & Algorithms
              </h1>
              {isActive ? (
                <Badge variant="success" className="gap-1 text-[10px] uppercase font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Room
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                  Session Closed
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Main Hall A, Ggaba Campus · Cavendish University Uganda
            </p>
          </div>
        </div>

        {/* Action Controls & Elapsed Session Clock */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {/* Elapsed Timer Gauge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>{formatElapsed(elapsedSeconds)}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
            className="text-xs gap-1.5"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Manual Check-In
          </Button>

          {isActive ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsCloseModalOpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <StopCircle className="h-3.5 w-3.5" />
              Close Session
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsActive(true)}
              className="text-xs gap-1.5"
            >
              Reopen Session
            </Button>
          )}
        </div>
      </div>

      {/* Main 2-Column Live Session Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dynamic QR Code Presentation & Rotating Security Key */}
        <div className="lg:col-span-7 space-y-6">
          <QrDisplay
            sessionId={sessionId}
            courseCode="BIT 2102"
            courseName="Data Structures & Algorithms"
            room="Main Hall A, Ggaba Campus"
            date={new Date().toISOString()}
            startTime="09:00"
            endTime="11:00"
            isActive={isActive}
          />
        </div>

        {/* Right Column: Real-time Live Attendance Stream */}
        <div className="lg:col-span-5">
          <LiveSessionAttendance
            sessionId={sessionId}
            initialRecords={initialAttendees}
            totalRegistered={52}
          />
        </div>
      </div>

      {/* Confirmation Modal to Close Session */}
      <Dialog open={isCloseModalOpen} onOpenChange={setIsCloseModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              End Lecture Session?
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed pt-2">
              Closing this session will immediately invalidate the active QR code and finalize
              student attendance records. Any student who has not verified their attendance will
              be marked as absent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCloseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCloseSession}
            >
              Yes, Close Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Attendance Entry Modal */}
      <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Attendance Override</DialogTitle>
            <DialogDescription className="text-xs">
              Manually register a student who experienced phone battery or camera issues during lecture.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleManualCheckInSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="mStudentName">Student Full Name</Label>
              <Input
                id="mStudentName"
                placeholder="e.g. Kato Brian"
                value={manualStudentName}
                onChange={(e) => setManualStudentName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mStudentNum">Student Registration Number</Label>
              <Input
                id="mStudentNum"
                placeholder="e.g. CUU/2023/0481"
                value={manualStudentNumber}
                onChange={(e) => setManualStudentNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mStatus">Status</Label>
              <select
                id="mStatus"
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value as any)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value={AttendanceStatus.PRESENT}>Present</option>
                <option value={AttendanceStatus.LATE}>Late</option>
                <option value={AttendanceStatus.EXCUSED}>Excused</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mNotes">Notes / Justification (Optional)</Label>
              <Input
                id="mNotes"
                placeholder="e.g. Phone battery died during class"
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsManualModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="cavpulse" size="sm">
                Save Check-In
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

