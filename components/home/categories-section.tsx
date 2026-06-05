import Link from "next/link";
import Image from "next/image";
import type { HomeCategory } from "@/lib/home";
import { ArrowRight } from "lucide-react";

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
          className={`grid gap-5 ${
            categories.length <= 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
              : categories.length === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-2 sm:grid-cols-2 md:grid-cols-4"
          }`}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?categoryId=${cat.id}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] flex items-end shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              {/* Background image */}
              <Image
                src={getCategoryImage(cat.slug, cat.name)}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Text */}
              <div className="relative z-10 p-5 w-full">
                <h3 className="text-white font-bold text-lg leading-snug">
                  {cat.name}
                </h3>
                <p className="text-white/60 text-sm mt-0.5">
                  {cat.productCount} product{cat.productCount !== 1 ? "s" : ""}
                </p>
                <div className="mt-3 flex items-center gap-1 text-amber-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Shop Now <ArrowRight className="size-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
