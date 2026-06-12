"use client";

import { useState, useEffect, useCallback } from "react";
import { Notification } from "@/app/generated/prisma/client";
import { 
  getNotifications, 
  getUnreadNotificationCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from "@/actions/notifications";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial notifications
  const fetchInitialData = useCallback(async () => {
    try {
      const [initialNotifications, count] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount(),
      ]);
      setNotifications(initialNotifications as Notification[]);
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch initial notifications", err);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) => 
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    
    await markNotificationAsRead(id);
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => 
      prev.map((n) => ({ ...n, isRead: true }))
    );
    setUnreadCount(0);
    
    await markAllNotificationsAsRead();
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
