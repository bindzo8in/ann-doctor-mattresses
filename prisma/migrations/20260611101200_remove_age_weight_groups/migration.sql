/*
  Warnings:

  - You are about to drop the column `recommendedAgeGroups` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedWeightGroups` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "recommendedAgeGroups",
DROP COLUMN "recommendedWeightGroups";

-- DropEnum
DROP TYPE "AgeGroup";
-- DropEnum
DROP TYPE "WeightGroup";
