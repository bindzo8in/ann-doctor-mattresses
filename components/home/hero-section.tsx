import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "10-Year Warranty" },
  { icon: Truck, label: "Free Delivery" },
  { icon: Star, label: "5★ Rated" },
];

export default function HomeHeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#0f0e13]">
      {/* Background hero image */}
      <Image
        src="/hero_banner.png"
        alt="Premium Ann Doctor Mattress"
        fill
        priority
        className="object-cover object-center opacity-40"
        sizes="100vw"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f0e13] via-[#0f0e13]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e13] via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 py-20">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold tracking-widest text-amber-400 uppercase mb-6">
            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
            Premium Sleep Solutions
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Sleep Better,{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
              }}
            >
              Live Better.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 max-w-xl">
            Discover doctor-recommended orthopaedic mattresses and luxury sofas
            crafted for your perfect rest. Trusted by thousands across South India.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-sm font-bold rounded-full shadow-lg"
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
                color: "#fff",
                border: "none",
              }}
            >
              <Link href="/products">
                Shop Now <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 text-sm font-bold rounded-full border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/products?type=MATTRESS">Explore Mattresses</Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-white/60 text-sm font-medium"
              >
                <div className="flex items-center justify-center size-8 rounded-full bg-white/10 border border-white/20">
                  <Icon className="size-4 text-amber-400" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}