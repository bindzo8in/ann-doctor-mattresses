import { auditLogger } from "@/lib/audit";
import { headers } from "next/headers";

export type SecurityEvent =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "ACCOUNT_LOCKED"
  | "ACCOUNT_UNLOCKED"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_RESET_COMPLETED"
  | "RATE_LIMIT_TRIGGERED"
  | "SUSPICIOUS_ACTIVITY";

interface SecurityLogOptions {
  action: SecurityEvent;
  userId?: string;
  email?: string;
  description: string;
  metadata?: any;
}

export const securityLogger = {
  async log(options: SecurityLogOptions) {
    let ipAddress = "127.0.0.1";
    let userAgent = "Unknown";
    
    try {
      const headersList = await headers();
      ipAddress = headersList.get("x-forwarded-for") ?? "127.0.0.1";
      userAgent = headersList.get("user-agent") ?? "Unknown";
    } catch (e) {
      // In cases where headers() is not available
    }

    await auditLogger.log({
      action: options.action,
      entityType: "AuthSecurity",
      entityId: options.userId,
      description: options.description,
      metadata: {
        ...options.metadata,
        email: options.email,
      },
      ipAddress,
      userAgent,
      actorUserId: options.userId,
    });
  },
};
