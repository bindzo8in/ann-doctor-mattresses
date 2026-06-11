import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createProductSchema } from "@/lib/schema/product-form-schema";
import { getFieldErrors } from "@/lib/utils";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { userHasPermission } from "@/lib/rbac";
import { env } from "@/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const maxDuration = 60; // Allow up to 60 seconds for slow Prisma transactions with many variants

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteProps
) {
  try {
    const session = await auth();
    if (!userHasPermission(session?.user, "products.delete")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true, sections: true }
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const publicIdsToDelete: string[] = [];
    if (product.thumbnailPublicId) {
      publicIdsToDelete.push(product.thumbnailPublicId);
    }
    product.images.forEach(img => {
      if (img.publicId) publicIdsToDelete.push(img.publicId);
    });
    
    // Also extract images from sections if they exist
    product.sections.forEach(section => {
      if (section.type === "FEATURES_WITH_IMAGE" && section.content) {
        const content = section.content as any;
        if (content.image?.publicId) {
          publicIdsToDelete.push(content.image.publicId);
        }
      }
    });

    await prisma.product.delete({
      where: { id },
    });

    // Cleanup Cloudinary
    if (publicIdsToDelete.length > 0) {
      try {
        await cloudinary.api.delete_resources(publicIdsToDelete, { invalidate: true });
      } catch (err) {
        console.error("Cloudinary cleanup error during delete:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: RouteProps
) {
  try {
    const session = await auth();
    if (!userHasPermission(session?.user, "products.update")) {
      console.log("no permission", session?.user.role)
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          errors: getFieldErrors(parsed.error),
        },
        { status: 400 },
      );
    }
    const data = parsed.data;

    if (data.thumbnail === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Thumbnail is required",
        },
        { status: 400 }
      );
    }

    // Check if slug is taken by another product
    const existingProduct = await prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existingProduct && existingProduct.id !== id) {
      return NextResponse.json(
        {
          success: false,
          errors: {
            slug: {
              message: "A product with this slug already exists. Please choose a unique slug.",
            }
          },
        },
        { status: 400 },
      );
    }

    // Fetch current product to check for removed images
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true, sections: true }
    });

    if (!currentProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Collect orphaned Cloudinary images
    const publicIdsToDelete: string[] = [];
    if (currentProduct.thumbnailPublicId && currentProduct.thumbnailPublicId !== data.thumbnail.publicId) {
      publicIdsToDelete.push(currentProduct.thumbnailPublicId);
    }
    
    const newGalleryIds = data.images.map(img => img.publicId);
    currentProduct.images.forEach(img => {
      if (img.publicId && !newGalleryIds.includes(img.publicId)) {
        publicIdsToDelete.push(img.publicId);
      }
    });

    // Check for removed section images
    const newSectionImageIds: string[] = [];
    data.sections.forEach(section => {
      if (section.type === "FEATURES_WITH_IMAGE" && (section.content as any)?.image?.publicId) {
        newSectionImageIds.push((section.content as any).image.publicId);
      }
    });
    
    currentProduct.sections.forEach(section => {
      if (section.type === "FEATURES_WITH_IMAGE" && section.content) {
        const content = section.content as any;
        if (content.image?.publicId && !newSectionImageIds.includes(content.image.publicId)) {
          publicIdsToDelete.push(content.image.publicId);
        }
      }
    });

    // Since a product has many relations (images, variants, specs, faqs, sections),
    // the safest way to update is to delete the existing relations and recreate them.
    
    // Explicitly find variant children to prevent foreign key constraint violations
    const existingVariants = await prisma.productVariant.findMany({
      where: { productId: id },
      include: {
        mattressVariant: true,
        sofaVariant: true,
      },
    });

    const existingVariantMap = new Map(existingVariants.map(v => [v.id, v]));
    const incomingVariantIds = new Set(data.variants.map((v: any) => v.id).filter(Boolean));
    const variantsToDelete = existingVariants.filter(v => !incomingVariantIds.has(v.id)).map(v => v.id);

    const transactionOps: any[] = [];

    // 1. Delete removed variants
    if (variantsToDelete.length > 0) {
      transactionOps.push(prisma.mattressVariant.deleteMany({ where: { variantId: { in: variantsToDelete } } }));
      transactionOps.push(prisma.sofaVariant.deleteMany({ where: { variantId: { in: variantsToDelete } } }));
      transactionOps.push(prisma.productVariant.deleteMany({ where: { id: { in: variantsToDelete } } }));
    }

    // 2. Update existing variants
    const variantsToUpdate = data.variants.filter((v: any) => v.id && existingVariantMap.has(v.id));
    variantsToUpdate.forEach((incomingVariant: any) => {
      const old = existingVariantMap.get(incomingVariant.id)!;
      
      if (
        old.mrp.toNumber() !== incomingVariant.mrp ||
        old.salePrice.toNumber() !== incomingVariant.salePrice ||
        old.isDefault !== incomingVariant.isDefault
      ) {
        transactionOps.push(
          prisma.productVariant.update({
            where: { id: incomingVariant.id },
            data: {
              mrp: incomingVariant.mrp,
              salePrice: incomingVariant.salePrice,
              isDefault: incomingVariant.isDefault,
            },
          })
        );
      }

      if (incomingVariant.variantType === "MATTRESS" && old.mattressVariant) {
        const mv = old.mattressVariant;
        if (
          mv.sizeName !== incomingVariant.sizeName ||
          mv.width !== incomingVariant.width ||
          mv.length !== incomingVariant.length ||
          mv.thickness !== incomingVariant.thickness
        ) {
          transactionOps.push(
            prisma.mattressVariant.update({
              where: { variantId: incomingVariant.id },
              data: {
                sizeName: incomingVariant.sizeName,
                width: incomingVariant.width,
                length: incomingVariant.length,
                thickness: incomingVariant.thickness,
              },
            })
          );
        }
      } else if (incomingVariant.variantType === "SOFA" && old.sofaVariant) {
        const sv = old.sofaVariant;
        if (
          sv.seatCount !== incomingVariant.seatCount ||
          sv.material !== incomingVariant.material ||
          sv.shape !== incomingVariant.shape ||
          (sv as any).color !== (incomingVariant as any).color // Included in case of future changes
        ) {
          transactionOps.push(
            prisma.sofaVariant.update({
              where: { variantId: incomingVariant.id },
              data: {
                seatCount: incomingVariant.seatCount,
                material: incomingVariant.material,
                shape: incomingVariant.shape,
              },
            })
          );
        }
      }
    });

    // 3. Create new variants
    const variantsToCreate = data.variants.filter((v: any) => !v.id || !existingVariantMap.has(v.id));
    variantsToCreate.forEach((incomingVariant: any) => {
      transactionOps.push(
        prisma.productVariant.create({
          data: {
            productId: id,
            mrp: incomingVariant.mrp,
            salePrice: incomingVariant.salePrice,
            isDefault: incomingVariant.isDefault,
            ...(incomingVariant.variantType === "MATTRESS"
              ? {
                  mattressVariant: {
                    create: {
                      sizeName: incomingVariant.sizeName,
                      width: incomingVariant.width,
                      length: incomingVariant.length,
                      thickness: incomingVariant.thickness,
                    },
                  },
                }
              : {
                  sofaVariant: {
                    create: {
                      seatCount: incomingVariant.seatCount,
                      material: incomingVariant.material,
                      shape: incomingVariant.shape,
                    },
                  },
                }),
          },
        })
      );
    });

    // Keep existing images, specs, faqs, sections logic unchanged
    transactionOps.push(prisma.productImage.deleteMany({ where: { productId: id } }));
    transactionOps.push(prisma.productSpecification.deleteMany({ where: { productId: id } }));
    transactionOps.push(prisma.productSection.deleteMany({ where: { productId: id } }));
    transactionOps.push(prisma.productFaq.deleteMany({ where: { productId: id } }));

    transactionOps.push(
      prisma.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          type: data.type,
          shortDescription: data.shortDescription.map((tag) => tag.text),
          thumbnailUrl: data.thumbnail.url,
          thumbnailPublicId: data.thumbnail.publicId,
          isFeatured: data.isFeatured,
          isActive: data.isActive,
          availableColors: data.availableColors || [],
          categoryId: data.categoryId,
          firmness: data.firmness,
          comfortLevel: data.comfortLevel,
          healthBenefits: data.healthBenefits || [],
          recommendedPositions: data.recommendedPositions || [],
          allowCustomSize: data.allowCustomSize || false,
          minWidth: data.minWidth,
          maxWidth: data.maxWidth,
          minLength: data.minLength,
          maxLength: data.maxLength,
          customSizePricing: data.customSizePricing ? data.customSizePricing : null,
          images: {
            createMany: {
              data: data.images.map((img) => ({
                url: img.url,
                publicId: img.publicId,
                sortOrder: img.sortOrder,
              })),
            },
          },
          specifications: {
            createMany: {
              data: data.specifications.map((spec) => ({
                label: spec.label,
                value: spec.value,
              })),
            },
          },
          sections: {
            createMany: {
              data: data.sections.map((section) => ({
                type: section.type,
                content: { ...(section.content as any), title: section.title },
                sortOrder: section.sortOrder,
              })),
            },
          },
          sectionHeading: data.sectionsHeading,
          faqs: {
            createMany: {
              data: data.faqs.map((faq) => ({
                question: faq.question,
                answer: faq.answer,
              })),
            },
          },
        },
      })
    );

    const results = await prisma.$transaction(transactionOps, {
      timeout: 60000, // 60 seconds to allow for many variant inserts
      maxWait: 15000, // 15 seconds to wait for connection
    });
    const product = results[results.length - 1];

    // Delete orphaned images from Cloudinary after successful DB transaction
    if (publicIdsToDelete.length > 0) {
      try {
        await cloudinary.api.delete_resources(publicIdsToDelete, { invalidate: true });
      } catch (err) {
        console.error("Cloudinary cleanup error during update:", err);
      }
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}
