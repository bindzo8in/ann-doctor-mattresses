"use server";

import { cookies } from "next/headers";
import { signOut } from "@/auth";

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("authjs.session-token");
    cookieStore.delete("__Secure-authjs.session-token");
    cookieStore.delete("next-auth.session-token");
    cookieStore.delete("__Secure-next-auth.session-token");

    await signOut({ redirect: false });
  } catch (error) {
    console.error("Error during logout:", error);
  }
}
