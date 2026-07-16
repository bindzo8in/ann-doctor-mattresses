"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth-old";
import { userHasPermission } from "@/lib/rbac";

interface AuditLogFilters {
  cursor?: string | null;
  limit?: number;
  entityType?: string;
  action?: string;
  actorUserId?: string;
  fromDate?: string;
  toDate?: string;
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const session = await auth();
  
  if (!userHasPermission(session?.user, "audit.read")) {
    throw new Error("Forbidden");
  }

  try {
    const { cursor, limit = 50, entityType, action, actorUserId, fromDate, toDate } = filters;

    const where: any = {};
    if (entityType) where.entityType = { contains: entityType, mode: "insensitive" };
    if (action) where.action = { contains: action, mode: "insensitive" };
    if (actorUserId) where.actorUserId = actorUserId;

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
    });

    let nextCursor: string | undefined = undefined;
    if (logs.length > limit) {
      const nextItem = logs.pop();
      nextCursor = nextItem!.id;
    }

    // Get aggregated metrics
    const totalEvents = await prisma.auditLog.count({ where });

    return { logs, nextCursor, totalEvents };
  } catch (error) {
    console.error("getAuditLogs Error:", error);
    throw new Error("Failed to load audit logs");
  }
}
