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
  const [isConnected, setIsConnected] = useState(false);

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

    // Setup SSE Connection
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectSSE = () => {
      if (eventSource) return;

      eventSource = new EventSource("/api/notifications/stream");

      eventSource.onopen = () => {
        setIsConnected(true);
        console.log("SSE Connected");
      };

      eventSource.addEventListener("notification", (e) => {
        try {
          const newNotification = JSON.parse(e.data) as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          
          // Optionally you could trigger a toast here
          // toast(newNotification.title, { description: newNotification.message })
        } catch (err) {
          console.error("Failed to parse incoming notification", err);
        }
      });

      eventSource.onerror = (error) => {
        setIsConnected(false);
        console.error("SSE Error, reconnecting...", error);
        eventSource?.close();
        eventSource = null;
        
        // Reconnect after 3 seconds
        reconnectTimeout = setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearTimeout(reconnectTimeout);
    };
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
    isConnected,
    markAsRead,
    markAllAsRead,
  };
}
