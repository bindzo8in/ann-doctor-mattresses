import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { attributesStepSchema } from "@/lib/schema/product-step-schemas";
import { getFieldErrors } from "@/lib/utils";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = attributesStepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: getFieldErrors(parsed.error) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    await prisma.product.update({
      where: { id },
      data: {
        firmness: data.firmness ?? null,
        comfortLevel: data.comfortLevel ?? null,
        healthBenefits: data.healthBenefits ?? [],
        recommendedPositions: data.recommendedPositions ?? [],
      },
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error: any) {
    console.error("PATCH attributes error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save attributes" },
      { status: 500 }
    );
  }
}
