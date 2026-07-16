import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mediaStepSchema } from "@/lib/schema/product-step-schemas";
import { auth } from "@/auth-old";
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

    const parsed = mediaStepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: getFieldErrors(parsed.error) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Fetch current product media to detect removed images
    const current = await prisma.product.findUnique({
      where: { id },
      select: {
        thumbnailPublicId: true,
        images: { select: { id: true, url: true, publicId: true, sortOrder: true } },
      },
    });

    if (!current) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const publicIdsToDelete: string[] = [];

    // Detect replaced thumbnail
    if (
      current.thumbnailPublicId &&
      current.thumbnailPublicId !== data.thumbnail?.publicId
    ) {
      publicIdsToDelete.push(current.thumbnailPublicId);
    }

    // Detect removed gallery images
    const incomingPublicIds = new Set(data.images.map((img) => img.publicId));
    current.images.forEach((img) => {
      if (img.publicId && !incomingPublicIds.has(img.publicId)) {
        publicIdsToDelete.push(img.publicId);
      }
    });

    // ID-based upsert for gallery images
    const existingImageMap = new Map(current.images.map((img) => [img.id, img]));
    const incomingImageIds = new Set(
      data.images.map((img: any) => img.id).filter(Boolean)
    );
    const imagesToDelete = current.images
      .filter((img) => !incomingImageIds.has(img.id))
      .map((img) => img.id);

    const ops: any[] = [];

    if (imagesToDelete.length > 0) {
      ops.push(prisma.productImage.deleteMany({ where: { id: { in: imagesToDelete } } }));
    }

    data.images.forEach((incoming: any) => {
      if (incoming.id && existingImageMap.has(incoming.id)) {
        const old = existingImageMap.get(incoming.id)!;
        if (
          old.url !== incoming.url ||
          old.publicId !== incoming.publicId ||
          old.sortOrder !== incoming.sortOrder
        ) {
          ops.push(
            prisma.productImage.update({
              where: { id: incoming.id },
              data: { url: incoming.url, publicId: incoming.publicId, sortOrder: incoming.sortOrder },
            })
          );
        }
      } else {
        ops.push(
          prisma.productImage.create({
            data: {
              productId: id,
              url: incoming.url,
              publicId: incoming.publicId,
              sortOrder: incoming.sortOrder,
            },
          })
        );
      }
    });

    ops.push(
      prisma.product.update({
        where: { id },
        data: {
          thumbnailUrl: data.thumbnail?.url || "",
          thumbnailPublicId: data.thumbnail?.publicId || "",
        },
        select: { id: true },
      })
    );

    const results = await prisma.$transaction(ops);
    const savedImages = await prisma.productImage.findMany({
      where: { productId: id },
      select: { id: true, url: true, publicId: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
    });

    // Cleanup removed Cloudinary assets after successful DB transaction
    if (publicIdsToDelete.length > 0) {
      try {
        await cloudinary.api.delete_resources(publicIdsToDelete, { invalidate: true });
      } catch (err) {
        console.error("Cloudinary cleanup error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        thumbnail: data.thumbnail ?? null,
        images: savedImages,
      },
    });
  } catch (error: any) {
    console.error("PATCH media error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save media" },
      { status: 500 }
    );
  }
}
