import crypto from "crypto";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/schema/forgot-password-schema";
import { VerificationTokenType } from "@/app/generated/prisma/enums";
import { getFieldErrors } from "@/lib/utils";
import { env } from "@/env";
import { passwordResetRateLimit } from "@/lib/security/rate-limit";
import { sendEmail } from "@/lib/email";
import ForgotPasswordEmail from "@/emails/ForgotPasswordEmail";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (passwordResetRateLimit) {
      const { success } = await passwordResetRateLimit.limit(`password_reset:${ip}`);
      if (!success) {
        return NextResponse.json(
          { success: false, message: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    }

    const body = await req.json();

    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          errors: getFieldErrors(result.error),
        },
        {
          status: 400,
        }
      );
    }

    const { email } = result.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists, a password reset link has been sent.",
      });
    }

    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
        type: VerificationTokenType.PASSWORD_RESET,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.verificationToken.create({
      data: {
        token,
        identifier: email,
        type: VerificationTokenType.PASSWORD_RESET,
        expires: new Date(Date.now() + 1000 * 60 * 15), // 15 min
      },
    });

    const resetUrl = `${env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`;

    // Fire-and-forget — a failed email must not expose enumeration via error codes
    sendEmail({
      to: email,
      subject: "Reset your password — Ann Doctor Mattresses",
      react: ForgotPasswordEmail({
        customerName: user.name,
        resetUrl,
      }),
    }).catch((err) => {
      console.error("[ForgotPassword] Failed to send reset email", {
        email,
        err,
      });
    });

    return NextResponse.json({
      success: true,
      message:
        "If an account exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
      },
      {
        status: 500,
      }
    );
  }
}