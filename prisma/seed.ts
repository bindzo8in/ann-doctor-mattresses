import { PrismaClient, UserRole, OrderStatus, ProductType, Firmness, AgeGroup, WeightGroup, SleepingPosition, ComfortLevel, HealthBenefit, MattressSize } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required for production seed`);
  }

  return value;
}

const isProduction = process.env.NODE_ENV === "production";

const adminSeed = {
  name: process.env.SEED_ADMIN_NAME || "Admin User",
  email: isProduction
    ? getRequiredEnv("SEED_ADMIN_EMAIL")
    : process.env.SEED_ADMIN_EMAIL || "admin@example.com",
  password: isProduction
    ? getRequiredEnv("SEED_ADMIN_PASSWORD")
    : process.env.SEED_ADMIN_PASSWORD || "admin123",
};

const imageUrl = "https://res.cloudinary.com/dnvcjfgbl/image/upload/v1780387628/products/vjpn6lhakobw0bmrmm1l.png";

const categories = [
  { id: "cat_001", name: "Luxury Mattresses", slug: "luxury-mattresses" },
  { id: "cat_002", name: "Budget Mattresses", slug: "budget-mattresses" },
  { id: "cat_003", name: "Orthopedic Mattresses", slug: "orthopedic-mattresses" },
  { id: "cat_004", name: "Modern Sofas", slug: "modern-sofas" },
  { id: "cat_005", name: "Classic Sofas", slug: "classic-sofas" }
];

const products = [
  { id: "prod_001", name: "Cloud Comfort Luxury Mattress", slug: "cloud-comfort-luxury", type: ProductType.MATTRESS, categoryId: "cat_001", thumbnailUrl: imageUrl, thumbnailPublicId: "products/vjpn6lhakobw0bmrmm1l", shortDescription: ["Premium memory foam", "Cooling gel technology", "10-year warranty"], sectionHeading: "Experience Ultimate Comfort", isFeatured: true, isActive: true, firmness: Firmness.MEDIUM_SOFT, comfortLevel: ComfortLevel.BALANCED, healthBenefits: [HealthBenefit.PRESSURE_RELIEF, HealthBenefit.COOLING], recommendedAgeGroups: [AgeGroup.TEEN], recommendedWeightGroups: [WeightGroup.UNDER_60, WeightGroup.KG_60_80], recommendedPositions: [SleepingPosition.BACK, SleepingPosition.COMBINATION] },
  { id: "prod_002", name: "DreamRest Orthopedic Mattress", slug: "dreamrest-orthopedic", type: ProductType.MATTRESS, categoryId: "cat_003", thumbnailUrl: imageUrl, thumbnailPublicId: "products/ortho_001", shortDescription: ["Spinal alignment", "Pressure relief", "Medical grade foam"], sectionHeading: "Wake Up Pain-Free", isFeatured: true, isActive: true, firmness: Firmness.FIRM, comfortLevel: ComfortLevel.SUPPORTIVE, healthBenefits: [HealthBenefit.ORTHOPEDIC, HealthBenefit.BACK_PAIN_RELIEF], recommendedAgeGroups: [AgeGroup.ADULT, AgeGroup.SENIOR], recommendedWeightGroups: [WeightGroup.KG_60_80, WeightGroup.KG_80_100, WeightGroup.OVER_100], recommendedPositions: [SleepingPosition.BACK] },
  { id: "prod_003", name: "EcoGreen Natural Mattress", slug: "ecogreen-natural", type: ProductType.MATTRESS, categoryId: "cat_002", thumbnailUrl: imageUrl, thumbnailPublicId: "products/eco_001", shortDescription: ["Organic cotton", "Natural latex", "Eco-friendly"], sectionHeading: "Sleep Naturally", isFeatured: false, isActive: true, firmness: Firmness.MEDIUM_SOFT, comfortLevel: ComfortLevel.PLUSH, healthBenefits: [HealthBenefit.COOLING], recommendedAgeGroups: [AgeGroup.KIDS, AgeGroup.TEEN], recommendedWeightGroups: [WeightGroup.UNDER_60], recommendedPositions: [SleepingPosition.SIDE, SleepingPosition.COMBINATION] },
  { id: "prod_004", name: "Midnight Deluxe Mattress", slug: "midnight-deluxe", type: ProductType.MATTRESS, categoryId: "cat_001", thumbnailUrl: imageUrl, thumbnailPublicId: "products/midnight_001", shortDescription: ["Plush top", "Edge support", "Motion isolation"], sectionHeading: "Luxury Redefined", isFeatured: true, isActive: true, firmness: Firmness.MEDIUM_SOFT, comfortLevel: ComfortLevel.PLUSH, healthBenefits: [HealthBenefit.PRESSURE_RELIEF, HealthBenefit.MOTION_ISOLATION], recommendedAgeGroups: [AgeGroup.ADULT], recommendedWeightGroups: [WeightGroup.KG_60_80, WeightGroup.KG_80_100], recommendedPositions: [SleepingPosition.SIDE] },
  { id: "prod_005", name: "BackRelief Pro Mattress", slug: "backrelief-pro", type: ProductType.MATTRESS, categoryId: "cat_003", thumbnailUrl: imageUrl, thumbnailPublicId: "products/back_001", shortDescription: ["Lumbar support", "Firm comfort", "Doctor recommended"], sectionHeading: "Support Where You Need It", isFeatured: false, isActive: true, firmness: Firmness.FIRM, comfortLevel: ComfortLevel.SUPPORTIVE, healthBenefits: [HealthBenefit.BACK_PAIN_RELIEF, HealthBenefit.ORTHOPEDIC], recommendedAgeGroups: [AgeGroup.ADULT, AgeGroup.SENIOR], recommendedWeightGroups: [WeightGroup.KG_60_80, WeightGroup.KG_80_100, WeightGroup.OVER_100], recommendedPositions: [SleepingPosition.BACK] },
  { id: "prod_006", name: "ValueSleep Economy Mattress", slug: "valuesleep-economy", type: ProductType.MATTRESS, categoryId: "cat_002", thumbnailUrl: imageUrl, thumbnailPublicId: "products/value_001", shortDescription: ["Affordable comfort", "Basic support", "Great for guests"], sectionHeading: "Quality on a Budget", isFeatured: false, isActive: true, firmness: Firmness.MEDIUM, comfortLevel: ComfortLevel.BALANCED, healthBenefits: [], recommendedAgeGroups: [AgeGroup.KIDS, AgeGroup.TEEN, AgeGroup.ADULT], recommendedWeightGroups: [WeightGroup.UNDER_60, WeightGroup.KG_60_80], recommendedPositions: [SleepingPosition.BACK, SleepingPosition.COMBINATION] },
  { id: "prod_007", name: "LuxeCraft Velvet Sofa", slug: "luxecraft-velvet-sofa", type: ProductType.SOFA, categoryId: "cat_004", thumbnailUrl: imageUrl, thumbnailPublicId: "products/sofa_001", shortDescription: ["Luxurious velvet", "Modern design", "Sturdy frame"], sectionHeading: "Elegance Meets Comfort", isFeatured: true, isActive: true },
  { id: "prod_008", name: "UrbanEdge Sectional Sofa", slug: "urbanedge-sectional", type: ProductType.SOFA, categoryId: "cat_004", thumbnailUrl: imageUrl, thumbnailPublicId: "products/sofa_002", shortDescription: ["Modular design", "Chaise lounge", "Pet-friendly fabric"], sectionHeading: "Perfect for Modern Living", isFeatured: true, isActive: true },
  { id: "prod_009", name: "Heritage Chesterfield Sofa", slug: "heritage-chesterfield", type: ProductType.SOFA, categoryId: "cat_005", thumbnailUrl: imageUrl, thumbnailPublicId: "products/sofa_003", shortDescription: ["Classic tufted", "Leather finish", "Button details"], sectionHeading: "Timeless Elegance", isFeatured: false, isActive: true },
  { id: "prod_010", name: "CozyLinen Recliner Sofa", slug: "cozylinen-recliner", type: ProductType.SOFA, categoryId: "cat_005", thumbnailUrl: imageUrl, thumbnailPublicId: "products/sofa_004", shortDescription: ["Power recline", "USB ports", "Cup holders"], sectionHeading: "Relax in Style", isFeatured: true, isActive: true },
  { id: "prod_011", name: "KidsDream Junior Mattress", slug: "kidsdream-junior", type: ProductType.MATTRESS, categoryId: "cat_002", thumbnailUrl: imageUrl, thumbnailPublicId: "products/kids_001", shortDescription: ["Anti-allergy", "Waterproof layer", "Fun design"], sectionHeading: "Perfect for Growing Kids", isFeatured: false, isActive: true, firmness: Firmness.MEDIUM_SOFT, comfortLevel: ComfortLevel.PLUSH, healthBenefits: [HealthBenefit.PRESSURE_RELIEF], recommendedAgeGroups: [AgeGroup.KIDS, AgeGroup.TEEN], recommendedWeightGroups: [WeightGroup.UNDER_60], recommendedPositions: [SleepingPosition.BACK, SleepingPosition.SIDE] },
  { id: "prod_012", name: "BambooBreeze Cooling Mattress", slug: "bamboobreeze-cooling", type: ProductType.MATTRESS, categoryId: "cat_001", thumbnailUrl: imageUrl, thumbnailPublicId: "products/bamboo_001", shortDescription: ["Cooling bamboo cover", "Airflow technology", "Temperature regulating"], sectionHeading: "Stay Cool All Night", isFeatured: true, isActive: true, firmness: Firmness.MEDIUM, comfortLevel: ComfortLevel.BALANCED, healthBenefits: [HealthBenefit.COOLING], recommendedAgeGroups: [AgeGroup.ADULT], recommendedWeightGroups: [WeightGroup.KG_60_80, WeightGroup.KG_80_100], recommendedPositions: [SleepingPosition.SIDE, SleepingPosition.BACK] },
  { id: "prod_013", name: "Minimalist Nordic Sofa", slug: "minimalist-nordic", type: ProductType.SOFA, categoryId: "cat_004", thumbnailUrl: imageUrl, thumbnailPublicId: "products/sofa_005", shortDescription: ["Scandinavian design", "Wooden legs", "Neutral colors"], sectionHeading: "Less is More", isFeatured: false, isActive: true },
  { id: "prod_014", name: "SleepTech Hybrid Mattress", slug: "sleptech-hybrid", type: ProductType.MATTRESS, categoryId: "cat_003", thumbnailUrl: imageUrl, thumbnailPublicId: "products/tech_001", shortDescription: ["Pocket springs", "Memory foam", "Zoned support"], sectionHeading: "Innovation Meets Comfort", isFeatured: true, isActive: true, firmness: Firmness.MEDIUM_FIRM, comfortLevel: ComfortLevel.SUPPORTIVE, healthBenefits: [HealthBenefit.BACK_PAIN_RELIEF, HealthBenefit.PRESSURE_RELIEF], recommendedAgeGroups: [AgeGroup.ADULT], recommendedWeightGroups: [WeightGroup.KG_60_80, WeightGroup.KG_80_100], recommendedPositions: [SleepingPosition.BACK, SleepingPosition.STOMACH] },
  { id: "prod_015", name: "Vintage Leather Sofa", slug: "vintage-leather-sofa", type: ProductType.SOFA, categoryId: "cat_005", thumbnailUrl: imageUrl, thumbnailPublicId: "products/sofa_006", shortDescription: ["Genuine leather", "Aged finish", "Brass studs"], sectionHeading: "Old World Charm", isFeatured: false, isActive: true }
];

const productImages = [
  { id: "img_001", productId: "prod_001", url: imageUrl, publicId: "products/img1", sortOrder: 0 },
  { id: "img_002", productId: "prod_001", url: imageUrl, publicId: "products/img2", sortOrder: 1 },
  { id: "img_003", productId: "prod_002", url: imageUrl, publicId: "products/img3", sortOrder: 0 },
  { id: "img_004", productId: "prod_003", url: imageUrl, publicId: "products/img4", sortOrder: 0 },
  { id: "img_005", productId: "prod_004", url: imageUrl, publicId: "products/img5", sortOrder: 0 },
  { id: "img_006", productId: "prod_004", url: imageUrl, publicId: "products/img6", sortOrder: 1 },
  { id: "img_007", productId: "prod_007", url: imageUrl, publicId: "products/img7", sortOrder: 0 },
  { id: "img_008", productId: "prod_007", url: imageUrl, publicId: "products/img8", sortOrder: 1 },
  { id: "img_009", productId: "prod_008", url: imageUrl, publicId: "products/img9", sortOrder: 0 },
  { id: "img_010", productId: "prod_010", url: imageUrl, publicId: "products/img10", sortOrder: 0 },
  { id: "img_011", productId: "prod_012", url: imageUrl, publicId: "products/img11", sortOrder: 0 },
  { id: "img_012", productId: "prod_012", url: imageUrl, publicId: "products/img12", sortOrder: 1 },
  { id: "img_013", productId: "prod_014", url: imageUrl, publicId: "products/img13", sortOrder: 0 },
  { id: "img_014", productId: "prod_015", url: imageUrl, publicId: "products/img14", sortOrder: 0 },
  { id: "img_015", productId: "prod_009", url: imageUrl, publicId: "products/img15", sortOrder: 0 },
  { id: "img_016", productId: "prod_009", url: imageUrl, publicId: "products/img16", sortOrder: 1 },
  { id: "img_017", productId: "prod_005", url: imageUrl, publicId: "products/img17", sortOrder: 0 },
  { id: "img_018", productId: "prod_006", url: imageUrl, publicId: "products/img18", sortOrder: 0 },
  { id: "img_019", productId: "prod_011", url: imageUrl, publicId: "products/img19", sortOrder: 0 },
  { id: "img_020", productId: "prod_013", url: imageUrl, publicId: "products/img20", sortOrder: 0 }
];

const productVariants = [
  // Mattress Variants
  { id: "var_001", productId: "prod_001", mrp: 899.99, salePrice: 699.99, isDefault: true, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.SINGLE, width: 38, length: 75, thickness: 10, firmness: Firmness.MEDIUM_SOFT, recommendedAgeGroups: [AgeGroup.TEEN], recommendedWeightGroups: [WeightGroup.UNDER_60, WeightGroup.KG_60_80], recommendedPositions: [SleepingPosition.BACK, SleepingPosition.COMBINATION], comfortLevel: ComfortLevel.BALANCED, healthBenefits: [HealthBenefit.PRESSURE_RELIEF, HealthBenefit.COOLING] } },
  { id: "var_002", productId: "prod_001", mrp: 1299.99, salePrice: 999.99, isDefault: false, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.QUEEN, width: 60, length: 80, thickness: 12, firmness: Firmness.MEDIUM, recommendedAgeGroups: [AgeGroup.ADULT], recommendedWeightGroups: [WeightGroup.KG_60_80, WeightGroup.KG_80_100], recommendedPositions: [SleepingPosition.SIDE, SleepingPosition.BACK], comfortLevel: ComfortLevel.BALANCED, healthBenefits: [HealthBenefit.PRESSURE_RELIEF, HealthBenefit.MOTION_ISOLATION] } },
  { id: "var_003", productId: "prod_001", mrp: 1599.99, salePrice: 1299.99, isDefault: false, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.KING, width: 76, length: 80, thickness: 12, firmness: Firmness.MEDIUM_FIRM, recommendedAgeGroups: [AgeGroup.ADULT], recommendedWeightGroups: [WeightGroup.KG_80_100, WeightGroup.OVER_100], recommendedPositions: [SleepingPosition.BACK, SleepingPosition.STOMACH], comfortLevel: ComfortLevel.SUPPORTIVE, healthBenefits: [HealthBenefit.BACK_PAIN_RELIEF, HealthBenefit.ORTHOPEDIC] } },
  { id: "var_004", productId: "prod_002", mrp: 1399.99, salePrice: 1099.99, isDefault: true, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.QUEEN, width: 60, length: 80, thickness: 10, firmness: Firmness.FIRM, recommendedAgeGroups: [AgeGroup.ADULT, AgeGroup.SENIOR], recommendedWeightGroups: [WeightGroup.KG_60_80, WeightGroup.KG_80_100, WeightGroup.OVER_100], recommendedPositions: [SleepingPosition.BACK], comfortLevel: ComfortLevel.SUPPORTIVE, healthBenefits: [HealthBenefit.ORTHOPEDIC, HealthBenefit.BACK_PAIN_RELIEF] } },
  { id: "var_005", productId: "prod_002", mrp: 1699.99, salePrice: 1399.99, isDefault: false, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.KING, width: 76, length: 80, thickness: 12, firmness: Firmness.FIRM, recommendedAgeGroups: [AgeGroup.ADULT, AgeGroup.SENIOR], recommendedWeightGroups: [WeightGroup.KG_80_100, WeightGroup.OVER_100], recommendedPositions: [SleepingPosition.BACK, SleepingPosition.STOMACH], comfortLevel: ComfortLevel.SUPPORTIVE, healthBenefits: [HealthBenefit.ORTHOPEDIC, HealthBenefit.BACK_PAIN_RELIEF, HealthBenefit.PRESSURE_RELIEF] } },
  { id: "var_006", productId: "prod_003", mrp: 699.99, salePrice: 549.99, isDefault: true, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.SINGLE, width: 38, length: 75, thickness: 8, firmness: Firmness.MEDIUM_SOFT, recommendedAgeGroups: [AgeGroup.KIDS, AgeGroup.TEEN], recommendedWeightGroups: [WeightGroup.UNDER_60], recommendedPositions: [SleepingPosition.SIDE, SleepingPosition.COMBINATION], comfortLevel: ComfortLevel.PLUSH, healthBenefits: [HealthBenefit.COOLING] } },
  { id: "var_007", productId: "prod_003", mrp: 999.99, salePrice: 799.99, isDefault: false, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.QUEEN, width: 60, length: 80, thickness: 10, firmness: Firmness.MEDIUM, recommendedAgeGroups: [AgeGroup.ADULT], recommendedWeightGroups: [WeightGroup.KG_60_80], recommendedPositions: [SleepingPosition.BACK, SleepingPosition.SIDE], comfortLevel: ComfortLevel.BALANCED, healthBenefits: [HealthBenefit.PRESSURE_RELIEF] } },
  { id: "var_008", productId: "prod_004", mrp: 1499.99, salePrice: 1199.99, isDefault: true, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.QUEEN, width: 60, length: 80, thickness: 14, firmness: Firmness.MEDIUM_SOFT, recommendedAgeGroups: [AgeGroup.ADULT], recommendedWeightGroups: [WeightGroup.KG_60_80, WeightGroup.KG_80_100], recommendedPositions: [SleepingPosition.SIDE], comfortLevel: ComfortLevel.PLUSH, healthBenefits: [HealthBenefit.PRESSURE_RELIEF, HealthBenefit.MOTION_ISOLATION] } },
  { id: "var_009", productId: "prod_004", mrp: 1899.99, salePrice: 1599.99, isDefault: false, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.KING, width: 76, length: 80, thickness: 14, firmness: Firmness.MEDIUM_SOFT, recommendedAgeGroups: [AgeGroup.ADULT, AgeGroup.SENIOR], recommendedWeightGroups: [WeightGroup.KG_80_100], recommendedPositions: [SleepingPosition.SIDE, SleepingPosition.COMBINATION], comfortLevel: ComfortLevel.PLUSH, healthBenefits: [HealthBenefit.PRESSURE_RELIEF, HealthBenefit.MOTION_ISOLATION, HealthBenefit.COOLING] } },
  { id: "var_010", productId: "prod_005", mrp: 1099.99, salePrice: 899.99, isDefault: true, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.QUEEN, width: 60, length: 80, thickness: 10, firmness: Firmness.FIRM, recommendedAgeGroups: [AgeGroup.ADULT, AgeGroup.SENIOR], recommendedWeightGroups: [WeightGroup.KG_60_80, WeightGroup.KG_80_100, WeightGroup.OVER_100], recommendedPositions: [SleepingPosition.BACK], comfortLevel: ComfortLevel.SUPPORTIVE, healthBenefits: [HealthBenefit.BACK_PAIN_RELIEF, HealthBenefit.ORTHOPEDIC] } },
  { id: "var_011", productId: "prod_006", mrp: 399.99, salePrice: 299.99, isDefault: true, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.SINGLE, width: 38, length: 75, thickness: 6, firmness: Firmness.MEDIUM, recommendedAgeGroups: [AgeGroup.KIDS, AgeGroup.TEEN, AgeGroup.ADULT], recommendedWeightGroups: [WeightGroup.UNDER_60, WeightGroup.KG_60_80], recommendedPositions: [SleepingPosition.BACK, SleepingPosition.COMBINATION], comfortLevel: ComfortLevel.BALANCED, healthBenefits: [] } },
  { id: "var_012", productId: "prod_011", mrp: 499.99, salePrice: 399.99, isDefault: true, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.SINGLE, width: 38, length: 75, thickness: 6, firmness: Firmness.MEDIUM_SOFT, recommendedAgeGroups: [AgeGroup.KIDS, AgeGroup.TEEN], recommendedWeightGroups: [WeightGroup.UNDER_60], recommendedPositions: [SleepingPosition.BACK, SleepingPosition.SIDE], comfortLevel: ComfortLevel.PLUSH, healthBenefits: [HealthBenefit.PRESSURE_RELIEF] } },
  { id: "var_013", productId: "prod_011", mrp: 699.99, salePrice: 549.99, isDefault: false, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.DOUBLE, width: 54, length: 75, thickness: 8, firmness: Firmness.MEDIUM, recommendedAgeGroups: [AgeGroup.TEEN, AgeGroup.ADULT], recommendedWeightGroups: [WeightGroup.KG_60_80], recommendedPositions: [SleepingPosition.BACK], comfortLevel: ComfortLevel.BALANCED, healthBenefits: [] } },
  { id: "var_014", productId: "prod_012", mrp: 1199.99, salePrice: 949.99, isDefault: true, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.QUEEN, width: 60, length: 80, thickness: 10, firmness: Firmness.MEDIUM, recommendedAgeGroups: [AgeGroup.ADULT], recommendedWeightGroups: [WeightGroup.KG_60_80, WeightGroup.KG_80_100], recommendedPositions: [SleepingPosition.SIDE, SleepingPosition.BACK], comfortLevel: ComfortLevel.BALANCED, healthBenefits: [HealthBenefit.COOLING] } },
  { id: "var_015", productId: "prod_012", mrp: 1499.99, salePrice: 1199.99, isDefault: false, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.KING, width: 76, length: 80, thickness: 12, firmness: Firmness.MEDIUM, recommendedAgeGroups: [AgeGroup.ADULT, AgeGroup.SENIOR], recommendedWeightGroups: [WeightGroup.KG_80_100], recommendedPositions: [SleepingPosition.SIDE, SleepingPosition.BACK, SleepingPosition.COMBINATION], comfortLevel: ComfortLevel.BALANCED, healthBenefits: [HealthBenefit.COOLING, HealthBenefit.MOTION_ISOLATION] } },
  { id: "var_016", productId: "prod_014", mrp: 1299.99, salePrice: 1049.99, isDefault: true, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.QUEEN, width: 60, length: 80, thickness: 12, firmness: Firmness.MEDIUM_FIRM, recommendedAgeGroups: [AgeGroup.ADULT], recommendedWeightGroups: [WeightGroup.KG_60_80, WeightGroup.KG_80_100], recommendedPositions: [SleepingPosition.BACK, SleepingPosition.STOMACH], comfortLevel: ComfortLevel.SUPPORTIVE, healthBenefits: [HealthBenefit.BACK_PAIN_RELIEF, HealthBenefit.PRESSURE_RELIEF] } },
  { id: "var_017", productId: "prod_014", mrp: 1599.99, salePrice: 1349.99, isDefault: false, type: ProductType.MATTRESS, mattressData: { sizeName: MattressSize.KING, width: 76, length: 80, thickness: 12, firmness: Firmness.MEDIUM_FIRM, recommendedAgeGroups: [AgeGroup.ADULT, AgeGroup.SENIOR], recommendedWeightGroups: [WeightGroup.KG_80_100, WeightGroup.OVER_100], recommendedPositions: [SleepingPosition.BACK], comfortLevel: ComfortLevel.SUPPORTIVE, healthBenefits: [HealthBenefit.ORTHOPEDIC, HealthBenefit.BACK_PAIN_RELIEF] } },
  // Sofa Variants
  { id: "var_018", productId: "prod_007", mrp: 899.99, salePrice: 749.99, isDefault: true, type: ProductType.SOFA, sofaData: { seatCount: 2, material: "Velvet", shape: "Straight" } },
  { id: "var_019", productId: "prod_007", mrp: 1199.99, salePrice: 999.99, isDefault: false, type: ProductType.SOFA, sofaData: { seatCount: 3, material: "Velvet", shape: "Straight" } },
  { id: "var_020", productId: "prod_008", mrp: 1499.99, salePrice: 1299.99, isDefault: true, type: ProductType.SOFA, sofaData: { seatCount: 4, material: "Fabric", shape: "L-Shape" } },
  { id: "var_021", productId: "prod_008", mrp: 1699.99, salePrice: 1449.99, isDefault: false, type: ProductType.SOFA, sofaData: { seatCount: 5, material: "Performance Fabric", shape: "U-Shape" } },
  { id: "var_022", productId: "prod_009", mrp: 1299.99, salePrice: 1099.99, isDefault: true, type: ProductType.SOFA, sofaData: { seatCount: 2, material: "Leather", shape: "Straight" } },
  { id: "var_023", productId: "prod_009", mrp: 1699.99, salePrice: 1449.99, isDefault: false, type: ProductType.SOFA, sofaData: { seatCount: 3, material: "Leather", shape: "Straight" } },
  { id: "var_024", productId: "prod_010", mrp: 999.99, salePrice: 849.99, isDefault: true, type: ProductType.SOFA, sofaData: { seatCount: 2, material: "Linen", shape: "Recliner" } },
  { id: "var_025", productId: "prod_010", mrp: 1399.99, salePrice: 1199.99, isDefault: false, type: ProductType.SOFA, sofaData: { seatCount: 3, material: "Linen", shape: "Recliner" } },
  { id: "var_026", productId: "prod_013", mrp: 799.99, salePrice: 649.99, isDefault: true, type: ProductType.SOFA, sofaData: { seatCount: 2, material: "Wool Blend", shape: "Straight" } },
  { id: "var_027", productId: "prod_013", mrp: 1049.99, salePrice: 899.99, isDefault: false, type: ProductType.SOFA, sofaData: { seatCount: 3, material: "Wool Blend", shape: "Straight" } },
  { id: "var_028", productId: "prod_015", mrp: 1499.99, salePrice: 1299.99, isDefault: true, type: ProductType.SOFA, sofaData: { seatCount: 2, material: "Genuine Leather", shape: "Straight" } },
  { id: "var_029", productId: "prod_015", mrp: 1999.99, salePrice: 1749.99, isDefault: false, type: ProductType.SOFA, sofaData: { seatCount: 3, material: "Genuine Leather", shape: "Straight" } },
  { id: "var_030", productId: "prod_015", mrp: 2499.99, salePrice: 2199.99, isDefault: false, type: ProductType.SOFA, sofaData: { seatCount: 4, material: "Genuine Leather", shape: "Curved" } }
];

const specifications = [
  { id: "spec_001", productId: "prod_001", label: "Material", value: "Memory Foam" },
  { id: "spec_002", productId: "prod_001", label: "Warranty", value: "10 Years" },
  { id: "spec_003", productId: "prod_001", label: "Trial Period", value: "100 Nights" },
  { id: "spec_004", productId: "prod_002", label: "Material", value: "Latex + Memory Foam" },
  { id: "spec_005", productId: "prod_002", label: "Orthopedic Grade", value: "Premium" },
  { id: "spec_006", productId: "prod_003", label: "Material", value: "Organic Cotton + Natural Latex" },
  { id: "spec_007", productId: "prod_003", label: "Certification", value: "GOTS, GOLS" },
  { id: "spec_008", productId: "prod_007", label: "Frame Material", value: "Solid Wood" },
  { id: "spec_009", productId: "prod_007", label: "Cushion Fill", value: "High-Density Foam" },
  { id: "spec_010", productId: "prod_008", label: "Configuration", value: "Modular" },
  { id: "spec_011", productId: "prod_008", label: "Storage", value: "Chaise Storage" },
  { id: "spec_012", productId: "prod_009", label: "Leather Type", value: "Top Grain" },
  { id: "spec_013", productId: "prod_009", label: "Tufting", value: "Button Tufted" },
  { id: "spec_014", productId: "prod_010", label: "Recline Type", value: "Power Recline" },
  { id: "spec_015", productId: "prod_010", label: "Features", value: "USB Ports, Cup Holders" },
  { id: "spec_016", productId: "prod_012", label: "Cooling Technology", value: "Phase Change Material" },
  { id: "spec_017", productId: "prod_012", label: "Cover", value: "Bamboo Rayon" },
  { id: "spec_018", productId: "prod_014", label: "Coil Count", value: "1000+ Pocket Springs" },
  { id: "spec_019", productId: "prod_014", label: "Foam Layers", value: "5-Zone Support" },
  { id: "spec_020", productId: "prod_015", label: "Leather Finish", value: "Vintage Pull-Up" }
];

const sections = [
  { id: "sec_001", productId: "prod_001", type: "overview", content: { title: "Overview", description: "Experience cloud-like comfort with our premium memory foam mattress", features: ["Cooling gel", "Pressure relief", "Edge support"] }, sortOrder: 0 },
  { id: "sec_002", productId: "prod_001", type: "technology", content: { title: "Advanced Technology", description: "Our proprietary foam technology adapts to your body", layers: ["Gel-infused foam", "Transition layer", "High-density base"] }, sortOrder: 1 },
  { id: "sec_003", productId: "prod_002", type: "benefits", content: { title: "Health Benefits", description: "Designed with orthopedists for optimal spinal alignment", benefits: ["Reduces back pain", "Improves posture", "Better sleep quality"] }, sortOrder: 0 },
  { id: "sec_004", productId: "prod_007", type: "dimensions", content: { title: "Dimensions", dimensions: { width: "78 inches", depth: "35 inches", height: "32 inches" } }, sortOrder: 0 },
  { id: "sec_005", productId: "prod_007", type: "care", content: { title: "Care Instructions", instructions: ["Professional cleaning only", "Rotate cushions monthly", "Avoid direct sunlight"] }, sortOrder: 1 },
  { id: "sec_006", productId: "prod_008", type: "assembly", content: { title: "Assembly Guide", difficulty: "Easy", time: "30 minutes", tools: ["Allen key included"] }, sortOrder: 0 },
  { id: "sec_007", productId: "prod_010", type: "features", content: { title: "Smart Features", features: ["USB charging ports", "Wireless charging pad", "Memory settings", "Lumbar support"] }, sortOrder: 0 },
  { id: "sec_008", productId: "prod_012", type: "cooling", content: { title: "Stay Cool Technology", technology: "Phase Change Material", benefits: ["Regulates temperature", "Wicks away moisture", "Breathable design"] }, sortOrder: 0 },
  { id: "sec_009", productId: "prod_014", type: "construction", content: { title: "Hybrid Construction", layers: ["Cooling cover", "Memory foam", "Pocket coils", "Base foam"], gauge: "15 gauge coils" }, sortOrder: 0 },
  { id: "sec_010", productId: "prod_003", type: "sustainability", content: { title: "Eco-Friendly", certifications: ["GOTS Certified", "GOLS Certified", "GREENGUARD Gold"], materials: ["Organic cotton", "Natural latex", "Recycled steel"] }, sortOrder: 0 },
  { id: "sec_011", productId: "prod_004", type: "luxury", content: { title: "Luxury Features", features: ["Euro top", "Cashmere blend cover", "Hand-tufted", "Diamond quilting"] }, sortOrder: 0 },
  { id: "sec_012", productId: "prod_009", type: "heritage", content: { title: "Chesterfield Heritage", history: "Inspired by 18th-century British design", details: ["Deep button tufting", "Rolled arms", "Nailhead trim", "Tight back"] }, sortOrder: 0 },
  { id: "sec_013", productId: "prod_005", type: "medical", content: { title: "Medical Endorsement", endorsedBy: "American Chiropractic Association", studies: ["Reduces pressure points by 40%", "Improves spinal alignment by 65%"] }, sortOrder: 0 },
  { id: "sec_014", productId: "prod_011", type: "kids", content: { title: "Perfect for Kids", safety: ["Hypoallergenic", "Flame resistant", "Non-toxic materials"], features: ["Waterproof layer", "Stain resistant", "Easy to clean"] }, sortOrder: 0 },
  { id: "sec_015", productId: "prod_013", type: "design", content: { title: "Scandinavian Design", philosophy: "Form follows function", elements: ["Clean lines", "Natural materials", "Minimalist aesthetic", "Functional comfort"] }, sortOrder: 0 }
];

const faqs = [
  { id: "faq_001", productId: "prod_001", question: "How long does it take to expand?", answer: "Your mattress will fully expand within 24-48 hours after opening.", sortOrder: 0 },
  { id: "faq_002", productId: "prod_001", question: "Is it good for back pain?", answer: "Yes, our medium-soft firmness provides excellent pressure relief while maintaining proper spinal alignment.", sortOrder: 1 },
  { id: "faq_003", productId: "prod_001", question: "What's the return policy?", answer: "We offer a 100-night trial period with full refund if not satisfied.", sortOrder: 2 },
  { id: "faq_004", productId: "prod_002", question: "Is this mattress good for side sleepers?", answer: "Yes, the firm support actually helps side sleepers maintain proper alignment.", sortOrder: 0 },
  { id: "faq_005", productId: "prod_002", question: "Does it require a box spring?", answer: "No, it works on any solid foundation, slatted base, or adjustable bed.", sortOrder: 1 },
  { id: "faq_006", productId: "prod_007", question: "Is the velvet fabric pet-friendly?", answer: "The velvet is durable and stain-resistant, making it suitable for pets.", sortOrder: 0 },
  { id: "faq_007", productId: "prod_007", question: "What's the weight capacity?", answer: "Each seat can support up to 300 lbs.", sortOrder: 1 },
  { id: "faq_008", productId: "prod_008", question: "Can I change the configuration?", answer: "Yes, the modular design allows you to rearrange the sections.", sortOrder: 0 },
  { id: "faq_009", productId: "prod_008", question: "Are the cushions reversible?", answer: "Yes, all seat cushions are reversible for even wear.", sortOrder: 1 },
  { id: "faq_010", productId: "prod_009", question: "How to clean leather?", answer: "Use a damp cloth for spills and leather conditioner every 6 months.", sortOrder: 0 },
  { id: "faq_011", productId: "prod_010", question: "Does it require assembly?", answer: "Minimal assembly required - just attach the legs and plug in.", sortOrder: 0 },
  { id: "faq_012", productId: "prod_010", question: "Is there a warranty on electronics?", answer: "3-year warranty on all electronic components.", sortOrder: 1 },
  { id: "faq_013", productId: "prod_003", question: "Is it truly organic?", answer: "Yes, certified organic by GOTS and GOLS standards.", sortOrder: 0 },
  { id: "faq_014", productId: "prod_004", question: "Does it sleep hot?", answer: "No, the gel-infused foam and breathable cover keep you cool.", sortOrder: 0 },
  { id: "faq_015", productId: "prod_005", question: "How firm is firm?", answer: "Rating 7.5/10 on firmness scale - ideal for back and stomach sleepers.", sortOrder: 0 },
  { id: "faq_016", productId: "prod_011", question: "Is it safe for toddlers?", answer: "Yes, made with non-toxic materials and meets all safety standards.", sortOrder: 0 },
  { id: "faq_017", productId: "prod_012", question: "How does the cooling work?", answer: "Phase change material absorbs and releases heat to maintain optimal temperature.", sortOrder: 0 },
  { id: "faq_018", productId: "prod_013", question: "Are the legs removable?", answer: "Yes, legs screw off for easy moving and cleaning.", sortOrder: 0 },
  { id: "faq_019", productId: "prod_014", question: "What's the difference from all-foam?", answer: "Hybrid provides better edge support, airflow, and bounce.", sortOrder: 0 },
  { id: "faq_020", productId: "prod_015", question: "Will leather crack over time?", answer: "With proper care (conditioning every 6 months), it will last 10+ years.", sortOrder: 0 },
  { id: "faq_021", productId: "prod_006", question: "What's included?", answer: "Mattress only (box spring/foundation sold separately).", sortOrder: 0 },
  { id: "faq_022", productId: "prod_006", question: "Delivery time?", answer: "Standard delivery within 5-7 business days.", sortOrder: 1 },
  { id: "faq_023", productId: "prod_013", question: "What colors available?", answer: "Grey, beige, navy blue, and forest green.", sortOrder: 1 },
  { id: "faq_024", productId: "prod_002", question: "Does it motion isolate?", answer: "Excellent motion isolation - perfect for couples.", sortOrder: 2 },
  { id: "faq_025", productId: "prod_014", question: "Can I use with adjustable base?", answer: "Yes, fully compatible with adjustable bed frames.", sortOrder: 1 }
];

const users = [
  { id: "user_001", name: "Admin User", email: "admin@example.com", password: "hashed_pwd_001", role: UserRole.SUPER_ADMIN, isActive: true },
  { id: "user_002", name: "John Doe", email: "john@example.com", password: "hashed_pwd_002", role: UserRole.CUSTOMER, isActive: true },
  { id: "user_003", name: "Jane Smith", email: "jane@example.com", password: "hashed_pwd_003", role: UserRole.CUSTOMER, isActive: true },
  { id: "user_004", name: "Mike Johnson", email: "mike@example.com", password: "hashed_pwd_004", role: UserRole.CUSTOMER, isActive: false },
  { id: "user_005", name: "Sarah Williams", email: "sarah@example.com", password: "hashed_pwd_005", role: UserRole.CUSTOMER, isActive: true },
  { id: "user_006", name: "David Brown", email: "david@example.com", password: "hashed_pwd_006", role: UserRole.CUSTOMER, isActive: true },
  { id: "user_007", name: "Emily Davis", email: "emily@example.com", password: "hashed_pwd_007", role: UserRole.CUSTOMER, isActive: true },
  { id: "user_008", name: "Chris Wilson", email: "chris@example.com", password: "hashed_pwd_008", role: UserRole.CUSTOMER, isActive: false },
  { id: "user_009", name: "Amanda Taylor", email: "amanda@example.com", password: "hashed_pwd_009", role: UserRole.CUSTOMER, isActive: true },
  { id: "user_010", name: "Robert Martinez", email: "robert@example.com", password: "hashed_pwd_010", role: UserRole.CUSTOMER, isActive: true }
];

const orders = [
  { id: "ord_001", orderNumber: "ORD-1001", customerId: "user_002", status: OrderStatus.DELIVERED, subTotal: 999.99, discountTotal: 0, shippingTotal: 0, totalAmount: 999.99, shippingAddress: { fullName: "John Doe", phone: "212-555-0101", addressLine1: "123 Main St", city: "New York", state: "NY", postalCode: "10001", country: "US" }, notes: "Leave at front door" },
  { id: "ord_002", orderNumber: "ORD-1002", customerId: "user_003", status: OrderStatus.CONFIRMED, subTotal: 1299.99, discountTotal: 0, shippingTotal: 0, totalAmount: 1299.99, shippingAddress: { fullName: "Jane Smith", phone: "310-555-0202", addressLine1: "456 Oak Ave", city: "Los Angeles", state: "CA", postalCode: "90001", country: "US" }, notes: "Call upon arrival" },
  { id: "ord_003", orderNumber: "ORD-1003", customerId: "user_005", status: OrderStatus.PROCESSING, subTotal: 749.99, discountTotal: 0, shippingTotal: 0, totalAmount: 749.99, shippingAddress: { fullName: "Sarah Williams", phone: "312-555-0303", addressLine1: "789 Pine Rd", city: "Chicago", state: "IL", postalCode: "60601", country: "US" }, notes: null },
  { id: "ord_004", orderNumber: "ORD-1004", customerId: "user_006", status: OrderStatus.SHIPPED, subTotal: 1749.99, discountTotal: 0, shippingTotal: 0, totalAmount: 1749.99, shippingAddress: { fullName: "David Brown", phone: "713-555-0404", addressLine1: "321 Elm St", city: "Houston", state: "TX", postalCode: "77001", country: "US" }, notes: "Ring doorbell" },
  { id: "ord_005", orderNumber: "ORD-1005", customerId: "user_007", status: OrderStatus.PENDING_PAYMENT, subTotal: 649.99, discountTotal: 0, shippingTotal: 0, totalAmount: 649.99, shippingAddress: { fullName: "Emily Davis", phone: "602-555-0505", addressLine1: "654 Maple Dr", city: "Phoenix", state: "AZ", postalCode: "85001", country: "US" }, notes: "Weekend delivery preferred" },
  { id: "ord_006", orderNumber: "ORD-1006", customerId: "user_009", status: OrderStatus.CANCELLED, subTotal: 1199.99, discountTotal: 0, shippingTotal: 0, totalAmount: 1199.99, shippingAddress: { fullName: "Amanda Taylor", phone: "215-555-0606", addressLine1: "987 Cedar Ln", city: "Philadelphia", state: "PA", postalCode: "19101", country: "US" }, notes: "Customer requested cancellation" },
  { id: "ord_007", orderNumber: "ORD-1007", customerId: "user_002", status: OrderStatus.DELIVERED, subTotal: 849.99, discountTotal: 0, shippingTotal: 0, totalAmount: 849.99, shippingAddress: { fullName: "John Doe", phone: "212-555-0101", addressLine1: "123 Main St", city: "New York", state: "NY", postalCode: "10001", country: "US" }, notes: null },
  { id: "ord_008", orderNumber: "ORD-1008", customerId: "user_003", status: OrderStatus.CONFIRMED, subTotal: 2199.99, discountTotal: 0, shippingTotal: 0, totalAmount: 2199.99, shippingAddress: { fullName: "Jane Smith", phone: "310-555-0202", addressLine1: "456 Oak Ave", city: "Los Angeles", state: "CA", postalCode: "90001", country: "US" }, notes: "Include gift receipt" },
  { id: "ord_009", orderNumber: "ORD-1009", customerId: "user_005", status: OrderStatus.PROCESSING, subTotal: 549.99, discountTotal: 0, shippingTotal: 0, totalAmount: 549.99, shippingAddress: { fullName: "Sarah Williams", phone: "312-555-0303", addressLine1: "789 Pine Rd", city: "Chicago", state: "IL", postalCode: "60601", country: "US" }, notes: "Apartment 3B" },
  { id: "ord_010", orderNumber: "ORD-1010", customerId: "user_006", status: OrderStatus.DELIVERED, subTotal: 1349.99, discountTotal: 0, shippingTotal: 0, totalAmount: 1349.99, shippingAddress: { fullName: "David Brown", phone: "713-555-0404", addressLine1: "321 Elm St", city: "Houston", state: "TX", postalCode: "77001", country: "US" }, notes: "Thanks!" },
  { id: "ord_011", orderNumber: "ORD-1011", customerId: "user_007", status: OrderStatus.PENDING_PAYMENT, subTotal: 1049.99, discountTotal: 0, shippingTotal: 0, totalAmount: 1049.99, shippingAddress: { fullName: "Emily Davis", phone: "602-555-0505", addressLine1: "654 Maple Dr", city: "Phoenix", state: "AZ", postalCode: "85001", country: "US" }, notes: "Will pay cash" },
  { id: "ord_012", orderNumber: "ORD-1012", customerId: "user_009", status: OrderStatus.SHIPPED, subTotal: 1199.99, discountTotal: 0, shippingTotal: 0, totalAmount: 1199.99, shippingAddress: { fullName: "Amanda Taylor", phone: "215-555-0606", addressLine1: "987 Cedar Ln", city: "Philadelphia", state: "PA", postalCode: "19101", country: "US" }, notes: "Leave with concierge" },
  { id: "ord_013", orderNumber: "ORD-1013", customerId: "user_002", status: OrderStatus.DELIVERED, subTotal: 1599.99, discountTotal: 0, shippingTotal: 0, totalAmount: 1599.99, shippingAddress: { fullName: "John Doe", phone: "212-555-0101", addressLine1: "123 Main St", city: "New York", state: "NY", postalCode: "10001", country: "US" }, notes: null },
  { id: "ord_014", orderNumber: "ORD-1014", customerId: "user_003", status: OrderStatus.CANCELLED, subTotal: 799.99, discountTotal: 0, shippingTotal: 0, totalAmount: 799.99, shippingAddress: { fullName: "Jane Smith", phone: "310-555-0202", addressLine1: "456 Oak Ave", city: "Los Angeles", state: "CA", postalCode: "90001", country: "US" }, notes: "Ordered wrong item" },
  { id: "ord_015", orderNumber: "ORD-1015", customerId: "user_005", status: OrderStatus.CONFIRMED, subTotal: 1899.99, discountTotal: 0, shippingTotal: 0, totalAmount: 1899.99, shippingAddress: { fullName: "Sarah Williams", phone: "312-555-0303", addressLine1: "789 Pine Rd", city: "Chicago", state: "IL", postalCode: "60601", country: "US" }, notes: "Need delivery by Friday" },
  { id: "ord_016", orderNumber: "ORD-1016", customerId: "user_006", status: OrderStatus.PROCESSING, subTotal: 399.99, discountTotal: 0, shippingTotal: 0, totalAmount: 399.99, shippingAddress: { fullName: "David Brown", phone: "713-555-0404", addressLine1: "321 Elm St", city: "Houston", state: "TX", postalCode: "77001", country: "US" }, notes: null },
  { id: "ord_017", orderNumber: "ORD-1017", customerId: "user_007", status: OrderStatus.DELIVERED, subTotal: 1399.99, discountTotal: 0, shippingTotal: 0, totalAmount: 1399.99, shippingAddress: { fullName: "Emily Davis", phone: "602-555-0505", addressLine1: "654 Maple Dr", city: "Phoenix", state: "AZ", postalCode: "85001", country: "US" }, notes: "Great product!" },
  { id: "ord_018", orderNumber: "ORD-1018", customerId: "user_009", status: OrderStatus.PENDING_PAYMENT, subTotal: 2999.99, discountTotal: 0, shippingTotal: 0, totalAmount: 2999.99, shippingAddress: { fullName: "Amanda Taylor", phone: "215-555-0606", addressLine1: "987 Cedar Ln", city: "Philadelphia", state: "PA", postalCode: "19101", country: "US" }, notes: "Multiple items order" },
  { id: "ord_019", orderNumber: "ORD-1019", customerId: "user_002", status: OrderStatus.DELIVERED, subTotal: 449.99, discountTotal: 0, shippingTotal: 0, totalAmount: 449.99, shippingAddress: { fullName: "John Doe", phone: "212-555-0101", addressLine1: "123 Main St", city: "New York", state: "NY", postalCode: "10001", country: "US" }, notes: "Will reorder soon" },
  { id: "ord_020", orderNumber: "ORD-1020", customerId: "user_010", status: OrderStatus.CONFIRMED, subTotal: 1099.99, discountTotal: 0, shippingTotal: 0, totalAmount: 1099.99, shippingAddress: { fullName: "Robert Martinez", phone: "206-555-0707", addressLine1: "246 Birch St", city: "Seattle", state: "WA", postalCode: "98101", country: "US" }, notes: "First time customer" }
];

const orderItems = [
  { id: "oi_001", orderId: "ord_001", productId: "prod_001", variantId: "var_001", quantity: 1, productName: "Cloud Comfort Luxury Mattress", variantData: { size: "Twin", price: 699.99 }, price: 699.99 },
  { id: "oi_002", orderId: "ord_001", productId: "prod_007", variantId: "var_018", quantity: 1, productName: "LuxeCraft Velvet Sofa", variantData: { seats: 2, material: "Velvet" }, price: 749.99 },
  { id: "oi_003", orderId: "ord_002", productId: "prod_002", variantId: "var_004", quantity: 1, productName: "DreamRest Orthopedic Mattress", variantData: { size: "Queen", firmness: "Firm" }, price: 1099.99 },
  { id: "oi_004", orderId: "ord_003", productId: "prod_010", variantId: "var_024", quantity: 1, productName: "CozyLinen Recliner Sofa", variantData: { seats: 2, type: "Recliner" }, price: 849.99 },
  { id: "oi_005", orderId: "ord_004", productId: "prod_009", variantId: "var_022", quantity: 1, productName: "Heritage Chesterfield Sofa", variantData: { seats: 2, material: "Leather" }, price: 1099.99 },
  { id: "oi_006", orderId: "ord_004", productId: "prod_008", variantId: "var_020", quantity: 1, productName: "UrbanEdge Sectional Sofa", variantData: { seats: 4, shape: "L-Shape" }, price: 1299.99 },
  { id: "oi_007", orderId: "ord_005", productId: "prod_013", variantId: "var_026", quantity: 1, productName: "Minimalist Nordic Sofa", variantData: { seats: 2, material: "Wool Blend" }, price: 649.99 },
  { id: "oi_008", orderId: "ord_006", productId: "prod_004", variantId: "var_008", quantity: 1, productName: "Midnight Deluxe Mattress", variantData: { size: "Queen", firmness: "Medium Soft" }, price: 1199.99 },
  { id: "oi_009", orderId: "ord_007", productId: "prod_003", variantId: "var_006", quantity: 1, productName: "EcoGreen Natural Mattress", variantData: { size: "Twin" }, price: 549.99 },
  { id: "oi_010", orderId: "ord_007", productId: "prod_010", variantId: "var_024", quantity: 1, productName: "CozyLinen Recliner Sofa", variantData: { seats: 2 }, price: 849.99 },
  { id: "oi_011", orderId: "ord_008", productId: "prod_014", variantId: "var_016", quantity: 1, productName: "SleepTech Hybrid Mattress", variantData: { size: "Queen" }, price: 1049.99 },
  { id: "oi_012", orderId: "ord_008", productId: "prod_015", variantId: "var_028", quantity: 1, productName: "Vintage Leather Sofa", variantData: { seats: 2 }, price: 1299.99 },
  { id: "oi_013", orderId: "ord_009", productId: "prod_011", variantId: "var_012", quantity: 1, productName: "KidsDream Junior Mattress", variantData: { size: "Twin" }, price: 399.99 },
  { id: "oi_014", orderId: "ord_009", productId: "prod_003", variantId: "var_007", quantity: 1, productName: "EcoGreen Natural Mattress", variantData: { size: "Queen" }, price: 799.99 },
  { id: "oi_015", orderId: "ord_010", productId: "prod_001", variantId: "var_002", quantity: 1, productName: "Cloud Comfort Luxury Mattress", variantData: { size: "Queen" }, price: 999.99 },
  { id: "oi_016", orderId: "ord_010", productId: "prod_012", variantId: "var_014", quantity: 1, productName: "BambooBreeze Cooling Mattress", variantData: { size: "Queen" }, price: 949.99 },
  { id: "oi_017", orderId: "ord_011", productId: "prod_007", variantId: "var_019", quantity: 1, productName: "LuxeCraft Velvet Sofa", variantData: { seats: 3 }, price: 999.99 },
  { id: "oi_018", orderId: "ord_012", productId: "prod_002", variantId: "var_004", quantity: 1, productName: "DreamRest Orthopedic Mattress", variantData: { size: "Queen" }, price: 1099.99 },
  { id: "oi_019", orderId: "ord_013", productId: "prod_005", variantId: "var_010", quantity: 1, productName: "BackRelief Pro Mattress", variantData: { size: "Queen" }, price: 899.99 },
  { id: "oi_020", orderId: "ord_013", productId: "prod_008", variantId: "var_021", quantity: 1, productName: "UrbanEdge Sectional Sofa", variantData: { seats: 5 }, price: 1449.99 },
  { id: "oi_021", orderId: "ord_014", productId: "prod_013", variantId: "var_027", quantity: 1, productName: "Minimalist Nordic Sofa", variantData: { seats: 3 }, price: 899.99 },
  { id: "oi_022", orderId: "ord_015", productId: "prod_009", variantId: "var_023", quantity: 1, productName: "Heritage Chesterfield Sofa", variantData: { seats: 3 }, price: 1449.99 },
  { id: "oi_023", orderId: "ord_015", productId: "prod_014", variantId: "var_017", quantity: 1, productName: "SleepTech Hybrid Mattress", variantData: { size: "King" }, price: 1349.99 },
  { id: "oi_024", orderId: "ord_016", productId: "prod_006", variantId: "var_011", quantity: 1, productName: "ValueSleep Economy Mattress", variantData: { size: "Twin" }, price: 299.99 },
  { id: "oi_025", orderId: "ord_017", productId: "prod_004", variantId: "var_009", quantity: 1, productName: "Midnight Deluxe Mattress", variantData: { size: "King" }, price: 1599.99 },
  { id: "oi_026", orderId: "ord_018", productId: "prod_001", variantId: "var_003", quantity: 1, productName: "Cloud Comfort Luxury Mattress", variantData: { size: "King" }, price: 1299.99 },
  { id: "oi_027", orderId: "ord_018", productId: "prod_007", variantId: "var_018", quantity: 1, productName: "LuxeCraft Velvet Sofa", variantData: { seats: 2 }, price: 749.99 },
  { id: "oi_028", orderId: "ord_018", productId: "prod_010", variantId: "var_024", quantity: 1, productName: "CozyLinen Recliner Sofa", variantData: { seats: 2 }, price: 849.99 },
  { id: "oi_029", orderId: "ord_019", productId: "prod_011", variantId: "var_013", quantity: 1, productName: "KidsDream Junior Mattress", variantData: { size: "Full" }, price: 549.99 },
  { id: "oi_030", orderId: "ord_020", productId: "prod_012", variantId: "var_015", quantity: 1, productName: "BambooBreeze Cooling Mattress", variantData: { size: "King" }, price: 1199.99 }
];

async function main() {
  console.log("🌱 Seed started...");

  const adminPassword = await bcrypt.hash(adminSeed.password, 10);

  // Create admin user
//   await prisma.user.upsert({
//     where: { email: adminSeed.email },
//     update: {
//       name: adminSeed.name,
//       role: UserRole.SUPER_ADMIN,
//     },
//     create: {
//       name: adminSeed.name,
//       email: adminSeed.email,
//       password: adminPassword,
//       role: UserRole.SUPER_ADMIN,
//       isActive: true,
//     },
//   });

//   console.log("✅ Admin user ready");

  // Create categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
  console.log("✅ Categories ready");

  // Create products
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
  console.log("✅ Products ready");

  // Create product images
  for (const image of productImages) {
    await prisma.productImage.upsert({
      where: { id: image.id },
      update: image,
      create: image,
    });
  }
  console.log("✅ Product images ready");

  // Create product variants
  for (const variant of productVariants) {
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variant.id },
    });

    if (existingVariant) {
      await prisma.productVariant.update({
        where: { id: existingVariant.id },
        data: {
          mrp: variant.mrp,
          salePrice: variant.salePrice,
          isDefault: variant.isDefault,
        },
      });
    } else {
      const createdVariant = await prisma.productVariant.create({
        data: {
          id: variant.id,
          productId: variant.productId,
          mrp: variant.mrp,
          salePrice: variant.salePrice,
          isDefault: variant.isDefault,
        },
      });

      if (variant.type === ProductType.MATTRESS && variant.mattressData) {
        await prisma.mattressVariant.create({
          data: {
            id: `mv_${variant.id}`,
            variantId: createdVariant.id,
            sizeName: variant.mattressData.sizeName,
            width: variant.mattressData.width,
            length: variant.mattressData.length,
            thickness: variant.mattressData.thickness,
          },
        });
      } else if (variant.type === ProductType.SOFA && variant.sofaData) {
        await prisma.sofaVariant.create({
          data: {
            id: `sv_${variant.id}`,
            variantId: createdVariant.id,
            seatCount: variant.sofaData.seatCount,
            material: variant.sofaData.material,
            shape: variant.sofaData.shape,
          },
        });
      }
    }
  }
  console.log("✅ Product variants ready");

  // Create specifications
  for (const spec of specifications) {
    await prisma.productSpecification.upsert({
      where: { id: spec.id },
      update: spec,
      create: spec,
    });
  }
  console.log("✅ Specifications ready");

  // Create sections
  for (const section of sections) {
    await prisma.productSection.upsert({
      where: { id: section.id },
      update: section,
      create: section,
    });
  }
  console.log("✅ Sections ready");

  // Create FAQs
  for (const faq of faqs) {
    await prisma.productFaq.upsert({
      where: { id: faq.id },
      update: faq,
      create: faq,
    });
  }
  console.log("✅ FAQs ready");

  // Create users
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.role === "SUPER_ADMIN" ? new Date() : null,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        isActive: user.isActive,
      },
    });
  }
  console.log("✅ Users ready");

  // Create orders
  for (const order of orders) {
    await prisma.order.upsert({
      where: { id: order.id },
      update: {
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        status: order.status,
        subTotal: order.subTotal,
        discountTotal: order.discountTotal,
        shippingTotal: order.shippingTotal,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        notes: order.notes,
      },
      create: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        status: order.status,
        subTotal: order.subTotal,
        discountTotal: order.discountTotal,
        shippingTotal: order.shippingTotal,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        notes: order.notes,
      },
    });
  }
  console.log("✅ Orders ready");

  // Create order items
  for (const item of orderItems) {
    await prisma.orderItem.upsert({
      where: { id: item.id },
      update: {
        orderId: item.orderId,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        productName: item.productName,
        variantData: item.variantData,
        price: item.price,
      },
      create: {
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        productName: item.productName,
        variantData: item.variantData,
        price: item.price,
      },
    });
  }
  console.log("✅ Order items ready");

  console.log("🎉 Seed completed successfully");
  console.log("--------------------------------------");
  console.log(`Admin Email: ${adminSeed.email}`);
  console.log(`Products: ${products.length}`);
  console.log(`Variants: ${productVariants.length}`);
  console.log(`Orders: ${orders.length}`);
  console.log(`Users: ${users.length}`);
  console.log("--------------------------------------");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });