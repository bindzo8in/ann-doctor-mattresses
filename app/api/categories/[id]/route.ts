import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    return NextResponse.json(
      { message: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(category);
}