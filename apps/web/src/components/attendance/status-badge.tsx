'use client';

import React from 'react';
import { AttendanceStatus } from '@cavpulse/shared';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: AttendanceStatus;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return (
        <Badge
          variant="success"
          className={cn('gap-1 font-semibold', className)}
        >
          {showIcon && <CheckCircle2 className="h-3 w-3" />}
          <span>Present</span>
        </Badge>
      );
    case AttendanceStatus.LATE:
      return (
        <Badge
          variant="warning"
          className={cn('gap-1 font-semibold', className)}
        >
          {showIcon && <Clock className="h-3 w-3" />}
          <span>Late</span>
        </Badge>
      );
    case AttendanceStatus.ABSENT:
      return (
        <Badge
          variant="destructive"
          className={cn('gap-1 font-semibold', className)}
        >
          {showIcon && <XCircle className="h-3 w-3" />}
          <span>Absent</span>
        </Badge>
      );
    case AttendanceStatus.EXCUSED:
      return (
        <Badge
          variant="secondary"
          className={cn('gap-1 font-semibold text-slate-700 dark:text-slate-300', className)}
        >
          {showIcon && <AlertCircle className="h-3 w-3" />}
          <span>Excused</span>
        </Badge>
      );
    case AttendanceStatus.PENDING:
    default:
      return (
        <Badge
          variant="outline"
          className={cn('gap-1 font-semibold text-muted-foreground', className)}
        >
          {showIcon && <HelpCircle className="h-3 w-3" />}
          <span>Pending</span>
        </Badge>
      );
  }
}

