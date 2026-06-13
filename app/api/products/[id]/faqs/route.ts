import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { faqsStepSchema } from "@/lib/schema/product-step-schemas";
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

    const parsed = faqsStepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: getFieldErrors(parsed.error) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const current = await prisma.productFaq.findMany({
      where: { productId: id },
      select: { id: true, question: true, answer: true, sortOrder: true },
    });

    const existingMap = new Map(current.map((f) => [f.id, f]));
    const incomingIds = new Set(
      data.faqs.map((f: any) => f.id).filter(Boolean)
    );
    const toDelete = current
      .filter((f) => !incomingIds.has(f.id))
      .map((f) => f.id);

    const ops: any[] = [];

    if (toDelete.length > 0) {
      ops.push(
        prisma.productFaq.deleteMany({ where: { id: { in: toDelete } } })
      );
    }

    data.faqs.forEach((incoming: any, index: number) => {
      if (incoming.id && existingMap.has(incoming.id)) {
        const old = existingMap.get(incoming.id)!;
        if (
          old.question !== incoming.question ||
          old.answer !== incoming.answer ||
          old.sortOrder !== index
        ) {
          ops.push(
            prisma.productFaq.update({
              where: { id: incoming.id },
              data: {
                question: incoming.question,
                answer: incoming.answer,
                sortOrder: index,
              },
            })
          );
        }
      } else {
        ops.push(
          prisma.productFaq.create({
            data: {
              productId: id,
              question: incoming.question,
              answer: incoming.answer,
              sortOrder: index,
            },
          })
        );
      }
    });

    if (ops.length > 0) {
      await prisma.$transaction(ops);
    }

    const saved = await prisma.productFaq.findMany({
      where: { productId: id },
      select: { id: true, question: true, answer: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, data: { faqs: saved } });
  } catch (error: any) {
    console.error("PATCH faqs error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save FAQs" },
      { status: 500 }
    );
  }
}
