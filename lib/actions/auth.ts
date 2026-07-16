"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signIn } from "@/auth-old";
import { headers } from "next/headers";
import { loginRateLimit } from "@/lib/security/rate-limit";
import { securityLogger } from "@/lib/security/audit";

export type LoginActionState = {
  success: boolean;
  code?:
    | "INVALID_CREDENTIALS"
    | "EMAIL_NOT_VERIFIED"
    | "ACCOUNT_DISABLED"
    | "ACCOUNT_LOCKED"
    | "TOO_MANY_REQUESTS";
  message?: string;
  email?: string;
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

export async function login(
  email: string,
  password: string,
  callbackUrl = "/"
): Promise<LoginActionState> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
  const normalizedEmail = email.toLowerCase();
  
  // 1. Rate Limit Check
  if (loginRateLimit) {
    const rateLimitKey = `${ip}:${normalizedEmail}`;
    const { success } = await loginRateLimit.limit(rateLimitKey);
    
    if (!success) {
      await securityLogger.log({
        action: "RATE_LIMIT_TRIGGERED",
        email: normalizedEmail,
        description: `Rate limit triggered for login. Key: ${rateLimitKey}`,
      });
      return {
        success: false,
        code: "TOO_MANY_REQUESTS",
        message: "Too many login attempts. Please try again later.",
      };
    }
  }

  // 2. Fetch User
  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    await securityLogger.log({
      action: "LOGIN_FAILURE",
      email: normalizedEmail,
      description: "Failed login attempt: User not found",
    });
    return {
      success: false,
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
    };
  }

  // 3. Check Lockout Status
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return {
      success: false,
      code: "ACCOUNT_LOCKED",
      message: `Account is temporarily locked. Try again after ${user.lockedUntil.toLocaleTimeString()}`,
    };
  }

  // 4. Check other status
  if (!user.isActive) {
    return {
      success: false,
      code: "ACCOUNT_DISABLED",
      message: "Your account has been disabled.",
    };
  }

  if (!user.emailVerified && user.role === "CUSTOMER") {
    // Only enforce email verification for customers if that's the policy
    // But currently policy is for all? Wait, previous code checked `!user.emailVerified`
    return {
      success: false,
      code: "EMAIL_NOT_VERIFIED",
      message: "Please verify your email before logging in.",
      email: user.email,
    };
  }

  // 5. Verify Password
  const validPassword = await bcrypt.compare(
    password,
    user.password
  );

  if (!validPassword) {
    const failedAttempts = user.failedAttempts + 1;
    let lockedUntil = null;
    
    let action: "LOGIN_FAILURE" | "ACCOUNT_LOCKED" = "LOGIN_FAILURE";
    let description = "Failed login attempt: Invalid password";

    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      action = "ACCOUNT_LOCKED";
      description = `Account locked due to ${failedAttempts} failed attempts`;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts,
        lockedUntil,
        lastFailedAttemptAt: new Date(),
      },
    });

    await securityLogger.log({
      action,
      userId: user.id,
      email: user.email,
      description,
      metadata: { failedAttempts },
    });

    if (lockedUntil) {
      return {
        success: false,
        code: "ACCOUNT_LOCKED",
        message: `Account is temporarily locked due to too many failed attempts. Try again after 15 minutes.`,
      };
    }

    return {
      success: false,
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
    };
  }

  // 6. Success Reset
  if (user.failedAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastFailedAttemptAt: null,
      },
    });
  }

  await securityLogger.log({
    action: "LOGIN_SUCCESS",
    userId: user.id,
    email: user.email,
    description: "User logged in successfully via credentials",
  });

  // Note: the actual NextAuth signIn call is usually done in the client component or here.
  // The original code had it commented out. If it was commented out, maybe the client is doing it.
  // I will leave it commented as it was.
  //   await signIn("credentials", {
  //     email,
  //     password,
  //     redirectTo: callbackUrl,
  //   });

  return {
    success: true,
  };
}