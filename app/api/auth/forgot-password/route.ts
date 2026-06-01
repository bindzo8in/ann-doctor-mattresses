import crypto from "crypto";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/schema/forgot-password-schema";
import { VerificationTokenType } from "@/app/generated/prisma/enums";
import { getFieldErrors } from "@/lib/utils";
import { env } from "@/env";

export async function POST(req: NextRequest) {
  try {
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

    const resetUrl =
      `${env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`;
    console.log(resetUrl);

    // Send email here

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