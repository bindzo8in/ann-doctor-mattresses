import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import { createProductSchema } from "@/lib/schema/product-form-schema";
import { ZodError } from "zod";
import { getFieldErrors } from "@/lib/utils";

export async function POST(req: NextRequest) {
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
        sections: {
          create: data.sections.map((section) => ({
            type: section.type,
            content: section.content,
            sortOrder: section.sortOrder,
          })),
        },
        sectionHeading: data.sectionsHeading,
        faqs: {
          create: data.faqs,
        },
        variants: {
          create: data.variants.map((variant) => ({
            sku: variant.sku,
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
                      firmness: variant.firmness,
                      recommendedAgeGroups: variant.recommendedAgeGroups,
                      recommendedWeightGroups: variant.recommendedWeightGroups,
                      recommendedPositions: variant.recommendedPositions,
                      comfortLevel: variant.comfortLevel,
                      healthBenefits: variant.healthBenefits,
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
