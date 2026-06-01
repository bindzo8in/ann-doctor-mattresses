// app/api/auth/signup/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { formSchema } from "@/lib/schema/signup-schema";
import { UserRole, VerificationTokenType } from "@/app/generated/prisma/enums";
import { getFieldErrors } from "@/lib/utils";
import { Prisma } from "@/app/generated/prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = formSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          errors: getFieldErrors(validation.error),
        },
        { status: 400 },
      );
    }

    const { name, email, password } = validation.data;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
        emailVerified: true,
      },
    });

    if (existingUser) {
      if (existingUser?.emailVerified === null) {
        return NextResponse.json(
          {
            success: false,
            code: "EMAIL_NOT_VERIFIED",
            message: "Your account already exists but has not been verified.",
            email: normalizedEmail,
          },
          { status: 409 },
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            code: "ACCOUNT_EXISTS",
            message: "Account already exists",
          },
          { status: 409 },
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const cleanName = name.trim().replace(/\s+/g, " ");

    await prisma.user.create({
      data: {
        name: cleanName,
        email: normalizedEmail,
        password: passwordHash,
        role: UserRole.CUSTOMER,
      },
    });

    const token = crypto.randomBytes(32).toString("hex")

    await prisma.verificationToken.create({
      data: {
        token,
        identifier: normalizedEmail,
        type: VerificationTokenType.EMAIL_VERIFICATION,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
      }
    })

    // todo - send verification email with link


    return NextResponse.json(
      {
        success: true,
        code: "VERIFICATION_SENT",
        message: "Account created. Please verify your email.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "ACCOUNT_EXISTS",
          message: "Account already exists",
        },
        { status: 409 },
      );
    }
    console.error("SIGNUP_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
