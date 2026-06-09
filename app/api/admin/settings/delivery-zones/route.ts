import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole } from "@/app/generated/prisma/client";
import { auditLogger } from "@/lib/audit";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const zones = await prisma.deliveryZone.findMany({
      orderBy: { createdAt: "asc" }
    });
    
    return NextResponse.json(zones);
  } catch (error) {
    console.error("Fetch Delivery Zones Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, pincodePrefixes, charge, isDefault } = body;

    if (!name || typeof charge !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // If this is set to default, unset others
    if (isDefault) {
      await prisma.deliveryZone.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    const newZone = await prisma.deliveryZone.create({
      data: {
        name,
        pincodePrefixes: pincodePrefixes || [],
        charge,
        isDefault: isDefault || false
      }
    });

    await auditLogger.log({
      action: "CREATE",
      entityType: "DeliveryZone",
      entityId: newZone.id,
      description: `Created delivery zone: ${newZone.name}`,
      actorUserId: session.user.id,
      actorRole: session.user.role,
      newValues: newZone,
    });

    return NextResponse.json(newZone);
  } catch (error) {
    console.error("Create Delivery Zone Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, pincodePrefixes, charge, isDefault } = body;

    if (!id || !name || typeof charge !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // If this is set to default, unset others
    if (isDefault) {
      await prisma.deliveryZone.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false }
      });
    }

    const updatedZone = await prisma.deliveryZone.update({
      where: { id },
      data: {
        name,
        pincodePrefixes: pincodePrefixes || [],
        charge,
        isDefault: isDefault || false
      }
    });

    await auditLogger.log({
      action: "UPDATE",
      entityType: "DeliveryZone",
      entityId: updatedZone.id,
      description: `Updated delivery zone: ${updatedZone.name}`,
      actorUserId: session.user.id,
      actorRole: session.user.role,
      newValues: updatedZone,
    });

    return NextResponse.json(updatedZone);
  } catch (error) {
    console.error("Update Delivery Zone Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Zone ID is required" }, { status: 400 });
    }

    // Prevent deleting the default zone directly if it's the only one
    const zone = await prisma.deliveryZone.findUnique({ where: { id } });
    if (zone?.isDefault) {
      return NextResponse.json({ error: "Cannot delete the default zone. Assign default to another zone first." }, { status: 400 });
    }

    await prisma.deliveryZone.delete({
      where: { id }
    });

    await auditLogger.log({
      action: "DELETE",
      entityType: "DeliveryZone",
      entityId: id,
      description: `Deleted delivery zone: ${zone?.name || id}`,
      actorUserId: session.user.id,
      actorRole: session.user.role,
      oldValues: zone,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Delivery Zone Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
