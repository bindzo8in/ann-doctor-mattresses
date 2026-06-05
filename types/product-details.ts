import { Prisma } from "@/app/generated/prisma/browser";

export type ProductVariantWithDetails = Prisma.ProductVariantGetPayload<{
  include: {
    mattressVariant: true;
    sofaVariant: true;
  };
}>;

export type ProductDetails = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: { orderBy: { sortOrder: "asc" } };
    variants: {
      include: {
        mattressVariant: true;
        sofaVariant: true;
      };
      orderBy: { salePrice: "asc" };
    };
    specifications: true;
    sections: { orderBy: { sortOrder: "asc" } };
    faqs: { orderBy: { sortOrder: "asc" } };
  };
}>;

export type RelatedProduct = Prisma.ProductGetPayload<{
  include: {
    images: { orderBy: { sortOrder: "asc" }; take: 1 };
    variants: true;
  };
}>;
