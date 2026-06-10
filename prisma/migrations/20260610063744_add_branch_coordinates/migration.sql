/*
  Warnings:

  - Made the column `state` on table `Branch` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "district" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "state" SET DEFAULT 'Tamil Nadu';
