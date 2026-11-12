'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api';
import { LectureSession, LectureSessionStatus, AttendanceStatus, AttendanceMethod } from '@cavpulse/shared';
import toast from 'react-hot-toast';

export function useSession(sessionId?: string) {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery<LectureSession>({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('No session ID provided');
      const res = await apiClient.get(`/sessions/${sessionId}`);
      return res.data?.data || res.data;
    },
    enabled: Boolean(sessionId),
    refetchInterval: 15000, // Background poll every 15s to keep in sync with sockets
  });

  const startSessionMutation = useMutation({
    mutationFn: async (timetableSlotId: string) => {
      const res = await apiClient.post('/sessions/start', { timetableSlotId });
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Lecture session started successfully');
      return data;
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to start session');
    },
  });

  const closeSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/sessions/${id}/close`);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Lecture session closed');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to close session');
    },
  });

  const manualCheckInMutation = useMutation({
    mutationFn: async ({
      sessionId: sId,
      studentId,
      status = AttendanceStatus.PRESENT,
      notes,
    }: {
      sessionId: string;
      studentId: string;
      status?: AttendanceStatus;
      notes?: string;
    }) => {
      const res = await apiClient.post('/attendance/manual', {
        sessionId: sId,
        studentId,
        status,
        method: AttendanceMethod.MANUAL,
        notes,
      });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['attendance', sessionId] });
      toast.success('Student attendance recorded manually');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to record attendance');
    },
  });

  return {
    session: sessionQuery.data,
    isLoading: sessionQuery.isLoading,
    isError: sessionQuery.isError,
    error: sessionQuery.error,
    refetch: sessionQuery.refetch,
    startSession: startSessionMutation.mutateAsync,
    isStarting: startSessionMutation.isPending,
    closeSession: closeSessionMutation.mutateAsync,
    isClosing: closeSessionMutation.isPending,
    manualCheckIn: manualCheckInMutation.mutateAsync,
    isManualCheckingIn: manualCheckInMutation.isPending,
  };
}

export function useSessionsList(params?: {
  status?: LectureSessionStatus;
  date?: string;
  courseId?: string;
}) {
  return useQuery<LectureSession[]>({
    queryKey: ['sessions', params],
    queryFn: async () => {
      const res = await apiClient.get('/sessions', { params });
      return res.data?.data || res.data || [];
    },
  });
}

