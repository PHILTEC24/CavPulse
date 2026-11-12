'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from './status-badge';
import { AttendanceRecord, AttendanceStatus, AttendanceMethod } from '@cavpulse/shared';
import { formatDateTime, formatDate } from '@/lib/utils';
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onUpdateStatus?: (recordId: string, newStatus: AttendanceStatus) => Promise<void>;
  isLoading?: boolean;
}

export function AttendanceTable({
  records,
  onUpdateStatus,
  isLoading = false,
}: AttendanceTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AttendanceStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter records
  const filtered = useMemo(() => {
    return records.filter((rec) => {
      const studentName = rec.student
        ? `${rec.student.firstName} ${rec.student.lastName}`
        : '';
      const studentNum = rec.student?.studentProfile?.studentNumber || '';
      const notes = rec.notes || '';

      const matchesSearch =
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        studentNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notes.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || rec.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Export CSV
  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error('No records to export');
      return;
    }

    const headers = ['Student Name', 'Student ID', 'Status', 'Method', 'Recorded At', 'Notes'];
    const rows = filtered.map((rec) => [
      rec.student ? `${rec.student.firstName} ${rec.student.lastName}` : 'N/A',
      rec.student?.studentProfile?.studentNumber || 'N/A',
      rec.status,
      rec.method,
      formatDateTime(rec.recordedAt),
      `"${rec.notes || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CavPulse_Attendance_${formatDate(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Attendance records exported to CSV');
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 text-xs h-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="h-9 px-3 text-xs rounded-md border border-input bg-background focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value={AttendanceStatus.PRESENT}>Present</option>
            <option value={AttendanceStatus.LATE}>Late</option>
            <option value={AttendanceStatus.ABSENT}>Absent</option>
            <option value={AttendanceStatus.EXCUSED}>Excused</option>
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          className="text-xs gap-1.5 shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Recorded At</TableHead>
              <TableHead>Notes</TableHead>
              {onUpdateStatus && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-xs">
                  Loading attendance records...
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-xs">
                  No attendance records found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((rec) => {
                const studentName = rec.student
                  ? `${rec.student.firstName} ${rec.student.lastName}`
                  : 'Cavendish Student';
                const studentId = rec.student?.studentProfile?.studentNumber || 'CUU-STD';

                return (
                  <TableRow key={rec.id} className="text-xs">
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                      {studentName}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {studentId}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={rec.status} />
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {rec.method}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(rec.recordedAt)}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-muted-foreground">
                      {rec.notes || '—'}
                    </TableCell>
                    {onUpdateStatus && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem
                              onClick={() => onUpdateStatus(rec.id, AttendanceStatus.PRESENT)}
                              className="gap-2 cursor-pointer text-emerald-600"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Mark Present
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onUpdateStatus(rec.id, AttendanceStatus.LATE)}
                              className="gap-2 cursor-pointer text-amber-600"
                            >
                              <Clock className="h-3.5 w-3.5" /> Mark Late
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onUpdateStatus(rec.id, AttendanceStatus.EXCUSED)}
                              className="gap-2 cursor-pointer text-slate-600"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Mark Excused
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-3 border-t bg-slate-50/50 dark:bg-slate-900/50 text-xs text-muted-foreground">
          <span>
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

