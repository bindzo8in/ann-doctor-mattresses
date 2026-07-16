import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { basicInfoStepSchema } from "@/lib/schema/product-step-schemas";
import { getFieldErrors } from "@/lib/utils";
import { ZodError } from "zod";

export const maxDuration = 30;

import { auth } from "@/auth-old";
import { userHasPermission } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!userHasPermission(session?.user, "products.create")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    const parsed = basicInfoStepSchema.safeParse(body);

    if (!parsed.success) {
      console.error("Validation errors:", parsed.error);
      return NextResponse.json(
        { success: false, errors: getFieldErrors(parsed.error) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          errors: {
            slug: { message: "A product with this slug already exists. Please choose a unique slug." },
          },
        },
        { status: 400 }
      );
    }

    // Create a minimal product — relations (images, variants, specs, faqs, sections)
    // are saved individually via PATCH /api/products/[id]/[step]
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        type: data.type,
        shortDescription: data.shortDescription.map((tag) => tag.text),
        categoryId: data.categoryId,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        availableColors: data.availableColors || [],
        // Required non-nullable fields with safe defaults until media step
        thumbnailUrl: "",
        thumbnailPublicId: "",
        sectionHeading: "",
      },
    });

    return NextResponse.json({ success: true, data: { id: product.id } });
  } catch (error: any) {
    console.error("Create product error:", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, errors: getFieldErrors(error) },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
