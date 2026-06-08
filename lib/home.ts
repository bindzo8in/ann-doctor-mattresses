import prisma from "@/lib/prisma";

export type HomeProduct = {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string;
  shortDescription: string[];
  isFeatured: boolean;
  createdAt: Date;
  category: { id: string; name: string; slug: string };
  variants: Array<{
    id: string;
    mrp: number;
    salePrice: number;
    isDefault: boolean;
  }>;
};

export type HomeCategory = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

function serializeProduct(p: any): HomeProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    thumbnailUrl: p.thumbnailUrl,
    shortDescription: p.shortDescription,
    isFeatured: p.isFeatured,
    createdAt: p.createdAt,
    category: p.category,
    variants: (p.variants || []).map((v: any) => ({
      id: v.id,
      mrp: Number(v.mrp),
      salePrice: Number(v.salePrice),
      isDefault: v.isDefault,
    })),
  };
}

export async function getHeroBanners() {
  const banners = await prisma.heroBanner.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  return banners;
}

export async function getFeaturedProducts(limit = 8): Promise<HomeProduct[]> {
  const products = await prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    take: limit,
    include: {
      category: true,
      variants: { orderBy: { salePrice: "asc" }, take: 1 },
    },
    orderBy: { featuredOrder: "asc" },
  });
  return products.map(serializeProduct);
}

export async function getNewLaunches(limit = 8): Promise<HomeProduct[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    take: limit,
    include: {
      category: true,
      variants: { orderBy: { salePrice: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
  return products.map(serializeProduct);
}

export async function getCategories(): Promise<HomeCategory[]> {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: { where: { isActive: true } } } } },
    orderBy: { name: "asc" },
  });
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c._count.products,
  }));
}
