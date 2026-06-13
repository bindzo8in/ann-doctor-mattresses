import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sectionsStepSchema } from "@/lib/schema/product-step-schemas";
import { auth } from "@/auth";
import { userHasPermission } from "@/lib/rbac";
import { getFieldErrors } from "@/lib/utils";
import { v2 as cloudinary } from "cloudinary";
import { env } from "@/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const session = await auth();
    if (!userHasPermission(session?.user, "products.update")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const parsed = sectionsStepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: getFieldErrors(parsed.error) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const current = await prisma.productSection.findMany({
      where: { productId: id },
      select: { id: true, type: true, content: true, sortOrder: true },
    });

    // Detect removed section images for Cloudinary cleanup
    const incomingSectionImageIds = new Set<string>();
    data.sections.forEach((section) => {
      if (
        section.type === "FEATURES_WITH_IMAGE" &&
        (section.content as any)?.image?.publicId
      ) {
        incomingSectionImageIds.add((section.content as any).image.publicId);
      }
    });

    const publicIdsToDelete: string[] = [];
    current.forEach((section) => {
      if (section.type === "FEATURES_WITH_IMAGE" && section.content) {
        const content = section.content as any;
        if (
          content.image?.publicId &&
          !incomingSectionImageIds.has(content.image.publicId)
        ) {
          publicIdsToDelete.push(content.image.publicId);
        }
      }
    });

    const existingMap = new Map(current.map((s) => [s.id, s]));
    const incomingIds = new Set(
      data.sections.map((s: any) => s.id).filter(Boolean)
    );
    const toDelete = current
      .filter((s) => !incomingIds.has(s.id))
      .map((s) => s.id);

    const ops: any[] = [];

    if (toDelete.length > 0) {
      ops.push(
        prisma.productSection.deleteMany({ where: { id: { in: toDelete } } })
      );
    }

    data.sections.forEach((incoming: any) => {
      const contentWithTitle = {
        ...(incoming.content as any),
        title: incoming.title,
      };

      if (incoming.id && existingMap.has(incoming.id)) {
        const old = existingMap.get(incoming.id)!;
        if (
          old.type !== incoming.type ||
          old.sortOrder !== incoming.sortOrder ||
          JSON.stringify(old.content) !== JSON.stringify(contentWithTitle)
        ) {
          ops.push(
            prisma.productSection.update({
              where: { id: incoming.id },
              data: {
                type: incoming.type,
                content: contentWithTitle,
                sortOrder: incoming.sortOrder,
              },
            })
          );
        }
      } else {
        ops.push(
          prisma.productSection.create({
            data: {
              productId: id,
              type: incoming.type,
              content: contentWithTitle,
              sortOrder: incoming.sortOrder,
            },
          })
        );
      }
    });

    ops.push(
      prisma.product.update({
        where: { id },
        data: { sectionHeading: data.sectionsHeading ?? "" },
        select: { id: true },
      })
    );

    await prisma.$transaction(ops);

    // Cleanup removed section images from Cloudinary
    if (publicIdsToDelete.length > 0) {
      try {
        await cloudinary.api.delete_resources(publicIdsToDelete, { invalidate: true });
      } catch (err) {
        console.error("Cloudinary cleanup error (sections):", err);
      }
    }

    const saved = await prisma.productSection.findMany({
      where: { productId: id },
      select: { id: true, type: true, content: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, data: { sections: saved } });
  } catch (error: any) {
    console.error("PATCH sections error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save sections" },
      { status: 500 }
    );
  }
}
