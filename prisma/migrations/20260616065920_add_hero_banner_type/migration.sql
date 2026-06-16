-- CreateEnum
CREATE TYPE "HeroBannerType" AS ENUM ('DYNAMIC', 'STATIC');

-- AlterTable
ALTER TABLE "HeroBanner" ADD COLUMN     "type" "HeroBannerType" NOT NULL DEFAULT 'DYNAMIC';
