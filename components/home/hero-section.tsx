"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Star, Gift } from "lucide-react";
import { HeroBanner } from "@/app/generated/prisma/client";
import { routes } from "@/lib/routes";

/* ─────────────────────────────────────────────
   Trust badges
───────────────────────────────────────────── */
const TRUST_BADGES = [
  { icon: ShieldCheck, label: "10-Year Warranty" },
  { icon: Gift, label: "Buy 1 Get 1 Offer" },
  { icon: Star, label: "5★ Rated" },
];

/* ─────────────────────────────────────────────
   Fallback static hero (no CMS banners)
───────────────────────────────────────────── */
function StaticHero() {
  return (
    <section className="relative min-h-[70vh] md:min-h-[92vh] flex items-center overflow-hidden bg-background">
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <Image
          src="/hero_banner.png"
          alt="Premium Ann Doctor Mattress"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          style={{ opacity: 0.55 }}
        />
      </div>

      {/* Left gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background:
            "linear-gradient(105deg, var(--background) 32%, color-mix(in oklab, var(--background) 65%, transparent) 58%, transparent 100%)",
        }}
      />
      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: "linear-gradient(to top, var(--background) 0%, transparent 40%)",
        }}
      />
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none rounded-full blur-[110px]"
        style={{
          top: "-5%",
          right: "8%",
          width: 520,
          height: 520,
          background: "color-mix(in oklab, var(--primary) 22%, transparent)",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 py-12 pb-16 md:px-14 md:py-28 md:pb-32 flex items-center gap-12">
        <div className="flex-1 max-w-[620px]">
          <HeroEyebrow label="Premium Sleep Solutions" />
          <h1
            className="font-serif text-[clamp(2.2rem,5.5vw,5.25rem)] md:text-[clamp(2.8rem,5.5vw,5.25rem)] font-bold leading-[1.05] tracking-[-0.02em] text-foreground mt-0 mb-4 md:mb-6"
          >
            Sleep{" "}
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: "1.5px var(--foreground)" }}
            >
              Better,
            </span>
            <br />
            <span className="text-primary">Live Better.</span>
          </h1>
          <p className="text-[clamp(0.875rem,1.35vw,1.05rem)] text-muted-foreground leading-[1.8] max-w-[480px] mb-6 md:mb-10">
            Doctor-recommended orthopaedic mattresses crafted for your perfect
            rest. Trusted by thousands across South India.
          </p>
          <div className="flex flex-wrap gap-3 mb-6 md:mb-12">
            <HeroPrimaryBtn href={routes.products} label="Shop Now" />
            <HeroGhostBtn href={routes.products} label="Explore Collection" />
          </div>
          <TrustBadges />
        </div>
      </div>

      {/* Bottom page-blend fade */}
      <div className="absolute bottom-0 left-0 right-0 h-[140px] pointer-events-none z-20"
        style={{ background: "linear-gradient(to top, var(--background), transparent)" }}
      />
    </section>
  );
}

/* ─────────────────────────────────────────────
   Main carousel hero
───────────────────────────────────────────── */
export default function HomeHeroSection({
  banners = [],
}: {
  banners?: HeroBanner[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (idx: number) => {
    if (idx === currentIndex || transitioning) return;
    setTransitioning(true);
    setPrevIndex(currentIndex);
    setCurrentIndex(idx);
    setTimeout(() => {
      setPrevIndex(null);
      setTransitioning(false);
    }, 900);
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % banners.length;
        setPrevIndex(prev);
        setTransitioning(true);
        setTimeout(() => {
          setPrevIndex(null);
          setTransitioning(false);
        }, 900);
        return next;
      });
    }, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length]);

  if (!banners || banners.length === 0) return <StaticHero />;

  const current = banners[currentIndex];

  return (
    <section className="relative w-full aspect-1080/960 md:aspect-auto md:min-h-[92vh] flex items-center overflow-hidden bg-background">

      {/* ── Background image layers ── */}
      {banners.map((banner, idx) => {
        const isActive = idx === currentIndex;
        const isPrev = idx === prevIndex;
        return (
          <div
            key={`bg-${banner.id}`}
            className="absolute inset-0 overflow-hidden"
            style={{
              zIndex: isActive ? 1 : isPrev ? 1 : 0,
              clipPath: isActive ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
              transition:
                isActive || isPrev
                  ? "clip-path 0.9s cubic-bezier(0.76,0,0.24,1)"
                  : "none",
            }}
          >
            {banner.mobileBackgroundImageUrl ? (
              <>
                <Image
                  src={banner.backgroundImageUrl}
                  alt={banner.title}
                  fill
                  priority={idx === 0}
                  className={`hidden md:block w-full ${banner.type === 'STATIC' ? 'object-cover object-top' : 'object-cover object-center'}`}
                  sizes="100vw"
                  style={{ opacity: banner.type === 'STATIC' ? 1 : 0.55 }}
                />
                <Image
                  src={banner.mobileBackgroundImageUrl}
                  alt={banner.title}
                  fill
                  priority={idx === 0}
                  className={`block md:hidden w-full ${banner.type === 'STATIC' ? 'object-cover object-top' : 'object-cover object-center'}`}
                  sizes="100vw"
                  style={{ opacity: banner.type === 'STATIC' ? 1 : 0.55 }}
                />
              </>
            ) : (
              <Image
                src={banner.backgroundImageUrl}
                alt={banner.title}
                fill
                priority={idx === 0}
                className={`w-full ${banner.type === 'STATIC' ? 'object-cover object-top' : 'object-cover object-center'}`}
                sizes="100vw"
                style={{ opacity: banner.type === 'STATIC' ? 1 : 0.55 }}
              />
            )}
          </div>
        );
      })}

      {/* ── Gradient overlays ── */}
      {/* Left */}
      <div
        className={`absolute inset-0 pointer-events-none ${current.type === 'STATIC' ? 'hidden' : ''}`}
        style={{
          zIndex: 2,
          background:
            "linear-gradient(105deg, var(--background) 32%, color-mix(in oklab, var(--background) 65%, transparent) 58%, transparent 100%)",
        }}
      />
      {/* Bottom */}
      <div
        className={`absolute inset-0 pointer-events-none ${current.type === 'STATIC' ? 'hidden' : ''}`}
        style={{
          zIndex: 2,
          background: "linear-gradient(to top, var(--background) 0%, transparent 40%)",
        }}
      />
      {/* Ambient glow */}
      <div
        className={`absolute pointer-events-none rounded-full blur-[110px] ${current.type === 'STATIC' ? 'hidden' : ''}`}
        style={{
          top: "-5%",
          right: "8%",
          width: 520,
          height: 520,
          background: "color-mix(in oklab, var(--primary) 22%, transparent)",
          zIndex: 1,
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 py-6 pb-8 md:px-14 md:py-28 md:pb-32 flex items-center gap-12">

        {/* Left: text */}
        <div className={`flex-1 max-w-[620px] ${current.type === 'STATIC' ? 'hidden' : ''}`}>
          <HeroEyebrow label="Special Offer" />

          <h1
            key={`h-${currentIndex}`}
            className="font-serif text-[clamp(1.8rem,5.5vw,5.25rem)] md:text-[clamp(2.8rem,5.5vw,5.25rem)] font-bold leading-[1.05] tracking-[-0.02em] text-foreground mt-0 mb-3 md:mb-6 animate-[heroSlideUp_0.65s_cubic-bezier(0.4,0,0.2,1)_both]"
          >
            {splitHeadline(current.title)}
          </h1>

          {current.subtitle && (
            <p
              key={`p-${currentIndex}`}
              className="text-sm md:text-[1.05rem] text-muted-foreground leading-[1.6] md:leading-[1.8] max-w-[480px] mb-4 md:mb-10 animate-[heroSlideUp_0.65s_0.14s_cubic-bezier(0.4,0,0.2,1)_both] line-clamp-3 md:line-clamp-none"
            >
              {current.subtitle}
            </p>
          )}

          <div
            key={`cta-${currentIndex}`}
            className="flex flex-row flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-12 animate-[heroSlideUp_0.65s_0.26s_cubic-bezier(0.4,0,0.2,1)_both]"
          >
            <HeroPrimaryBtn
              href={current.buttonLink || routes.products}
              label={current.buttonText || "Shop Now"}
            />
            <HeroGhostBtn href={routes.products} label="Explore Collection" />
          </div>

          <TrustBadges />
        </div>

        {/* Right: foreground product image */}
        <div className="flex-1 relative min-h-[480px] hidden lg:block animate-[heroImageReveal_0.9s_0.35s_cubic-bezier(0.4,0,0.2,1)_both]">
          {/* Product glow */}
          <div
            className="absolute rounded-full blur-[50px] pointer-events-none z-0"
            style={{
              inset: "15% 10%",
              background:
                "radial-gradient(ellipse, color-mix(in oklab, var(--primary) 28%, transparent) 0%, transparent 70%)",
            }}
          />
          {banners.map((banner, idx) => {
            if (!banner.foregroundImageUrl) return null;
            const isActive = idx === currentIndex;
            return (
              <div
                key={`fg-${banner.id}`}
                className="absolute z-1"
                style={{
                  inset: "-8% 0",
                  opacity: isActive ? 1 : 0,
                  transform: isActive
                    ? "translateX(0)"
                    : idx > currentIndex
                      ? "translateX(100%)"
                      : "translateX(100%)",
                  transition:
                    "opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1)",
                  transitionDelay: isActive ? "0.3s" : "0s",
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <Image
                  src={banner.foregroundImageUrl}
                  alt={banner.title}
                  fill
                  className="object-contain object-center drop-shadow-2xl"
                  sizes="(max-width: 768px) 0vw, 45vw"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Slide counter ── */}
      {banners.length > 1 && (
        <div className="absolute bottom-14 left-6 md:left-14 z-20 hidden md:flex items-center gap-[10px]">
          <span
            className="font-serif text-[1.75rem] font-semibold text-primary leading-none"
          >
            {String(currentIndex + 1).padStart(2, "0")}
          </span>
          <span className="block w-7 h-px bg-border" />
          <span className="text-[0.75rem] font-medium text-muted-foreground tracking-[0.05em]">
            {String(banners.length).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* ── Vertical slide indicators ── */}
      {banners.length > 1 && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className="relative w-[3px] h-9 bg-border rounded-full border-0 cursor-pointer p-0 overflow-hidden transition-colors duration-300 hover:bg-[color-mix(in_oklab,var(--primary)_40%,transparent)]"
            >
              <span
                className="block absolute inset-0 rounded-full bg-primary origin-top transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  transform: idx === currentIndex ? "scaleY(1)" : "scaleY(0)",
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Bottom page-blend fade ── */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[140px] pointer-events-none z-20 ${current.type === 'STATIC' ? 'hidden' : ''}`}
        style={{ background: "linear-gradient(to top, var(--background), transparent)" }}
      />

      {/* ── Keyframes (injected once) ── */}
      <style>{`
        @keyframes heroSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroImageReveal {
          from { opacity: 0; transform: translateX(50px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes heroPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-[hero"] { animation: none !important; }
          .hero-pulse-dot { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Shared sub-components
───────────────────────────────────────────── */
function HeroEyebrow({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 md:gap-2 rounded-full px-3 md:px-4 py-1 md:py-[6px] text-[0.6rem] md:text-[0.68rem] font-bold tracking-[0.14em] uppercase text-primary mb-3 md:mb-7 border backdrop-blur-sm"
      style={{
        background: "color-mix(in oklab, var(--primary) 12%, transparent)",
        borderColor: "color-mix(in oklab, var(--primary) 30%, transparent)",
      }}
    >
      <span
        className="hero-pulse-dot block w-1.5 h-1.5 rounded-full bg-primary"
        style={{ animation: "heroPulse 2s ease-in-out infinite" }}
      />
      {label}
    </span>
  );
}

function HeroPrimaryBtn({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 md:gap-2 h-10 md:h-[50px] px-5 md:px-8 rounded-full bg-primary text-primary-foreground text-xs md:text-sm font-bold tracking-[0.01em] no-underline transition-[opacity,transform,box-shadow] duration-200 hover:opacity-[0.88] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_color-mix(in_oklab,var(--primary)_40%,transparent)] active:translate-y-0 active:opacity-100"
      scroll
    >
      {label} <ArrowRight size={14} className="md:w-4 md:h-4" />
    </Link>
  );
}

function HeroGhostBtn({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center h-10 md:h-[50px] px-4 md:px-7 rounded-full border border-border text-foreground text-xs md:text-sm font-semibold no-underline transition-[background,border-color] duration-200 hover:bg-secondary hover:border-ring"
      scroll
    >
      {label}
    </Link>
  );
}

function TrustBadges() {
  return (
    <div className="hidden sm:flex flex-wrap gap-7">
      {TRUST_BADGES.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-2 text-muted-foreground text-[0.78rem] font-medium">
          <div
            className="flex items-center justify-center w-[30px] h-[30px] rounded-full border shrink-0 text-primary"
            style={{
              background: "color-mix(in oklab, var(--primary) 12%, transparent)",
              borderColor: "color-mix(in oklab, var(--primary) 25%, transparent)",
            }}
          >
            <Icon size={14} />
          </div>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Helper: last word gets accent colour
───────────────────────────────────────────── */
function splitHeadline(title: string) {
  const words = title.trim().split(" ");
  if (words.length <= 1) return <>{title}</>;
  const last = words.pop()!;
  return (
    <>
      {words.join(" ")}{" "}
      <span className="text-primary">{last}</span>
    </>
  );
}