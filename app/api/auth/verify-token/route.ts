import { VerificationTokenType } from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { getFieldErrors } from "@/lib/utils";
import { verifyEmailSchema } from "@/lib/schema/verify-email-schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = verifyEmailSchema.safeParse(body);

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

    const { token, email } = result.data;

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token,
        type: VerificationTokenType.EMAIL_VERIFICATION,
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_TOKEN",
          message: "Invalid verification token",
        },
        {
          status: 404,
        }
      );
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token,
          },
        },
      });

      return NextResponse.json(
        {
          success: false,
          code: "TOKEN_EXPIRED",
          message: "Verification token has expired",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: verificationToken.identifier,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    if (user.emailVerified) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token,
          },
        },
      });

      return NextResponse.json(
        {
          success: false,
          code: "EMAIL_ALREADY_VERIFIED",
          message: "Email already verified",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: new Date(),
        },
      }),

      prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}