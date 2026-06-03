/*
  Warnings:

  - You are about to drop the column `recommendedWeightGroupss` on the `MattressVariant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MattressVariant" DROP COLUMN "recommendedWeightGroupss",
ADD COLUMN     "recommendedWeightGroups" "WeightGroup"[] DEFAULT ARRAY[]::"WeightGroup"[];
