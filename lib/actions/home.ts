// lib/home-page.ts

import { getCategories, getActiveBranchesGroupedByState, getFeaturedProducts, getHeroBanners, getNewLaunches } from "../home";

export async function getHomePageData() {
  const [
    heroBanners,
    featuredProducts,
    newLaunches,
    categories,
    branchGroups,
  ] = await Promise.all([
    getHeroBanners(),
    getFeaturedProducts(4),
    getNewLaunches(4),
    getCategories(),
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