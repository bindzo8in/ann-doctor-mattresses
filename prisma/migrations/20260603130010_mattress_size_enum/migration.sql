/*
  Warnings:

  - Changed the type of `sizeName` on the `MattressVariant` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MattressSize" AS ENUM ('SINGLE', 'DOUBLE', 'QUEEN', 'KING', 'CUSTOM');

-- Map existing string data to valid enum strings
UPDATE "MattressVariant" SET "sizeName" = 'SINGLE' WHERE "sizeName" IN ('Twin', 'Single');
UPDATE "MattressVariant" SET "sizeName" = 'DOUBLE' WHERE "sizeName" IN ('Full', 'Double');
UPDATE "MattressVariant" SET "sizeName" = 'QUEEN' WHERE "sizeName" = 'Queen';
UPDATE "MattressVariant" SET "sizeName" = 'KING' WHERE "sizeName" = 'King';
UPDATE "MattressVariant" SET "sizeName" = 'CUSTOM' WHERE "sizeName" = 'Custom';

-- AlterTable
ALTER TABLE "MattressVariant" ALTER COLUMN "sizeName" TYPE "MattressSize" USING ("sizeName"::text::"MattressSize");

-- Recreate Index
DROP INDEX IF EXISTS "MattressVariant_sizeName_idx";
CREATE INDEX "MattressVariant_sizeName_idx" ON "MattressVariant"("sizeName");
