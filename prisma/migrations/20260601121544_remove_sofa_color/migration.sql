/*
  Warnings:

  - You are about to alter the column `totalAmount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `price` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the column `images` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - Added the required column `productName` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantData` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnailPublicId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnailUrl` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('MATTRESS', 'SOFA');

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productName" TEXT NOT NULL,
ADD COLUMN     "variantData" JSONB NOT NULL,
ADD COLUMN     "variantId" TEXT,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "images",
DROP COLUMN "price",
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shortDescription" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "thumbnailPublicId" TEXT NOT NULL,
ADD COLUMN     "thumbnailUrl" TEXT NOT NULL,
ADD COLUMN     "type" "ProductType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "mrp" DECIMAL(10,2) NOT NULL,
    "salePrice" DECIMAL(10,2) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MattressVariant" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "sizeName" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "length" INTEGER NOT NULL,
    "thickness" INTEGER NOT NULL,

    CONSTRAINT "MattressVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SofaVariant" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "seatCount" INTEGER NOT NULL,
    "material" TEXT NOT NULL,
    "shape" TEXT,

    CONSTRAINT "SofaVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSpecification" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ProductSpecification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSection" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductFaq" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductFaq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "MattressVariant_variantId_key" ON "MattressVariant"("variantId");

-- CreateIndex
CREATE INDEX "MattressVariant_sizeName_idx" ON "MattressVariant"("sizeName");

-- CreateIndex
CREATE INDEX "MattressVariant_thickness_idx" ON "MattressVariant"("thickness");

-- CreateIndex
CREATE UNIQUE INDEX "SofaVariant_variantId_key" ON "SofaVariant"("variantId");

-- CreateIndex
CREATE INDEX "SofaVariant_seatCount_idx" ON "SofaVariant"("seatCount");

-- CreateIndex
CREATE INDEX "SofaVariant_material_idx" ON "SofaVariant"("material");

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MattressVariant" ADD CONSTRAINT "MattressVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SofaVariant" ADD CONSTRAINT "SofaVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpecification" ADD CONSTRAINT "ProductSpecification_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSection" ADD CONSTRAINT "ProductSection_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFaq" ADD CONSTRAINT "ProductFaq_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
