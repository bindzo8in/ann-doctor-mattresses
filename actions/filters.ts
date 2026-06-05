"use server";

import prisma from "@/lib/prisma";
import { ProductType } from "@/app/generated/prisma/client";

export async function getDynamicFilterFacets(type?: ProductType) {
  // Fetch distinct thicknesses for Mattress
  let thicknessOptions: { value: string; label: string }[] = [];
  if (!type || type === "MATTRESS") {
    const thicknesses = await prisma.mattressVariant.findMany({
      select: { thickness: true },
      distinct: ['thickness'],
      orderBy: { thickness: 'asc' }
    });
    thicknessOptions = thicknesses.map(t => ({
      value: t.thickness.toString(),
      label: `${t.thickness} inch`
    }));
  }

  // Fetch distinct properties for Sofa
  let seatingCapacityOptions: { value: string; label: string }[] = [];
  let materialOptions: { value: string; label: string }[] = [];
  let shapeOptions: { value: string; label: string }[] = [];

  if (!type || type === "SOFA") {
    const seats = await prisma.sofaVariant.findMany({
      select: { seatCount: true },
      distinct: ['seatCount'],
      orderBy: { seatCount: 'asc' }
    });
    seatingCapacityOptions = seats.map(s => ({
      value: s.seatCount.toString(),
      label: `${s.seatCount} Seater`
    }));

    const materials = await prisma.sofaVariant.findMany({
      select: { material: true },
      distinct: ['material'],
      where: { material: { not: '' } }
    });
    materialOptions = materials.map(m => ({
      value: m.material,
      label: m.material
    }));

    const shapes = await prisma.sofaVariant.findMany({
      select: { shape: true },
      distinct: ['shape'],
      where: { shape: { not: null } }
    });
    shapeOptions = shapes
      .filter(s => s.shape !== null)
      .map(s => ({
        value: s.shape as string,
        label: s.shape as string
      }));
  }

  return {
    thicknessOptions,
    seatingCapacityOptions,
    materialOptions,
    shapeOptions
  };
}
