/*
  Warnings:

  - You are about to drop the column `isOrthopedic` on the `MattressVariant` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "MattressVariant_isOrthopedic_idx";

-- AlterTable
ALTER TABLE "MattressVariant" DROP COLUMN "isOrthopedic";
