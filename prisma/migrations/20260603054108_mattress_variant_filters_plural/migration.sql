/*
  Warnings:

  - You are about to drop the column `recommendedAgeGroup` on the `MattressVariant` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedPosition` on the `MattressVariant` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedWeightGroup` on the `MattressVariant` table. All the data in the column will be lost.
  - Made the column `comfortLevel` on table `MattressVariant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MattressVariant" DROP COLUMN "recommendedAgeGroup",
DROP COLUMN "recommendedPosition",
DROP COLUMN "recommendedWeightGroup",
ADD COLUMN     "recommendedAgeGroups" "AgeGroup"[] DEFAULT ARRAY[]::"AgeGroup"[],
ADD COLUMN     "recommendedPositions" "SleepingPosition"[] DEFAULT ARRAY[]::"SleepingPosition"[],
ADD COLUMN     "recommendedWeightGroupss" "WeightGroup"[] DEFAULT ARRAY[]::"WeightGroup"[],
ALTER COLUMN "comfortLevel" SET NOT NULL;

-- CreateIndex
CREATE INDEX "MattressVariant_comfortLevel_idx" ON "MattressVariant"("comfortLevel");
