-- DropIndex
DROP INDEX "CartItem_userId_productId_variantId_key";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "customData" JSONB,
ADD COLUMN     "isCustom" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "allowCustomSize" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customSizePricing" JSONB,
ADD COLUMN     "maxLength" INTEGER,
ADD COLUMN     "maxWidth" INTEGER,
ADD COLUMN     "minLength" INTEGER,
ADD COLUMN     "minWidth" INTEGER;
