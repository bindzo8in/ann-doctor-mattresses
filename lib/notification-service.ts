import prisma from "@/lib/prisma";
import { sseManager } from "./sse-manager";
import { webpush } from "./web-push";

interface CreateNotificationParams {
  userId?: string; // If not provided, assumed to be for all super admins
  title: string;
  message: string;
  type: string;
  url?: string;
}

// Internal helper for pushing
async function sendWebPush(userIds: string[], payload: any) {
  if (userIds.length === 0) return;

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: { in: userIds } },
  });

  const payloadString = JSON.stringify(payload);

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payloadString
      );
    } catch (error: any) {
      // 410 Gone means the subscription is no longer valid
      if (error.statusCode === 410 || error.statusCode === 404) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      } else {
        console.error("Error sending web push:", error);
      }
    }
  }
}

export const NotificationService = {
  async createNotification(data: CreateNotificationParams) {
    // 1. Save to database
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId || null,
        title: data.title,
        message: data.message,
        type: data.type,
      },
    });

    // 2. Immediately push SSE event
    if (notification.userId) {
      sseManager.sendToUser(notification.userId, notification);
    } else {
      sseManager.broadcastToAdmins(notification);
    }

    // 3. Send Web Push
    const pushPayload = {
      title: notification.title,
      body: notification.message,
      url: data.url || "/", // Default URL if none provided
    };

    if (notification.userId) {
      // Send to specific user
      sendWebPush([notification.userId], pushPayload).catch(console.error);
    } else {
      // Send to all SUPER_ADMIN and BRANCH_ADMIN users
      const admins = await prisma.user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "BRANCH_ADMIN"] } },
        select: { id: true },
      });
      const adminIds = admins.map(a => a.id);
      sendWebPush(adminIds, pushPayload).catch(console.error);
    }

    return notification;
  },

  async notifyUser(userId: string, title: string, message: string, type: string = "INFO", url?: string) {
    return this.createNotification({ userId, title, message, type, url });
  },

  async notifyAdmins(title: string, message: string, type: string = "INFO", url?: string) {
    return this.createNotification({ title, message, type, url });
  },

  async markAsRead(id: string, userId: string) {
    return await prisma.notification.updateMany({
      where: { 
        id, 
        OR: [{ userId }, { userId: null }] // Can read if it belongs to user or is global admin notification
      },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string, role: string) {
    if (role === "SUPER_ADMIN") {
      return await prisma.notification.updateMany({
        where: { 
          OR: [{ userId }, { userId: null }],
          isRead: false
        },
        data: { isRead: true },
      });
    } else {
      return await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    }
  },

  async getUnreadCount(userId: string, role: string) {
    if (role === "SUPER_ADMIN") {
      return await prisma.notification.count({
        where: {
          OR: [{ userId }, { userId: null }],
          isRead: false
        }
      });
    } else {
      return await prisma.notification.count({
        where: { userId, isRead: false }
      });
    }
  },

  async getUserNotifications(userId: string, role: string) {
    if (role === "SUPER_ADMIN") {
      return await prisma.notification.findMany({
        where: {
          OR: [{ userId }, { userId: null }]
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    } else {
      return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    }
  }
};
