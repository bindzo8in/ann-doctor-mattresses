import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getFieldErrors } from "@/lib/utils";
import { resendVerificationSchema } from "@/lib/schema/resend-verification-schema";
import { VerificationTokenType } from "@/app/generated/prisma/enums";
import { env } from "@/env";
import { sendEmail } from "@/lib/email";
import EmailVerificationEmail from "@/emails/EmailVerificationEmail";

const RESEND_COOLDOWN_MINUTES = 2;
const TOKEN_EXPIRY_HOURS = 24;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = resendVerificationSchema.safeParse(body);

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
          "If an account exists, a verification email has been sent.",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          code: "EMAIL_ALREADY_VERIFIED",
          message: "Email is already verified.",
        },
        {
          status: 400,
        }
      );
    }

    const latestToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        type: VerificationTokenType.EMAIL_VERIFICATION,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (latestToken) {
      const cooldownEnds = new Date(
        latestToken.createdAt.getTime() +
          RESEND_COOLDOWN_MINUTES * 60 * 1000
      );

      if (cooldownEnds > new Date()) {
        const secondsRemaining = Math.ceil(
          (cooldownEnds.getTime() - Date.now()) / 1000
        );

        return NextResponse.json(
          {
            success: false,
            code: "COOLDOWN_ACTIVE",
            message: `Please wait ${secondsRemaining} seconds before requesting another email.`,
          },
          {
            status: 429,
          }
        );
      }
    }

    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
        type: VerificationTokenType.EMAIL_VERIFICATION,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.verificationToken.create({
      data: {
        token,
        identifier: email,
        type: VerificationTokenType.EMAIL_VERIFICATION,
        expires: new Date(
          Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
        ),
      },
    });

    const verificationUrl = `${env.NEXT_PUBLIC_SITE_URL}/verify-email?token=${token}`;

    // Fire-and-forget — resend must not fail the response
    sendEmail({
      to: email,
      subject: "Verify your email — Ann Doctor Mattresses",
      react: EmailVerificationEmail({
        customerName: user.name,
        verificationUrl,
      }),
    }).catch((err) => {
      console.error("[ResendVerify] Failed to send verification email", {
        email,
        err,
      });
    });

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}