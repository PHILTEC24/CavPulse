'use client';

import { useEffect } from 'react';
import { useNotificationsStore } from '../stores/notifications.store';
import { useSocketContext } from '../providers/socket-provider';
import { Notification } from '@cavpulse/shared';
import toast from 'react-hot-toast';

export function useNotifications() {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
  } = useNotificationsStore();

  const { socket } = useSocketContext();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      addNotification(notification);
      toast(notification.title, {
        icon: '🔔',
        duration: 4000,
      });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, addNotification]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };
}

