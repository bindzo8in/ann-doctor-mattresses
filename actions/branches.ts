"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UserRole } from "@/app/generated/prisma/enums";
import { auditLogger } from "@/lib/audit";
import { getCoordinates } from "@/lib/geocoding";
import { headers } from "next/headers";

export async function getBranches() {
  const hasPermission = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        branches: ['read']
      }
    }
  })

  if (!hasPermission.success) throw new Error("Unauthorized");

  const branches = await prisma.branch.findMany({
    orderBy: { createdAt: "desc" }
  });
  return branches;
}

export async function createBranch(data: { name: string; address?: string; district: string; state?: string; phone?: string; googleMapUrl?: string; latitude?: number; longitude?: number; isActive?: boolean }) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    throw new Error("Unauthorized");
  }
  const hasPermission = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        branches: ['create']
      }
    }
  })
  
  if (!hasPermission.success) {
    throw new Error("Unauthorized");
  }




  let coords = null;
  if (!data.latitude || !data.longitude) {
    coords = await getCoordinates(data.address, data.district, data.state);
  }

  const branch = await prisma.branch.create({
    data: {
      ...data,
      latitude: data.latitude || coords?.latitude || null,
      longitude: data.longitude || coords?.longitude || null,
    }
  });

  await auditLogger.log({
    action: "CREATE",
    entityType: "Branch",
    entityId: branch.id,
    description: `Created new branch: ${branch.name}`,
    actorUserId: session.user.id,
    actorRole: session.user.role!,
    newValues: branch,
  });

  return branch;
}

export async function updateBranch(id: string, data: { name?: string; address?: string; district?: string; state?: string; phone?: string; googleMapUrl?: string; latitude?: number; longitude?: number; isActive?: boolean }) {
  const hasPermission = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        branches: ['update']
      }
    }
  })
  if (!hasPermission.success) {
    throw new Error("Unauthorized");
  }

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    throw new Error("Unauthorized");
  }

  let updateData: any = { ...data };

  // Handle explicit coordinate updates
  if (data.latitude !== undefined) updateData.latitude = data.latitude;
  if (data.longitude !== undefined) updateData.longitude = data.longitude;

  // Re-geocode only if address, district, or state changes AND manual coordinates weren't provided
  if ((data.address !== undefined || data.district !== undefined || data.state !== undefined) && data.latitude === undefined && data.longitude === undefined) {
    const existing = await prisma.branch.findUnique({ where: { id } });
    if (existing) {
      const address = data.address !== undefined ? data.address : existing.address || undefined;
      const district = data.district !== undefined ? data.district : existing.district;
      const state = data.state !== undefined ? data.state : existing.state;

      const coords = await getCoordinates(address, district, state);
      if (coords) {
        updateData.latitude = coords.latitude;
        updateData.longitude = coords.longitude;
      }
    }
  }

  const branch = await prisma.branch.update({
    where: { id },
    data: updateData
  });

  await auditLogger.log({
    action: "UPDATE",
    entityType: "Branch",
    entityId: branch.id,
    description: `Updated branch: ${branch.name}`,
    actorUserId: session.user.id,
    actorRole: session.user.role!,
    newValues: branch,
  });

  return branch;
}

export async function deleteBranch(id: string) {
  const hasPermission = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        branches: ['delete']
      }
    }
  })
  if (!hasPermission.success) {
    throw new Error("Unauthorized");
  }

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    throw new Error("Unauthorized");
  }

  const branch = await prisma.branch.delete({
    where: { id }
  });

  await auditLogger.log({
    action: "DELETE",
    entityType: "Branch",
    entityId: id,
    description: `Deleted branch: ${branch.name}`,
    actorUserId: session.user.id,
    actorRole: session.user.role!,
    oldValues: branch,
  });

  return { success: true };
}
