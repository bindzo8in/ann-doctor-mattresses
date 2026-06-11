import prisma from "@/lib/prisma";
import { cache } from "react";
import { unstable_cache } from "next/cache";
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
  thumbnailUrl: string | null;
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

export const getHeroBanners = unstable_cache(
  cache(async () => {
    const banners = await prisma.heroBanner.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return banners;
  }),
  ["hero-banners"],
  { revalidate: 3600, tags: ["banners"] }
);

export const getFeaturedProducts = unstable_cache(
  cache(async (limit = 8): Promise<HomeProduct[]> => {
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
  }),
  ["featured-products"],
  { revalidate: 3600, tags: ["products"] }
);

export const getNewLaunches = unstable_cache(
  cache(async (limit = 8): Promise<HomeProduct[]> => {
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
  }),
  ["new-launches"],
  { revalidate: 3600, tags: ["products"] }
);

export const getCategories = unstable_cache(
  cache(async (): Promise<HomeCategory[]> => {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: { where: { isActive: true } } } } },
      orderBy: { name: "asc" },
    });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      thumbnailUrl: c.thumbnailUrl,
      productCount: c._count.products,
    }));
  }),
  ["home-categories"],
  { revalidate: 3600, tags: ["categories"] }
);

export type HomeBranchGroup = {
  state: string;
  branches: Array<{
    id: string;
    district: string;
    address: string;
    phone: string | null;
    googleMapUrl: string | null;
    latitude: number | null;
    longitude: number | null;
    name: string
  }>;
};

export const getActiveBranchesGroupedByState = unstable_cache(
  cache(async (): Promise<HomeBranchGroup[]> => {
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      orderBy: [{ state: "desc" }, { name: "asc" }],
    });

    const grouped = branches.reduce((acc, branch) => {
      const state = (branch.state || "Other").toUpperCase() + " BRANCHES:";
      if (!acc[state]) {
        acc[state] = [];
      }
      acc[state].push({
        id: branch.id,
        district: (branch.district || branch.name).toUpperCase() + ":",
        address: branch.address || "",
        phone: branch.phone,
        googleMapUrl: branch.googleMapUrl,
        latitude: branch.latitude,
        longitude: branch.longitude,
        name: branch.name,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return Object.keys(grouped).map(state => ({
      state,
      branches: grouped[state]
    }));
  }),
  ["active-branches-grouped"],
  { revalidate: 3600, tags: ["branches"] }
);
