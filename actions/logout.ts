"use server";

import { signOut } from "@/auth";
import { routes } from "@/lib/routes";

export async function logoutAction() {
  await signOut({ redirectTo: routes.home });
}
