-- CreateEnum
CREATE TYPE "CheckoutSource" AS ENUM ('CART', 'BUY_NOW');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "checkoutSource" "CheckoutSource" NOT NULL DEFAULT 'CART';
