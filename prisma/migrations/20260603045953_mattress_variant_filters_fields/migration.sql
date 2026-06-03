/*
  Warnings:

  - Added the required column `firmness` to the `MattressVariant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Firmness" AS ENUM ('SOFT', 'MEDIUM_SOFT', 'MEDIUM', 'MEDIUM_FIRM', 'FIRM');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('KIDS', 'TEEN', 'ADULT', 'SENIOR');

-- CreateEnum
CREATE TYPE "WeightGroup" AS ENUM ('UNDER_60', 'KG_60_80', 'KG_80_100', 'OVER_100');

-- CreateEnum
CREATE TYPE "SleepingPosition" AS ENUM ('SIDE', 'BACK', 'STOMACH', 'COMBINATION');

-- CreateEnum
CREATE TYPE "ComfortLevel" AS ENUM ('PLUSH', 'BALANCED', 'SUPPORTIVE');

-- CreateEnum
CREATE TYPE "HealthBenefit" AS ENUM ('ORTHOPEDIC', 'BACK_PAIN_RELIEF', 'PRESSURE_RELIEF', 'COOLING', 'MOTION_ISOLATION');

-- AlterTable
ALTER TABLE "MattressVariant" ADD COLUMN     "comfortLevel" "ComfortLevel",
ADD COLUMN     "firmness" "Firmness" NOT NULL,
ADD COLUMN     "healthBenefits" "HealthBenefit"[] DEFAULT ARRAY[]::"HealthBenefit"[],
ADD COLUMN     "isOrthopedic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recommendedAgeGroup" "AgeGroup"[] DEFAULT ARRAY[]::"AgeGroup"[],
ADD COLUMN     "recommendedPosition" "SleepingPosition"[] DEFAULT ARRAY[]::"SleepingPosition"[],
ADD COLUMN     "recommendedWeightGroup" "WeightGroup"[] DEFAULT ARRAY[]::"WeightGroup"[];

-- CreateIndex
CREATE INDEX "MattressVariant_firmness_idx" ON "MattressVariant"("firmness");

-- CreateIndex
CREATE INDEX "MattressVariant_isOrthopedic_idx" ON "MattressVariant"("isOrthopedic");
