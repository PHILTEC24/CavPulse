'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api';
import { AttendanceRecord, AttendanceStatus, PaginatedResponse } from '@cavpulse/shared';
import toast from 'react-hot-toast';

export function useSessionAttendance(sessionId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<AttendanceRecord[]>({
    queryKey: ['attendance', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const res = await apiClient.get(`/attendance/session/${sessionId}`);
      return res.data?.data || res.data || [];
    },
    enabled: Boolean(sessionId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      recordId,
      status,
      notes,
    }: {
      recordId: string;
      status: AttendanceStatus;
      notes?: string;
    }) => {
      const res = await apiClient.patch(`/attendance/record/${recordId}`, {
        status,
        notes,
      });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', sessionId] });
      toast.success('Attendance status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update record');
    },
  });

  return {
    records: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
  };
}

export function useStudentAttendance(studentId?: string) {
  return useQuery<{
    summary: { total: number; present: number; absent: number; late: number; excused: number; rate: number };
    records: AttendanceRecord[];
  }>({
    queryKey: ['student-attendance', studentId],
    queryFn: async () => {
      const endpoint = studentId ? `/attendance/student/${studentId}` : '/attendance/my-attendance';
      const res = await apiClient.get(endpoint);
      return res.data?.data || res.data;
    },
  });
}

export function useSubmitAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      qrToken,
      latitude,
      longitude,
    }: {
      qrToken: string;
      latitude?: number;
      longitude?: number;
    }) => {
      const res = await apiClient.post('/attendance/scan', {
        qrToken,
        latitude,
        longitude,
      });
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] });
      toast.success(data?.message || 'Attendance verified successfully!');
      return data;
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to record attendance';
      toast.error(msg);
      throw err;
    },
  });
}

