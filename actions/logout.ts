"use server";

import { cookies } from "next/headers";
import { signOut } from "@/auth";

export async function logoutAction() {
  try {
    // 1. Run the Auth.js core logic FIRST so it can destroy the session backend
    await signOut({ redirect: false });

    // 2. Clear out the cookie store AFTER Auth.js executes
    const cookieStore = await cookies();

    // 3. Force-expire production cookies explicitly matching security parameters
    cookieStore.set("__Secure-authjs.session-token", "", {
      maxAge: 0,
      path: "/",
      secure: true,
      sameSite: "lax",
      httpOnly: true,
    });

    // 4. Force-expire development and callback dependencies
    cookieStore.set("authjs.session-token", "", { maxAge: 0, path: "/" });
    cookieStore.set("__Secure-authjs.callback-url", "", { maxAge: 0, path: "/" });
    cookieStore.set("__Secure-next-auth.session-token", "", { maxAge: 0, path: "/" });
    cookieStore.set("next-auth.session-token", "", { maxAge: 0, path: "/" });

  } catch (error) {
    console.error("Error during logout:", error);
  }
}
