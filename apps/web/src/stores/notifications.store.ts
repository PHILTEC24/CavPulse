import { create } from 'zustand';
import { Notification, NotificationType } from '@cavpulse/shared';
import apiClient from '../lib/api';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [
    {
      id: 'demo-1',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      userId: 'u1',
      type: NotificationType.SESSION_STARTED,
      title: 'Session Started',
      message: 'BIT 2102 Data Structures lecture is now in progress in Main Hall A.',
      isRead: false,
    },
    {
      id: 'demo-2',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      userId: 'u1',
      type: NotificationType.ATTENDANCE_RECORDED,
      title: 'Attendance Verified',
      message: 'Your attendance was recorded as PRESENT for CSC 3101.',
      isRead: false,
    },
  ],
  unreadCount: 2,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get('/notifications');
      const data = response.data?.data || response.data || [];
      const list = Array.isArray(data) ? data : [];
      set({
        notifications: list.length > 0 ? list : get().notifications,
        unreadCount: list.filter((n: Notification) => !n.isRead).length || get().unreadCount,
        isLoading: false,
      });
    } catch {
      // Keep existing
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`).catch(() => {});
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });
    } catch {
      // optimistic update fallback
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });
    }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.patch('/notifications/read-all').catch(() => {});
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    }));
  },
}));

