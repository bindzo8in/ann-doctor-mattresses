import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { addressSchema } from "@/lib/schema/checkout-schema";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }
    
    // verify ownership
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ message: "Not found or unauthorized" }, { status: 404 });
    }

    if (parsed.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        addressLine1: parsed.data.addressLine1,
        addressLine2: parsed.data.addressLine2 || null,
        city: parsed.data.city,
        state: parsed.data.state,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country,
        isDefault: parsed.data.isDefault || false,
      },
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error("Address PUT Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ message: "Not found or unauthorized" }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Address DELETE Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
