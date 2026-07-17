"use server";

import { auth } from "@/lib/auth";

export async function getNotifications() {
  const session = await auth();
  if (!session?.user) return [];
  
  const { NotificationService } = await import("@/lib/notification-service");
  return NotificationService.getUserNotifications(session.user.id, session.user.role);
}

export async function getUnreadNotificationCount() {
  const session = await auth();
  if (!session?.user) return 0;
  
  const { NotificationService } = await import("@/lib/notification-service");
  return NotificationService.getUnreadCount(session.user.id, session.user.role);
}

export async function markNotificationAsRead(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false };
  
  const { NotificationService } = await import("@/lib/notification-service");
  await NotificationService.markAsRead(id, session.user.id);
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const session = await auth();
  if (!session?.user) return { success: false };
  
  const { NotificationService } = await import("@/lib/notification-service");
  await NotificationService.markAllAsRead(session.user.id, session.user.role);
  return { success: true };
}
