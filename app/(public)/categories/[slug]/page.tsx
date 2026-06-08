import { notFound } from "next/navigation";
import { CategoryFeatureBlock } from "@/components/category/category-feature-block";
import { CategoryVariantsBlock } from "@/components/category/category-variants-block";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Royal Top Collection | Ann Doctor Mattresses",
  description: "Explore the premium Royal Top collection featuring Quilted Cotton Covers, Latex Foam, and Orthopedic support.",
};

// Dummy hardcoded data based on the user's screenshot
const DUMMY_CATEGORY_DATA = {
  slug: "royal-top",
  name: "Royal Top",
  features: [
    { title: "Quilted Cotton Cover", description: "Soft and breathable for a smooth, luxurious surface." },
    { title: "Wool Comfort Layer", description: "Regulates temperature and keeps the mattress fresh." },
    { title: "Latex Foam Layer", description: "Provides natural bounce and pressure relief." },
    { title: "High-Density Foam / Cotton Layer", description: "Adds firmness and supports spinal alignment." },
    { title: "Support Core Base", description: "Ensures strength, durability, and long-lasting comfort." },
    { title: "Bottom Fabric Layer", description: "Protects the inner layers and enhances mattress life." },
  ],
  layerImageUrl: "/images/category/mattress-layers.png", // We will use a placeholder or assume image exists
  coverImageUrl: "/images/category/royal-top-room.png",
  variants: [
    {
      id: "v1",
      name: "Royal Top Classic",
      imageUrl: "/images/category/classic-mattress.png", // Assume image exists
      colorHex: "#f0d5d5", // Light pink
      link: "/products/royal-top-classic"
    },
    {
      id: "v2",
      name: "Royal Top Modern Elegance",
      colorHex: "#f4aeb1", // Slightly darker pink
      link: "/products/royal-top-modern-elegance"
    },
    {
      id: "v3",
      name: "Royal Top Luxe Comfort",
      colorHex: "#f2797e", // Red/pink
      link: "/products/royal-top-luxe-comfort"
    },
    {
      id: "v4",
      name: "Royal Top Eco Series",
      colorHex: "#db484e", // Dark Red
      link: "/products/royal-top-eco-series"
    }
  ]
};

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  // For now, only render the hardcoded route. In the future, fetch from DB.
  if (resolvedParams.slug !== "royal-top") {
    notFound();
  }

  const { features, layerImageUrl, coverImageUrl, variants, name } = DUMMY_CATEGORY_DATA;

  return (
    <main className="min-h-screen bg-white">
      {/* 
        Optional Breadcrumbs/Header could go here. 
        For now, jumping straight into the requested layout. 
      */}

      {/* Top Section: Features & Layers */}
      <CategoryFeatureBlock 
        features={features} 
        layerImageUrl={layerImageUrl} 
      />

      {/* Bottom Section: Variants */}
      <CategoryVariantsBlock 
        categoryName={name}
        coverImageUrl={coverImageUrl}
        variants={variants}
      />
      
    </main>
  );
}
