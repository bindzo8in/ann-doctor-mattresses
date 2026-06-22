// lib/home-page.ts

import { getCategories } from "@/actions/categories";
import { getActiveBranchesGroupedByState, getFeaturedProducts, getHeroBanners, getNewLaunches } from "../home";

export async function getHomePageData() {
  const [
    heroBanners,
    featuredProducts,
    newLaunches,
    categories,
    branchGroups,
  ] = await Promise.all([
    getHeroBanners(),
    getFeaturedProducts(3),
    getNewLaunches(3),
    getCategories(undefined, false),
    getActiveBranchesGroupedByState(),
  ]);

  return {
    heroBanners,
    featuredProducts,
    newLaunches,
    categories,
    branchGroups,
  };
}