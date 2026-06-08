"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Star, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBanner } from "@/app/generated/prisma/client";

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "10-Year Warranty" },
  { icon: Gift, label: "Buy 1 Get 1 Offer" },
  { icon: Star, label: "5★ Rated" },
];

export default function HomeHeroSection({ banners = [] }: { banners?: HeroBanner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(timer);
  }, [banners.length]);

  // If no banners available, render the fallback static hero
  if (!banners || banners.length === 0) {
    return (
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#0f0e13]">
        <Image
          src="/hero_banner.png"
          alt="Premium Ann Doctor Mattress"
          fill
          priority
          className="object-cover object-center opacity-40"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0e13] via-[#0f0e13]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e13] via-transparent to-transparent" />
        <div className="relative z-10 container mx-auto px-6 md:px-12 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold tracking-widest text-primary uppercase mb-6">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Premium Sleep Solutions
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Sleep Better,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Live Better.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 max-w-xl">
              Discover doctor-recommended orthopaedic mattresses and luxury sofas crafted for your perfect rest. Trusted by thousands across South India.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Button asChild size="lg" className="h-12 px-8 text-sm font-bold rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 border-none">
                <Link href="/products">Shop Now <ArrowRight className="ml-2 size-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#0f0e13]">
      {/* Background Images */}
      {banners.map((banner, index) => (
        <div key={`bg-${banner.id}`} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-70" : "opacity-0"}`}>
          {banner.mobileBackgroundImageUrl ? (
            <>
              {/* Desktop background */}
              <Image
                src={banner.backgroundImageUrl}
                alt={banner.title}
                fill
                priority={index === 0}
                className="object-cover object-center hidden md:block"
                sizes="100vw"
              />
              {/* Mobile background */}
              <Image
                src={banner.mobileBackgroundImageUrl}
                alt={banner.title}
                fill
                priority={index === 0}
                className="object-cover object-center block md:hidden"
                sizes="100vw"
              />
            </>
          ) : (
            <Image
              src={banner.backgroundImageUrl}
              alt={banner.title}
              fill
              priority={index === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          )}
        </div>
      ))}

      {/* Gradient overlays to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f0e13]/90 via-[#0f0e13]/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e13] via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 py-20 flex flex-col md:flex-row items-center gap-12">
        {/* Left Side: Text */}
        <div className="flex-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold tracking-widest text-primary uppercase mb-6 transition-all duration-500">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Special Offer
          </div>

          <h1 
            key={`title-${currentBanner.id}`}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6 animate-in slide-in-from-bottom-4 fade-in duration-700"
          >
            {currentBanner.title}
          </h1>

          {currentBanner.subtitle && (
            <p 
              key={`desc-${currentBanner.id}`}
              className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 max-w-xl animate-in slide-in-from-bottom-4 fade-in duration-700 delay-150 fill-mode-backwards"
            >
              {currentBanner.subtitle}
            </p>
          )}

          <div 
            key={`cta-${currentBanner.id}`}
            className="flex flex-wrap gap-4 mb-12 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 fill-mode-backwards"
          >
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-sm font-bold rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 border-none"
            >
              <Link href={currentBanner.buttonLink || "/products"}>
                {currentBanner.buttonText || "Shop Now"} <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 text-sm font-bold rounded-full border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white"
            >
              <Link href="/products">Explore Collection</Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 hidden sm:flex">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/60 text-sm font-medium">
                <div className="flex items-center justify-center size-8 rounded-full bg-white/10 border border-white/20">
                  <Icon className="size-4 text-primary" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Foreground PNG Image */}
        <div className="flex-1 w-full relative min-h-[300px] md:min-h-[500px] hidden md:block">
          {banners.map((banner, index) => {
            if (!banner.foregroundImageUrl) return null;
            return (
              <div
                key={`fg-${banner.id}`}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${
                  index === currentIndex 
                    ? "opacity-100 translate-x-0 scale-100" 
                    : "opacity-0 translate-x-12 scale-95 pointer-events-none"
                }`}
              >
                <div className="relative w-full h-[120%] -mt-10 animate-float">
                  <Image
                    src={banner.foregroundImageUrl}
                    alt={banner.title}
                    fill
                    className="object-contain object-center drop-shadow-2xl"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />

      {/* Slide Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-10 right-10 z-30 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}