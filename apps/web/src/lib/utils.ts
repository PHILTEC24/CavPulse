import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';
import { AttendanceStatus, LectureSessionStatus, UserRole } from '@cavpulse/shared';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(d)) return '-';
    return format(d, 'MMM dd, yyyy · hh:mm a');
  } catch {
    return '-';
  }
}

export function formatDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(d)) return '-';
    return format(d, 'EEEE, MMM dd, yyyy');
  } catch {
    return '-';
  }
}

export function formatTime(timeInput: string | Date | undefined | null): string {
  if (!timeInput) return '-';
  if (typeof timeInput === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(timeInput)) {
    // Already in HH:MM format
    const [h, m] = timeInput.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  }
  try {
    const d = typeof timeInput === 'string' ? parseISO(timeInput) : timeInput;
    if (!isValid(d)) return typeof timeInput === 'string' ? timeInput : '-';
    return format(d, 'hh:mm a');
  } catch {
    return typeof timeInput === 'string' ? timeInput : '-';
  }
}

export function formatRelativeMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function getInitials(name?: string | null): string {
  if (!name) return 'CU';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getStatusBadgeVariant(
  status: AttendanceStatus
): 'success' | 'warning' | 'destructive' | 'secondary' | 'default' {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return 'success';
    case AttendanceStatus.LATE:
      return 'warning';
    case AttendanceStatus.ABSENT:
      return 'destructive';
    case AttendanceStatus.EXCUSED:
      return 'secondary';
    case AttendanceStatus.PENDING:
    default:
      return 'default';
  }
}

export function getSessionStatusBadgeColor(status: LectureSessionStatus): string {
  switch (status) {
    case LectureSessionStatus.ACTIVE:
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
    case LectureSessionStatus.SCHEDULED:
      return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800';
    case LectureSessionStatus.CLOSED:
      return 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700';
    case LectureSessionStatus.CANCELLED:
    case LectureSessionStatus.MISSED:
      return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

export function formatRoleName(role?: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return 'Super Admin';
    case UserRole.ACADEMIC_ADMIN:
      return 'Academic Admin';
    case UserRole.HEAD_OF_DEPARTMENT:
      return 'Head of Department';
    case UserRole.LECTURER:
      return 'Lecturer';
    case UserRole.STUDENT:
      return 'Student';
    default:
      return 'User';
  }
}

