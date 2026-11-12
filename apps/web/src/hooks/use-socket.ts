'use client';

import { useEffect } from 'react';
import { useSocketContext } from '../providers/socket-provider';
import { joinSessionRoom, leaveSessionRoom } from '../lib/socket';
import { WsAttendanceUpdate, WsQrRefresh, WsSessionUpdate } from '@cavpulse/shared';

interface UseSocketSessionOptions {
  sessionId?: string;
  onAttendanceRecorded?: (data: WsAttendanceUpdate) => void;
  onSessionUpdated?: (data: WsSessionUpdate) => void;
  onQrRefreshed?: (data: WsQrRefresh) => void;
}

export function useSocketSession({
  sessionId,
  onAttendanceRecorded,
  onSessionUpdated,
  onQrRefreshed,
}: UseSocketSessionOptions) {
  const { socket, isConnected } = useSocketContext();

  useEffect(() => {
    if (!sessionId || !socket) return;

    joinSessionRoom(sessionId);

    const handleAttendance = (data: WsAttendanceUpdate) => {
      if (data.sessionId === sessionId && onAttendanceRecorded) {
        onAttendanceRecorded(data);
      }
    };

    const handleSession = (data: WsSessionUpdate) => {
      if (data.sessionId === sessionId && onSessionUpdated) {
        onSessionUpdated(data);
      }
    };

    const handleQr = (data: WsQrRefresh) => {
      if (data.sessionId === sessionId && onQrRefreshed) {
        onQrRefreshed(data);
      }
    };

    socket.on('attendance:recorded', handleAttendance);
    socket.on('session:updated', handleSession);
    socket.on('qr:refreshed', handleQr);

    return () => {
      socket.off('attendance:recorded', handleAttendance);
      socket.off('session:updated', handleSession);
      socket.off('qr:refreshed', handleQr);
      leaveSessionRoom(sessionId);
    };
  }, [sessionId, socket, onAttendanceRecorded, onSessionUpdated, onQrRefreshed]);

  return { socket, isConnected };
}

