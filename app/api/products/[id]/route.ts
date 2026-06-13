import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createProductSchema } from "@/lib/schema/product-form-schema";
import { getFieldErrors } from "@/lib/utils";
import { v2 as cloudinary } from "cloudinary";
// import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { userHasPermission } from "@/lib/rbac";
import { measure } from "@/lib/utils/measure";
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
      select: {
        thumbnailPublicId: true,
        images: { select: { publicId: true } },
        sections: { select: { type: true, content: true } }
      }
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
  return measure("PUT /api/products/[id]", async () => {
    try {
      const session = await auth();
      if (!userHasPermission(session?.user, "products.update")) {
        console.log("no permission", session?.user?.role)
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      const { id } = await params;
      const body = await req.json();
      
      const parsed = await measure("PUT /api/products/[id] Validation", async () => createProductSchema.safeParse(body));

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

    // Thumbnail check removed to allow draft updates

    // Check if slug is taken by another product
    const existingProduct = await measure("PUT /api/products/[id] Check Slug", async () => prisma.product.findUnique({
      where: { slug: data.slug },
      select: { id: true }
    }));

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
    const currentProduct = await measure("PUT /api/products/[id] Check Product", async () => prisma.product.findUnique({
      where: { id },
      select: {
        thumbnailPublicId: true,
        images: { select: { id: true, url: true, publicId: true, sortOrder: true } },
        sections: { select: { id: true, type: true, content: true, sortOrder: true } },
        specifications: { select: { id: true, label: true, value: true } },
        faqs: { select: { id: true, question: true, answer: true, sortOrder: true } }
      }
    }));

    if (!currentProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Collect orphaned Cloudinary images
    const publicIdsToDelete: string[] = [];
    if (currentProduct.thumbnailPublicId && currentProduct.thumbnailPublicId !== data.thumbnail?.publicId) {
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
    const existingVariants = await measure("PUT /api/products/[id] Get Variants", async () => prisma.productVariant.findMany({
      where: { productId: id },
      select: {
        id: true,
        mrp: true,
        salePrice: true,
        isDefault: true,
        mattressVariant: {
          select: { sizeName: true, width: true, length: true, thickness: true }
        },
        sofaVariant: {
          select: { seatCount: true, material: true, shape: true }
        }
      }
    }));

    const existingVariantMap = new Map(existingVariants.map(v => [v.id, v]));
    const incomingVariantIds = new Set(data.variants.map((v: any) => v.id).filter(Boolean));
    const variantsToDelete = existingVariants.filter(v => !incomingVariantIds.has(v.id)).map(v => v.id);

    const transactionOps: any[] = [];

    // 1. Delete removed variants
    if (variantsToDelete.length > 0) {
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

    // ID-based updates for Images
    const existingImageMap = new Map(currentProduct.images.map(img => [img.id, img]));
    const incomingImageIds = new Set(data.images.map((img: any) => img.id).filter(Boolean));
    const imagesToDelete = currentProduct.images.filter(img => !incomingImageIds.has(img.id)).map(img => img.id);

    if (imagesToDelete.length > 0) {
      transactionOps.push(prisma.productImage.deleteMany({ where: { id: { in: imagesToDelete } } }));
    }

    data.images.forEach((incomingImage: any) => {
      if (incomingImage.id && existingImageMap.has(incomingImage.id)) {
        const old = existingImageMap.get(incomingImage.id)!;
        if (old.url !== incomingImage.url || old.publicId !== incomingImage.publicId || old.sortOrder !== incomingImage.sortOrder) {
          transactionOps.push(
            prisma.productImage.update({
              where: { id: incomingImage.id },
              data: {
                url: incomingImage.url,
                publicId: incomingImage.publicId,
                sortOrder: incomingImage.sortOrder,
              },
            })
          );
        }
      } else {
        transactionOps.push(
          prisma.productImage.create({
            data: {
              productId: id,
              url: incomingImage.url,
              publicId: incomingImage.publicId,
              sortOrder: incomingImage.sortOrder,
            },
          })
        );
      }
    });

    // ID-based updates for Specifications
    const existingSpecMap = new Map(currentProduct.specifications.map(s => [s.id, s]));
    const incomingSpecIds = new Set(data.specifications.map((s: any) => s.id).filter(Boolean));
    const specsToDelete = currentProduct.specifications.filter(s => !incomingSpecIds.has(s.id)).map(s => s.id);

    if (specsToDelete.length > 0) {
      transactionOps.push(prisma.productSpecification.deleteMany({ where: { id: { in: specsToDelete } } }));
    }

    data.specifications.forEach((incomingSpec: any) => {
      if (incomingSpec.id && existingSpecMap.has(incomingSpec.id)) {
        const old = existingSpecMap.get(incomingSpec.id)!;
        if (old.label !== incomingSpec.label || old.value !== incomingSpec.value) {
          transactionOps.push(
            prisma.productSpecification.update({
              where: { id: incomingSpec.id },
              data: {
                label: incomingSpec.label,
                value: incomingSpec.value,
              },
            })
          );
        }
      } else {
        transactionOps.push(
          prisma.productSpecification.create({
            data: {
              productId: id,
              label: incomingSpec.label,
              value: incomingSpec.value,
            },
          })
        );
      }
    });

    // ID-based updates for Sections
    const existingSectionMap = new Map(currentProduct.sections.map(s => [s.id, s]));
    const incomingSectionIds = new Set(data.sections.map((s: any) => s.id).filter(Boolean));
    const sectionsToDelete = currentProduct.sections.filter(s => !incomingSectionIds.has(s.id)).map(s => s.id);

    if (sectionsToDelete.length > 0) {
      transactionOps.push(prisma.productSection.deleteMany({ where: { id: { in: sectionsToDelete } } }));
    }

    data.sections.forEach((incomingSection: any) => {
      if (incomingSection.id && existingSectionMap.has(incomingSection.id)) {
        const old = existingSectionMap.get(incomingSection.id)!;
        // Compare values, since content is JSON it's trickier to compare. We can stringify.
        if (old.type !== incomingSection.type || old.sortOrder !== incomingSection.sortOrder || JSON.stringify(old.content) !== JSON.stringify({ ...(incomingSection.content as any), title: incomingSection.title })) {
          transactionOps.push(
            prisma.productSection.update({
              where: { id: incomingSection.id },
              data: {
                type: incomingSection.type,
                content: { ...(incomingSection.content as any), title: incomingSection.title },
                sortOrder: incomingSection.sortOrder,
              },
            })
          );
        }
      } else {
        transactionOps.push(
          prisma.productSection.create({
            data: {
              productId: id,
              type: incomingSection.type,
              content: { ...(incomingSection.content as any), title: incomingSection.title },
              sortOrder: incomingSection.sortOrder,
            },
          })
        );
      }
    });

    // ID-based updates for FAQs
    const existingFaqMap = new Map(currentProduct.faqs.map(f => [f.id, f]));
    const incomingFaqIds = new Set(data.faqs.map((f: any) => f.id).filter(Boolean));
    const faqsToDelete = currentProduct.faqs.filter(f => !incomingFaqIds.has(f.id)).map(f => f.id);

    if (faqsToDelete.length > 0) {
      transactionOps.push(prisma.productFaq.deleteMany({ where: { id: { in: faqsToDelete } } }));
    }

    data.faqs.forEach((incomingFaq: any, index: number) => {
      if (incomingFaq.id && existingFaqMap.has(incomingFaq.id)) {
        const old = existingFaqMap.get(incomingFaq.id)!;
        if (old.question !== incomingFaq.question || old.answer !== incomingFaq.answer || old.sortOrder !== index) {
          transactionOps.push(
            prisma.productFaq.update({
              where: { id: incomingFaq.id },
              data: {
                question: incomingFaq.question,
                answer: incomingFaq.answer,
                sortOrder: index,
              },
            })
          );
        }
      } else {
        transactionOps.push(
          prisma.productFaq.create({
            data: {
              productId: id,
              question: incomingFaq.question,
              answer: incomingFaq.answer,
              sortOrder: index,
            },
          })
        );
      }
    });

    transactionOps.push(
      prisma.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          type: data.type,
          shortDescription: data.shortDescription.map((tag) => tag.text),
          thumbnailUrl: data.thumbnail?.url || "",
          thumbnailPublicId: data.thumbnail?.publicId || "",
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
          sectionHeading: data.sectionsHeading || "",
        },
        include: {
          images: true,
          specifications: true,
          sections: true,
          faqs: true,
          variants: {
            include: {
              mattressVariant: true,
              sofaVariant: true,
            }
          }
        }
      })
    );

    const results = await measure("PUT /api/products/[id] DB Transaction", async () => prisma.$transaction(transactionOps, {
      timeout: 60000, // 60 seconds to allow for many variant inserts
      maxWait: 15000, // 15 seconds to wait for connection
    }));
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
  });
}
