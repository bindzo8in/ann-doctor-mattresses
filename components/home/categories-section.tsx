import Link from "next/link";
import Image from "next/image";
import type { HomeCategory } from "@/lib/home";

// Map well-known category slugs to local images
const CATEGORY_IMAGES: Record<string, string> = {
  "mattresses": "/cat_mattress.png",
  "luxury-mattresses": "/cat_mattress.png",
  "budget-mattresses": "/cat_mattress.png",
  "orthopedic-mattresses": "/cat_mattress.png",
  "sofas": "/cat_sofa.png",
  "modern-sofas": "/cat_sofa.png",
  "classic-sofas": "/cat_sofa.png",
};

function getCategoryImage(slug: string, name: string) {
  if (CATEGORY_IMAGES[slug]) return CATEGORY_IMAGES[slug];
  const lower = name.toLowerCase();
  if (lower.includes("sofa")) return "/cat_sofa.png";
  return "/cat_mattress.png";
}

interface CategoriesSectionProps {
  categories: HomeCategory[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (!categories.length) return null;

  return (
    <section className="py-16 md:py-20 bg-muted/40">
      <div className="container mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-destructive mb-2">
            Browse by Category
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
            Shop Our Collections
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            From orthopaedic mattresses to premium sofas — find exactly what your
            home deserves.
          </p>
        </div>

        {/* Category cards grid */}
        <div
          className={`grid gap-6 ${
            categories.length <= 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
              : categories.length === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?categoryId=${cat.id}`}
              className="group flex flex-col bg-white overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] transition-all duration-300 border border-border/50"
            >
              {/* Background image container */}
              <div className="relative w-full aspect-[4/3] bg-muted/20">
                <Image
                  src={cat.thumbnailUrl || getCategoryImage(cat.slug, cat.name)}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              {/* Bottom bar */}
              <div className="bg-[#e62a2d] py-3 sm:py-4 px-4 text-center mt-auto">
                <h3 className="text-white font-medium text-base sm:text-lg">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
