import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";
import { cloneCloudinaryImage } from "@/lib/cloudinary";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, slug, categoryId } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    if (!slug || typeof slug !== "string" || !slug.trim()) {
      return NextResponse.json({ error: "Product slug is required" }, { status: 400 });
    }

    const cleanSlug = slugify(slug.trim(), { lower: true, strict: true });

    // 1. Check slug uniqueness
    const existingSlug = await prisma.product.findUnique({
      where: { slug: cleanSlug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: `A product with slug "${cleanSlug}" already exists.` },
        { status: 400 }
      );
    }

    // 2. Fetch source product with all relations
    const sourceProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          include: {
            mattressVariant: true,
            sofaVariant: true,
          },
        },
        specifications: true,
        sections: { orderBy: { sortOrder: "asc" } },
        faqs: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!sourceProduct) {
      return NextResponse.json({ error: "Source product not found" }, { status: 404 });
    }

    // 3. Re-upload images to Cloudinary to give cloned product independent image assets
    let newThumbnailUrl = sourceProduct.thumbnailUrl;
    let newThumbnailPublicId = sourceProduct.thumbnailPublicId;

    if (sourceProduct.thumbnailUrl) {
      const clonedThumb = await cloneCloudinaryImage(sourceProduct.thumbnailUrl, "products");
      if (clonedThumb.url) {
        newThumbnailUrl = clonedThumb.url;
        newThumbnailPublicId = clonedThumb.publicId;
      }
    }

    const clonedImagesData = await Promise.all(
      sourceProduct.images.map(async (img) => {
        let url = img.url;
        let publicId = img.publicId;
        if (img.url) {
          const clonedImg = await cloneCloudinaryImage(img.url, "products");
          if (clonedImg.url) {
            url = clonedImg.url;
            publicId = clonedImg.publicId;
          }
        }
        return {
          url,
          publicId,
          sortOrder: img.sortOrder,
        };
      })
    );

    // 4. Clone product into DB
    const clonedProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        type: sourceProduct.type,
        categoryId: categoryId || sourceProduct.categoryId,
        shortDescription: sourceProduct.shortDescription,
        thumbnailUrl: newThumbnailUrl,
        thumbnailPublicId: newThumbnailPublicId,
        isActive: false, // Set clone to draft status initially
        isFeatured: false,
        featuredOrder: 0,
        availableColors: sourceProduct.availableColors,
        defaultColor: sourceProduct.defaultColor,
        sectionHeading: sourceProduct.sectionHeading || "Features & Details",
        firmness: sourceProduct.firmness,
        comfortLevel: sourceProduct.comfortLevel,
        healthBenefits: sourceProduct.healthBenefits,
        recommendedPositions: sourceProduct.recommendedPositions,
        allowCustomSize: sourceProduct.allowCustomSize,
        minWidth: sourceProduct.minWidth,
        maxWidth: sourceProduct.maxWidth,
        minLength: sourceProduct.minLength,
        maxLength: sourceProduct.maxLength,
        customSizePricing: sourceProduct.customSizePricing ?? undefined,
        customSizeMrpPricing: sourceProduct.customSizeMrpPricing ?? undefined,
        baseMrpPerSqFtPerInch: sourceProduct.baseMrpPerSqFtPerInch,
        baseSalePricePerSqFtPerInch: sourceProduct.baseSalePricePerSqFtPerInch,

        images: {
          create: clonedImagesData,
        },
        specifications: {
          create: sourceProduct.specifications.map((spec) => ({
            label: spec.label,
            value: spec.value,
          })),
        },
        sections: {
          create: sourceProduct.sections.map((sec) => ({
            type: sec.type,
            content: sec.content ?? {},
            sortOrder: sec.sortOrder,
          })),
        },
        faqs: {
          create: sourceProduct.faqs.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
            sortOrder: faq.sortOrder,
          })),
        },
        variants: {
          create: sourceProduct.variants.map((v) => ({
            mrp: v.mrp,
            salePrice: v.salePrice,
            isDefault: v.isDefault,
            mattressVariant: v.mattressVariant
              ? {
                  create: {
                    sizeName: v.mattressVariant.sizeName,
                    width: v.mattressVariant.width,
                    length: v.mattressVariant.length,
                    thickness: v.mattressVariant.thickness,
                  },
                }
              : undefined,
            sofaVariant: v.sofaVariant
              ? {
                  create: {
                    seatCount: v.sofaVariant.seatCount,
                    material: v.sofaVariant.material,
                    shape: v.sofaVariant.shape,
                  },
                }
              : undefined,
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        id: clonedProduct.id,
        name: clonedProduct.name,
        slug: clonedProduct.slug,
      },
    });
  } catch (error: any) {
    console.error("Clone Product Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clone product" },
      { status: 500 }
    );
  }
}
