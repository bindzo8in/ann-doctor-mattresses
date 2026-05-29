"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signIn } from "@/auth";

export type LoginActionState = {
  success: boolean;
  code?:
    | "INVALID_CREDENTIALS"
    | "EMAIL_NOT_VERIFIED"
    | "ACCOUNT_DISABLED";
  message?: string;
  email?: string;
};

export async function login(
  email: string,
  password: string,
  callbackUrl = "/"
): Promise<LoginActionState> {
  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (!user) {
    return {
      success: false,
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
    };
  }

  if (!user.isActive) {
    return {
      success: false,
      code: "ACCOUNT_DISABLED",
      message: "Your account has been disabled.",
    };
  }

  if (!user.emailVerified) {
    return {
      success: false,
      code: "EMAIL_NOT_VERIFIED",
      message: "Please verify your email before logging in.",
      email: user.email,
    };
  }

  const validPassword = await bcrypt.compare(
    password,
    user.password
  );

  if (!validPassword) {
    return {
      success: false,
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
    };
  }

//   await signIn("credentials", {
//     email,
//     password,
//     redirectTo: callbackUrl,
//   });

  return {
    success: true,
  };
}