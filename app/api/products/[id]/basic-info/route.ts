import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { basicInfoStepSchema } from "@/lib/schema/product-step-schemas";
import { getFieldErrors } from "@/lib/utils";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = basicInfoStepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: getFieldErrors(parsed.error) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check slug uniqueness (exclude self)
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (existing && existing.id !== id) {
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

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        type: data.type,
        shortDescription: data.shortDescription.map((tag) => tag.text),
        categoryId: data.categoryId,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        availableColors: data.availableColors || [],
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, data: { id: product.id } });
  } catch (error: any) {
    console.error("PATCH basic-info error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save basic info" },
      { status: 500 }
    );
  }
}
