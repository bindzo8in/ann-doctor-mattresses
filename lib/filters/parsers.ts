import { ProductFilterParams } from "./types";
import { 
  ProductType, 
  MattressSize, 
  Firmness, 
  ComfortLevel, 
  HealthBenefit, 
  SleepingPosition
} from "@/app/generated/prisma/browser";

function parseArray<T>(value: string | string[] | undefined, validValues?: readonly string[]): T[] | undefined {
  if (!value) return undefined;
  
  let rawArray: string[];
  if (typeof value === "string") {
    rawArray = value.split(",").map(v => v.trim()).filter(Boolean);
  } else {
    rawArray = Array.isArray(value) ? value : [];
  }

  if (rawArray.length === 0) return undefined;

  if (validValues) {
    return rawArray.filter(v => validValues.includes(v)) as T[];
  }

  return rawArray as T[];
}

function parseNumberArray(value: string | string[] | undefined): number[] | undefined {
  if (!value) return undefined;
  
  let rawArray: string[];
  if (typeof value === "string") {
    rawArray = value.split(",").map(v => v.trim()).filter(Boolean);
  } else {
    rawArray = Array.isArray(value) ? value : [];
  }

  const nums = rawArray.map(v => Number(v)).filter(n => !isNaN(n));
  return nums.length > 0 ? nums : undefined;
}

export function parseProductFilters(
  searchParams: { [key: string]: string | string[] | undefined }
): ProductFilterParams {
  const typeStr = typeof searchParams.type === "string" ? searchParams.type : undefined;
  const type = typeStr === "MATTRESS" ? ProductType.MATTRESS : typeStr === "SOFA" ? ProductType.SOFA : undefined;

  const priceMin = typeof searchParams.priceMin === "string" ? Number(searchParams.priceMin) : undefined;
  const priceMax = typeof searchParams.priceMax === "string" ? Number(searchParams.priceMax) : undefined;

  return {
    type,
    priceMin: !isNaN(priceMin as number) ? priceMin : undefined,
    priceMax: !isNaN(priceMax as number) ? priceMax : undefined,
    category: parseArray<string>(searchParams.category),
    
    // Mattress
    size: parseArray<MattressSize>(searchParams.size, Object.values(MattressSize)),
    thickness: parseNumberArray(searchParams.thickness),
    firmness: parseArray<Firmness>(searchParams.firmness, Object.values(Firmness)),
    comfortLevel: parseArray<ComfortLevel>(searchParams.comfortLevel, Object.values(ComfortLevel)),
    healthBenefits: parseArray<HealthBenefit>(searchParams.healthBenefits, Object.values(HealthBenefit)),
    sleepingPosition: parseArray<SleepingPosition>(searchParams.sleepingPosition, Object.values(SleepingPosition)),

    // Sofa
    seatingCapacity: parseNumberArray(searchParams.seatingCapacity),
    material: parseArray<string>(searchParams.material),
    shape: parseArray<string>(searchParams.shape),
  };
}
