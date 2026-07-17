import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function hasBetterAuthPermission(permission: string) {
  const [resource, action] = permission.split(".");

  if (!resource || !action) {
    return false;
  }

  const result = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        [resource]: [action],
      },
    },
  });

  return result?.success === true;
}
