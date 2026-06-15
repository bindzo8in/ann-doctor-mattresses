"use server";

import { cookies } from "next/headers";
import { signOut } from "@/auth";

export async function logoutAction() {
  // 1. Clear cookies FIRST, before signOut() can throw a NEXT_REDIRECT
  const cookieStore = await cookies();

  const cookieNames = [
    "__Secure-authjs.session-token",
    "authjs.session-token",
    "__Secure-authjs.callback-url",
    "authjs.callback-url",
    "__Secure-authjs.csrf-token",
    "authjs.csrf-token",
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];

  for (const name of cookieNames) {
    // Delete with default attributes
    cookieStore.delete(name);

    // Also force-expire with explicit production attributes
    cookieStore.set(name, "", {
      maxAge: 0,
      expires: new Date(0),
      path: "/",
      secure: true,
      sameSite: "lax",
      httpOnly: true,
    });
  }

  // 2. Now call signOut — let the NEXT_REDIRECT throw propagate naturally
  //    (do NOT wrap in try/catch, Next.js needs this throw to work)
  await signOut({ redirect: false });
}
