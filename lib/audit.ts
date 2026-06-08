import prisma from "@/lib/prisma";

export interface AuditLogOptions {
  action: string;
  entityType: string;
  entityId?: string;
  description?: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  actorUserId?: string;
  actorRole?: string;
}

export const auditLogger = {
  async log(options: AuditLogOptions) {
    try {
      await prisma.auditLog.create({
        data: {
          action: options.action,
          entityType: options.entityType,
          entityId: options.entityId,
          description: options.description,
          oldValues: options.oldValues ? JSON.stringify(options.oldValues) : undefined,
          newValues: options.newValues ? JSON.stringify(options.newValues) : undefined,
          metadata: options.metadata ? JSON.stringify(options.metadata) : undefined,
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
          actorUserId: options.actorUserId,
          actorRole: options.actorRole,
        },
      });
    } catch (error) {
      console.error("Failed to write audit log:", error);
      // We do not throw to prevent crashing the main flow
    }
  },
};
