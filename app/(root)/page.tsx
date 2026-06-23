import { Suspense } from "react";
import { Metadata } from "next";
import Script from "next/script";

export const revalidate = 3600; // ISR revalidation every 1 hour

export const metadata: Metadata = {
  title: "Doctor Mattresses | Premium Orthopedic Mattresses",
  description: "Shop premium orthopedic mattresses, comfortable sofas, and sleep accessories.",
  alternates: {
    canonical: "https://doctormattresses.com",
  },
};

import HomeHeroSection from "@/components/home/hero-section";
import { ProductGridSection } from "@/components/home/product-grid-section";
import { CategoriesSection } from "@/components/home/categories-section";
// import { WhyChooseUsSection } from "@/components/home/why-choose-us-section";
import { getFeaturedProducts, getNewLaunches, getCategories, getHeroBanners, getActiveBranchesGroupedByState } from "@/lib/home";
import { Skeleton } from "@/components/ui/skeleton";
import AboutUs from "@/components/home/about-us";
import { BranchesSection } from "@/components/home/branches-section";
import { FeaturesMarquee } from "@/components/home/features-marquee";
import { SleepEducationSection } from "@/components/home/sleep-education-section";
import { getHomePageData } from "@/lib/actions/home";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Doctor Mattresses",
  url: "https://doctormattresses.com",
  logo: "https://doctormattresses.com/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-1234567890", // Update with actual phone number
    contactType: "customer service"
  }
};

export default async function Home() {
  const {
    heroBanners,
    featuredProducts,
    newLaunches,
    categories,
    branchGroups,
  } = await getHomePageData();
  return (
    <main className="font-montserrat">
      <Script
        id="org-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      <HomeHeroSection banners={heroBanners} />

      <ProductGridSection
        badge="Best Sellers"
        title="Our Most Loved Products"
        subtitle="Top-rated mattresses and sofas chosen by thousands of happy customers."
        products={featuredProducts}
        viewAllHref="/products?featured=true"
        viewAllLabel="View All Best Sellers"
      />

      <FeaturesMarquee />

      <ProductGridSection
        badge="New Launches"
        title="Just Arrived"
        subtitle="Fresh additions to our collection — be the first to experience them."
        products={newLaunches}
        viewAllHref="/products"
        viewAllLabel="View All Products"
      />

      <CategoriesSection categories={categories} />

      <AboutUs />

      <SleepEducationSection />

      <BranchesSection branchGroups={branchGroups} />
    </main>
  );
}
