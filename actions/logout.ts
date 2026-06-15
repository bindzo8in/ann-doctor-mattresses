"use server";

import { cookies } from "next/headers";

export async function logoutAction() {
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
    cookieStore.set(name, "", {
      maxAge: 0,
      expires: new Date(0),
      path: "/",
      secure: true,
      sameSite: "lax",
      httpOnly: true,
    });
  }
}
