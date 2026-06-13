import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { specificationsStepSchema } from "@/lib/schema/product-step-schemas";
import { auth } from "@/auth";
import { userHasPermission } from "@/lib/rbac";
import { getFieldErrors } from "@/lib/utils";

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

    const parsed = specificationsStepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: getFieldErrors(parsed.error) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const current = await prisma.productSpecification.findMany({
      where: { productId: id },
      select: { id: true, label: true, value: true },
    });

    const existingMap = new Map(current.map((s) => [s.id, s]));
    const incomingIds = new Set(
      data.specifications.map((s: any) => s.id).filter(Boolean)
    );
    const toDelete = current
      .filter((s) => !incomingIds.has(s.id))
      .map((s) => s.id);

    const ops: any[] = [];

    if (toDelete.length > 0) {
      ops.push(
        prisma.productSpecification.deleteMany({ where: { id: { in: toDelete } } })
      );
    }

    data.specifications.forEach((incoming: any) => {
      if (incoming.id && existingMap.has(incoming.id)) {
        const old = existingMap.get(incoming.id)!;
        if (old.label !== incoming.label || old.value !== incoming.value) {
          ops.push(
            prisma.productSpecification.update({
              where: { id: incoming.id },
              data: { label: incoming.label, value: incoming.value },
            })
          );
        }
      } else {
        ops.push(
          prisma.productSpecification.create({
            data: { productId: id, label: incoming.label, value: incoming.value },
          })
        );
      }
    });

    if (ops.length > 0) {
      await prisma.$transaction(ops);
    }

    const saved = await prisma.productSpecification.findMany({
      where: { productId: id },
      select: { id: true, label: true, value: true },
    });

    return NextResponse.json({ success: true, data: { specifications: saved } });
  } catch (error: any) {
    console.error("PATCH specifications error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save specifications" },
      { status: 500 }
    );
  }
}
