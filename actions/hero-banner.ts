"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

function checkAdmin() {
  return auth().then(session => {
    if (!session?.user?.role || !["SUPER_ADMIN", "BRANCH_ADMIN"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }
  });
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
};

export async function createHeroBanner(data: HeroBannerInput) {
  await checkAdmin();
  
  const currentCount = await prisma.heroBanner.count();

  const banner = await prisma.heroBanner.create({
    data: {
      ...data,
      order: currentCount,
      isActive: true,
    }
  });

  revalidatePath("/");
  revalidatePath("/dashboard/hero");
  return { success: true, data: banner };
}

export async function updateHeroBanner(id: string, data: Partial<HeroBannerInput>) {
  await checkAdmin();
  
  const banner = await prisma.heroBanner.update({
    where: { id },
    data
  });

  revalidatePath("/");
  revalidatePath("/dashboard/hero");
  return { success: true, data: banner };
}

export async function deleteHeroBanner(id: string) {
  await checkAdmin();
  
  await prisma.heroBanner.delete({
    where: { id }
  });

  revalidatePath("/");
  revalidatePath("/dashboard/hero");
  return { success: true };
}

export async function reorderHeroBanners(orderedIds: string[]) {
  await checkAdmin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.heroBanner.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/dashboard/hero");
  return { success: true };
}

export async function toggleHeroBannerStatus(id: string, isActive: boolean) {
  await checkAdmin();
  
  await prisma.heroBanner.update({
    where: { id },
    data: { isActive }
  });

  revalidatePath("/");
  revalidatePath("/dashboard/hero");
  return { success: true };
}
