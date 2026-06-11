import { 
  ProductType, 
  MattressSize, 
  Firmness, 
  ComfortLevel, 
  HealthBenefit, 
  SleepingPosition
} from "@/app/generated/prisma/browser";

export interface ProductFilterParams {
  type?: ProductType;
  
  // Common
  priceMin?: number;
  priceMax?: number;
  category?: string[];

  // Mattress
  size?: MattressSize[];
  thickness?: number[];
  firmness?: Firmness[];
  comfortLevel?: ComfortLevel[];
  healthBenefits?: HealthBenefit[];
  sleepingPosition?: SleepingPosition[];

  // Sofa
  seatingCapacity?: number[];
  material?: string[];
  shape?: string[];

  // Pagination
  cursor?: string;
  limit?: number;
}
