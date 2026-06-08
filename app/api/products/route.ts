import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import { createProductSchema } from "@/lib/schema/product-form-schema";
import { ZodError } from "zod";
import { getFieldErrors } from "@/lib/utils";

import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    console.log("Received product data:", body);

    const parsed = createProductSchema.safeParse(body);


    if (!parsed.success) {
      console.error("Validation errors:", parsed.error);
      return NextResponse.json(
        {
          success: false,
          errors: getFieldErrors(parsed.error),
        },
        { status: 400 },
      );
    }
    const data = parsed.data;

    if(data.thumbnail === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Thumbnail is required",
        },
        { status: 400 }
      )
    }
    const existingProduct = await prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existingProduct) {
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
          
    const product = await prisma.product.create({
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
        images: {
          createMany: {
            data: data.images,
            skipDuplicates: true,
          },
        },
        specifications: {
          createMany: {
            data: data.specifications,
          },
        },
        ...(data.type === "MATTRESS" ? {
          firmness: data.firmness,
          comfortLevel: data.comfortLevel,
          healthBenefits: data.healthBenefits,
          recommendedAgeGroups: data.recommendedAgeGroups,
          recommendedWeightGroups: data.recommendedWeightGroups,
          recommendedPositions: data.recommendedPositions,
          allowCustomSize: data.allowCustomSize || false,
          minWidth: data.minWidth,
          maxWidth: data.maxWidth,
          minLength: data.minLength,
          maxLength: data.maxLength,
          customSizePricing: data.customSizePricing ? data.customSizePricing : null,
        } : {}),
        sections: {
          create: data.sections.map((section) => ({
            type: section.type,
            content: { ...(section.content as any), title: section.title },
            sortOrder: section.sortOrder,
          })),
        },
        sectionHeading: data.sectionsHeading,
        faqs: {
          create: data.faqs,
        },
        variants: {
          create: data.variants.map((variant) => ({
            mrp: variant.mrp,
            salePrice: variant.salePrice,
            isDefault: variant.isDefault,

            ...(variant.variantType === "MATTRESS"
              ? {
                  mattressVariant: {
                    create: {
                      sizeName: variant.sizeName,
                      width: variant.width,
                      length: variant.length,
                      thickness: variant.thickness,
                    },
                  },
                }
              : {
                  sofaVariant: {
                    create: {
                      seatCount: variant.seatCount,
                      material: variant.material,
                      shape: variant.shape,
                    },
                  },
                }),
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          errors: getFieldErrors(error),
        },
        { status: 400 },
      );
    }


    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
