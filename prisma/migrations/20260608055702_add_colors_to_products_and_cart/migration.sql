-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "color" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "color" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "availableColors" TEXT[] DEFAULT ARRAY[]::TEXT[];
