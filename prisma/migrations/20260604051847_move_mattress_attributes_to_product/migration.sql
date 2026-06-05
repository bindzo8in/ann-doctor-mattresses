-- DropIndex
DROP INDEX "MattressVariant_comfortLevel_idx";

-- DropIndex
DROP INDEX "MattressVariant_firmness_idx";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "comfortLevel" "ComfortLevel",
ADD COLUMN     "firmness" "Firmness",
ADD COLUMN     "healthBenefits" "HealthBenefit"[] DEFAULT ARRAY[]::"HealthBenefit"[],
ADD COLUMN     "recommendedAgeGroups" "AgeGroup"[] DEFAULT ARRAY[]::"AgeGroup"[],
ADD COLUMN     "recommendedPositions" "SleepingPosition"[] DEFAULT ARRAY[]::"SleepingPosition"[],
ADD COLUMN     "recommendedWeightGroups" "WeightGroup"[] DEFAULT ARRAY[]::"WeightGroup"[];

-- Copy data from MattressVariant to Product
UPDATE "Product" p
SET
  "firmness" = mv."firmness",
  "comfortLevel" = mv."comfortLevel",
  "healthBenefits" = mv."healthBenefits",
  "recommendedAgeGroups" = mv."recommendedAgeGroups",
  "recommendedPositions" = mv."recommendedPositions",
  "recommendedWeightGroups" = mv."recommendedWeightGroups"
FROM "ProductVariant" pv
JOIN "MattressVariant" mv ON pv."id" = mv."variantId"
WHERE p."id" = pv."productId";

-- Drop columns from MattressVariant
ALTER TABLE "MattressVariant" 
  DROP COLUMN "firmness",
  DROP COLUMN "comfortLevel",
  DROP COLUMN "healthBenefits",
  DROP COLUMN "recommendedAgeGroups",
  DROP COLUMN "recommendedPositions",
  DROP COLUMN "recommendedWeightGroups";
