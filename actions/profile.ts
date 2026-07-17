"use server";

import { auth } from "@/lib/auth";
import { auditLogger } from "@/lib/audit";
import { headers } from "next/headers";

export async function updateCustomerProfile(data: {
  name: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { name, currentPassword, newPassword } = data;

  if (!name?.trim()) {
    throw new Error("Name is required");
  }

  if (newPassword && newPassword.trim() !== "") {
    if (!currentPassword) {
      throw new Error("Current password is required to set a new password");
    }

    await auth.api.changePassword({
      headers: requestHeaders,
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
    });
  }

  if (name.trim() !== session.user.name) {
    await auth.api.updateUser({
      headers: requestHeaders,
      body: { name: name.trim() },
    });
  }

  await auditLogger.log({
    action: "UPDATE",
    entityType: "User",
    entityId: session.user.id,
    description: `User updated their profile`,
    actorUserId: session.user.id,
    actorRole: session.user.role ?? undefined,
    newValues: { name: name.trim(), passwordChanged: !!newPassword },
  });

  return { success: true };
}
