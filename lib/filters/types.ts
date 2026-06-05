import { 
  ProductType, 
  MattressSize, 
  Firmness, 
  ComfortLevel, 
  HealthBenefit, 
  SleepingPosition, 
  AgeGroup, 
  WeightGroup 
} from "@/app/generated/prisma/browser";

export interface ProductFilterParams {
  type?: ProductType;
  
  // Common
  priceMin?: number;
  priceMax?: number;

  // Mattress
  size?: MattressSize[];
  thickness?: number[];
  firmness?: Firmness[];
  comfortLevel?: ComfortLevel[];
  healthBenefits?: HealthBenefit[];
  sleepingPosition?: SleepingPosition[];
  ageGroup?: AgeGroup[];
  weightGroup?: WeightGroup[];

  // Sofa
  seatingCapacity?: number[];
  material?: string[];
  shape?: string[];

  // Pagination
  cursor?: string;
  limit?: number;
}
