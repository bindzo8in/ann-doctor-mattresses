"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth-old";
import { auditLogger } from "@/lib/audit";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.role || !["SUPER_ADMIN", "BRANCH_ADMIN"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

type HeroBannerInput = {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImageUrl: string;
  backgroundPublicId: string;
  mobileBackgroundImageUrl?: string;
  mobileBackgroundPublicId?: string;
  foregroundImageUrl?: string;
  foregroundPublicId?: string;
  type: "DYNAMIC" | "STATIC";
};

export async function createHeroBanner(data: HeroBannerInput) {
  const session = await checkAdmin();
  
  const currentCount = await prisma.heroBanner.count();

  const banner = await prisma.heroBanner.create({
    data: {
      ...data,
      order: currentCount,
      isActive: true,
    }
  });

  await auditLogger.log({
    action: "CREATE",
    entityType: "HeroBanner",
    entityId: banner.id,
    description: `Created new hero banner: ${banner.title}`,
    actorUserId: session.user.id,
    actorRole: session.user.role,
    newValues: banner,
  });

  revalidatePath("/");
  revalidatePath("/dashboard/hero");
  return { success: true, data: banner };
}

export async function updateHeroBanner(id: string, data: Partial<HeroBannerInput>) {
  const session = await checkAdmin();
  
  const banner = await prisma.heroBanner.update({
    where: { id },
    data
  });

  await auditLogger.log({
    action: "UPDATE",
    entityType: "HeroBanner",
    entityId: banner.id,
    description: `Updated hero banner: ${banner.title}`,
    actorUserId: session.user.id,
    actorRole: session.user.role,
    newValues: banner,
  });

  revalidatePath("/");
  revalidatePath("/dashboard/hero");
  return { success: true, data: banner };
}

export async function deleteHeroBanner(id: string) {
  const session = await checkAdmin();
  
  const banner = await prisma.heroBanner.delete({
    where: { id }
  });

  await auditLogger.log({
    action: "DELETE",
    entityType: "HeroBanner",
    entityId: id,
    description: `Deleted hero banner: ${banner.title}`,
    actorUserId: session.user.id,
    actorRole: session.user.role,
    oldValues: banner,
  });

  revalidatePath("/");
  revalidatePath("/dashboard/hero");
  return { success: true };
}

export async function reorderHeroBanners(orderedIds: string[]) {
  const session = await checkAdmin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.heroBanner.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  await auditLogger.log({
    action: "UPDATE",
    entityType: "HeroBanner",
    description: `Reordered hero banners`,
    actorUserId: session.user.id,
    actorRole: session.user.role,
  });

  revalidatePath("/");
  revalidatePath("/dashboard/hero");
  return { success: true };
}

export async function toggleHeroBannerStatus(id: string, isActive: boolean) {
  const session = await checkAdmin();
  
  const banner = await prisma.heroBanner.update({
    where: { id },
    data: { isActive }
  });

  await auditLogger.log({
    action: "UPDATE",
    entityType: "HeroBanner",
    entityId: banner.id,
    description: `Toggled hero banner status to ${isActive ? 'Active' : 'Inactive'}`,
    actorUserId: session.user.id,
    actorRole: session.user.role,
    newValues: banner,
  });

  revalidatePath("/");
  revalidatePath("/dashboard/hero");
  return { success: true };
}
export async function getAdminHeroBanners() {
  await checkAdmin();
  return prisma.heroBanner.findMany({
    orderBy: { order: "asc" }
  });
}
