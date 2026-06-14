"use server";

import { cookies } from "next/headers";
import { signOut } from "@/auth";
import { routes } from "@/lib/routes";

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("authjs.session-token");
    cookieStore.delete("__Secure-authjs.session-token");
    cookieStore.delete("next-auth.session-token");
    cookieStore.delete("__Secure-next-auth.session-token");

    await signOut({ redirectTo: routes.login });
  } catch (error) {
    console.error("Error during logout:", error);
  }
}
