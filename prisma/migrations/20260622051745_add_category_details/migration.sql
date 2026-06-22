-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "coverImagePublicId" TEXT,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "features" JSONB,
ADD COLUMN     "layerImagePublicId" TEXT,
ADD COLUMN     "layerImageUrl" TEXT;
