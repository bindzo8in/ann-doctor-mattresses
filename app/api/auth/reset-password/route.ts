import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/schema/reset-password-schema";
import { VerificationTokenType } from "@/app/generated/prisma/enums";
import { getFieldErrors } from "@/lib/utils";
import { env } from "@/env";
import { Redis } from "@upstash/redis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = resetPasswordSchema.safeParse(body);

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

    const { token, password } = result.data;

    const verificationToken =
      await prisma.verificationToken.findUnique({
        where: {
          token,
        },
      });

    if (
      !verificationToken ||
      verificationToken.type !==
        VerificationTokenType.PASSWORD_RESET
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_TOKEN",
        },
        {
          status: 400,
        }
      );
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: {
          token,
        },
      });

      return NextResponse.json(
        {
          success: false,
          code: "TOKEN_EXPIRED",
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
        },
        {
          status: 404,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
        },
      }),

      prisma.verificationToken.delete({
        where: {
          token,
        },
      }),

      prisma.session.deleteMany({
        where: {
          userId: user.id,
        },
      }),
    ]);

    // Revoke existing JWTs
    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      const redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      });
      await redis.set(`jwtRevokedBefore:${user.id}`, Math.floor(Date.now() / 1000));
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
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