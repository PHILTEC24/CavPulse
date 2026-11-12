import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './auth';
import { WsAttendanceUpdate, WsQrRefresh, WsSessionUpdate } from '@cavpulse/shared';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(WS_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
      auth: (cb) => {
        const token = getAccessToken();
        cb({ token });
      },
    });

    socketInstance.on('connect', () => {
      // connected
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('CavPulse WebSocket connect error:', err.message);
    });
  }

  return socketInstance;
}

export function connectSocket(): Socket {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export function joinSessionRoom(sessionId: string): void {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('session:join', { sessionId });
  } else {
    socket.connect();
    socket.once('connect', () => {
      socket.emit('session:join', { sessionId });
    });
  }
}

export function leaveSessionRoom(sessionId: string): void {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('session:leave', { sessionId });
  }
}

export interface SocketEvents {
  'attendance:recorded': (data: WsAttendanceUpdate) => void;
  'session:updated': (data: WsSessionUpdate) => void;
  'qr:refreshed': (data: WsQrRefresh) => void;
}

