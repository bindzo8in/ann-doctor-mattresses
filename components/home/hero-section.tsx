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
    <section className="hero-root">
      <div className="hero-bg-layer" style={{ zIndex: 0 }}>
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
      <div className="hero-overlay-left" />
      <div className="hero-overlay-bottom" />
      <div className="hero-glow" />

      <div className="hero-content-wrap">
        <div className="hero-left">
          <span className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            Premium Sleep Solutions
          </span>
          <h1 className="hero-headline">
            Sleep <span className="hero-headline-outline">Better,</span>
            <br />
            <span className="hero-headline-accent">Live Better.</span>
          </h1>
          <p className="hero-body">
            Doctor-recommended orthopaedic mattresses crafted for your perfect
            rest. Trusted by thousands across South India.
          </p>
          <div className="hero-ctas">
            <Link href={routes.products} className="hero-btn-primary">
              Shop Now <ArrowRight size={16} />
            </Link>
            <Link href={routes.products} className="hero-btn-ghost">
              Explore Collection
            </Link>
          </div>
          <div className="hero-badges">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="hero-badge">
                <div className="hero-badge-icon">
                  <Icon size={14} />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="hero-fade-bottom" />
      <style jsx>{heroStyles}</style>
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
    <section className="hero-root">
      {/* ── Background image layers ── */}
      {banners.map((banner, idx) => {
        const isActive = idx === currentIndex;
        const isPrev = idx === prevIndex;
        return (
          <div
            key={`bg-${banner.id}`}
            className="hero-bg-layer"
            style={{
              zIndex: isActive ? 1 : isPrev ? 1 : 0,
              clipPath: isActive
                ? "inset(0 0% 0 0)"
                : "inset(0 100% 0 0)",
              transition: isActive || isPrev
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
                  className="object-cover object-center hidden md:block"
                  sizes="100vw"
                  style={{ opacity: 0.55 }}
                />
                <Image
                  src={banner.mobileBackgroundImageUrl}
                  alt={banner.title}
                  fill
                  priority={idx === 0}
                  className="object-cover object-center block md:hidden"
                  sizes="100vw"
                  style={{ opacity: 0.55 }}
                />
              </>
            ) : (
              <Image
                src={banner.backgroundImageUrl}
                alt={banner.title}
                fill
                priority={idx === 0}
                className="object-cover object-center"
                sizes="100vw"
                style={{ opacity: 0.55 }}
              />
            )}
          </div>
        );
      })}

      {/* ── Gradient overlays ── */}
      <div className="hero-overlay-left" />
      <div className="hero-overlay-bottom" />
      <div className="hero-glow" />

      {/* ── Content ── */}
      <div className="hero-content-wrap">
        {/* Left: text */}
        <div className="hero-left">
          <span className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            Special Offer
          </span>

          <h1
            key={`h-${currentIndex}`}
            className="hero-headline hero-anim-title"
          >
            {splitHeadline(current.title)}
          </h1>

          {current.subtitle && (
            <p
              key={`p-${currentIndex}`}
              className="hero-body hero-anim-body"
            >
              {current.subtitle}
            </p>
          )}

          <div
            key={`cta-${currentIndex}`}
            className="hero-ctas hero-anim-cta"
          >
            <Link
              href={current.buttonLink || routes.products}
              className="hero-btn-primary"
            >
              {current.buttonText || "Shop Now"}
              <ArrowRight size={16} />
            </Link>
            <Link href={routes.products} className="hero-btn-ghost">
              Explore Collection
            </Link>
          </div>

          <div className="hero-badges">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="hero-badge">
                <div className="hero-badge-icon">
                  <Icon size={14} />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: foreground product image */}
        <div className="hero-right hero-anim-image">
          <div className="hero-product-glow" />
          {banners.map((banner, idx) => {
            if (!banner.foregroundImageUrl) return null;
            const isActive = idx === currentIndex;
            return (
              <div
                key={`fg-${banner.id}`}
                className="hero-product-frame"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive
                    ? "translateY(0) scale(1)"
                    : "translateY(28px) scale(0.95)",
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
        <div className="hero-counter">
          <span className="hero-counter-current">
            {String(currentIndex + 1).padStart(2, "0")}
          </span>
          <span className="hero-counter-sep" />
          <span className="hero-counter-total">
            {String(banners.length).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* ── Vertical indicators ── */}
      {banners.length > 1 && (
        <div className="hero-indicators">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className="hero-indicator-btn"
            >
              <span
                className="hero-indicator-fill"
                style={{
                  transform: idx === currentIndex ? "scaleY(1)" : "scaleY(0)",
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Bottom page-blend fade ── */}
      <div className="hero-fade-bottom" />

      <style jsx>{heroStyles}</style>
    </section>
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
      <span className="hero-headline-accent">{last}</span>
    </>
  );
}

/* ─────────────────────────────────────────────
   Styles — every colour comes from your CSS
   variables so dark/light mode works for free.
───────────────────────────────────────────── */
const heroStyles = `
  /* ── Root shell ── */
  .hero-root {
    position: relative;
    min-height: 70vh;
    display: flex;
    align-items: center;
    overflow: hidden;
    /* Uses your theme background so it blends with the page */
    background-color: var(--background);
  }
  @media (min-width: 768px) {
    .hero-root { min-height: 92vh; }
  }

  /* ── Background image container ── */
  .hero-bg-layer {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  /*
   * Left gradient: fades the background INTO the page background
   * so text is always readable — no hardcoded dark colour needed.
   */
  .hero-overlay-left {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: linear-gradient(
      105deg,
      var(--background) 32%,
      color-mix(in oklab, var(--background) 65%, transparent) 58%,
      transparent 100%
    );
  }

  /* Bottom fade blends into the next section */
  .hero-overlay-bottom {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: linear-gradient(
      to top,
      var(--background) 0%,
      transparent 40%
    );
  }

  /*
   * Ambient glow — uses your primary colour so it matches your brand.
   * color-mix falls back gracefully in older browsers.
   */
  .hero-glow {
    position: absolute;
    top: -5%;
    right: 8%;
    width: 520px;
    height: 520px;
    border-radius: 50%;
    background: color-mix(in oklab, var(--primary) 22%, transparent);
    filter: blur(110px);
    z-index: 1;
    pointer-events: none;
  }

  /* ── Content grid ── */
  .hero-content-wrap {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 3rem 1.25rem 4rem;
    display: flex;
    align-items: center;
    gap: 3rem;
  }
  @media (min-width: 768px) {
    .hero-content-wrap {
      padding: 7rem 3.5rem 8rem;
    }
  }

  .hero-left {
    flex: 1;
    max-width: 620px;
  }

  /* ── Eyebrow pill ── */
  .hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: color-mix(in oklab, var(--primary) 12%, transparent);
    border: 1px solid color-mix(in oklab, var(--primary) 30%, transparent);
    backdrop-filter: blur(8px);
    border-radius: 999px;
    padding: 6px 16px;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--primary);
    margin-bottom: 1rem;
  }
  @media (min-width: 768px) {
    .hero-eyebrow { margin-bottom: 1.75rem; }
  }
  .hero-eyebrow-dot {
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--primary);
    animation: heroPulse 2s ease-in-out infinite;
  }
  @keyframes heroPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.75); }
  }

  /* ── Headline ── */
  .hero-headline {
    font-family: var(--font-serif, 'Playfair Display', Georgia, serif);
    font-size: clamp(2.2rem, 5.5vw, 5.25rem);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: var(--foreground);
    margin: 0 0 1rem;
  }
  @media (min-width: 768px) {
    .hero-headline { margin: 0 0 1.5rem; font-size: clamp(2.8rem, 5.5vw, 5.25rem); }
  }
  .hero-headline-outline {
    -webkit-text-stroke: 1.5px var(--foreground);
    color: transparent;
  }
  .hero-headline-accent {
    color: var(--primary);
  }
  .hero-anim-title {
    animation: heroSlideUp 0.65s cubic-bezier(0.4,0,0.2,1) both;
  }

  /* ── Body copy ── */
  .hero-body {
    font-size: clamp(0.875rem, 1.35vw, 1.05rem);
    color: var(--muted-foreground);
    line-height: 1.8;
    max-width: 480px;
    margin: 0 0 1.5rem;
  }
  @media (min-width: 768px) {
    .hero-body { margin: 0 0 2.5rem; }
  }
  .hero-anim-body {
    animation: heroSlideUp 0.65s 0.14s cubic-bezier(0.4,0,0.2,1) both;
  }

  /* ── CTA row ── */
  .hero-ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 1.5rem;
  }
  @media (min-width: 768px) {
    .hero-ctas { margin-bottom: 3rem; }
  }
  .hero-anim-cta {
    animation: heroSlideUp 0.65s 0.26s cubic-bezier(0.4,0,0.2,1) both;
  }

  /* Primary button — your brand primary colour */
  .hero-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 50px;
    padding: 0 2rem;
    border-radius: 999px;
    background: var(--primary);
    color: var(--primary-foreground);
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    text-decoration: none;
    transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
  }
  .hero-btn-primary:hover {
    opacity: 0.88;
    transform: translateY(-2px);
    box-shadow: 0 10px 30px color-mix(in oklab, var(--primary) 40%, transparent);
  }
  .hero-btn-primary:active {
    transform: translateY(0);
    opacity: 1;
  }

  /* Ghost button */
  .hero-btn-ghost {
    display: inline-flex;
    align-items: center;
    height: 50px;
    padding: 0 1.75rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    color: var(--foreground);
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s;
  }
  .hero-btn-ghost:hover {
    background: var(--secondary);
    border-color: var(--ring);
  }

  /* ── Trust badges ── */
  .hero-badges {
    display: none;
    gap: 1.75rem;
  }
  @media (min-width: 640px) {
    .hero-badges { display: flex; flex-wrap: wrap; }
  }
  .hero-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--muted-foreground);
    font-size: 0.78rem;
    font-weight: 500;
  }
  .hero-badge-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: color-mix(in oklab, var(--primary) 12%, transparent);
    border: 1px solid color-mix(in oklab, var(--primary) 25%, transparent);
    color: var(--primary);
    flex-shrink: 0;
  }

  /* ── Right column (product image) ── */
  .hero-right {
    flex: 1;
    position: relative;
    min-height: 480px;
    display: none;
  }
  @media (min-width: 900px) {
    .hero-right { display: block; }
  }
  .hero-product-glow {
    position: absolute;
    inset: 15% 10%;
    border-radius: 50%;
    background: radial-gradient(
      ellipse,
      color-mix(in oklab, var(--primary) 28%, transparent) 0%,
      transparent 70%
    );
    filter: blur(50px);
    pointer-events: none;
    z-index: 0;
  }
  .hero-product-frame {
    position: absolute;
    inset: -8% 0;
    z-index: 1;
  }

  /* ── Slide counter (bottom-left) ── */
  .hero-counter {
    position: absolute;
    bottom: 3.5rem;
    left: 1.5rem;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  @media (min-width: 768px) {
    .hero-counter { left: 3.5rem; }
  }
  .hero-counter-current {
    font-family: var(--font-serif, 'Playfair Display', Georgia, serif);
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--primary);
    line-height: 1;
  }
  .hero-counter-sep {
    display: block;
    width: 28px;
    height: 1px;
    background: var(--border);
  }
  .hero-counter-total {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--muted-foreground);
    letter-spacing: 0.05em;
  }

  /* ── Vertical slide indicators (right edge) ── */
  .hero-indicators {
    position: absolute;
    right: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    z-index: 30;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .hero-indicator-btn {
    position: relative;
    width: 3px;
    height: 36px;
    background: var(--border);
    border: none;
    border-radius: 999px;
    cursor: pointer;
    padding: 0;
    overflow: hidden;
    transition: background 0.3s;
  }
  .hero-indicator-btn:hover {
    background: color-mix(in oklab, var(--primary) 40%, transparent);
  }
  .hero-indicator-fill {
    display: block;
    position: absolute;
    inset: 0;
    border-radius: 999px;
    background: var(--primary);
    transform-origin: top center;
    transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
  }

  /* ── Bottom blend into page ── */
  .hero-fade-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 140px;
    background: linear-gradient(to top, var(--background), transparent);
    z-index: 20;
    pointer-events: none;
  }

  /* ── Slide-up keyframe ── */
  @keyframes heroSlideUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Image Reveal keyframe ── */
  @keyframes heroImageReveal {
    from { opacity: 0; transform: translateX(50px) scale(0.95); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  .hero-anim-image {
    animation: heroImageReveal 0.9s 0.35s cubic-bezier(0.4,0,0.2,1) both;
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .hero-anim-title,
    .hero-anim-body,
    .hero-anim-cta,
    .hero-anim-image,
    .hero-eyebrow-dot {
      animation: none;
    }
  }
`;
// "use client";

// import { useState, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { ArrowRight, ShieldCheck, Star, Gift } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { HeroBanner } from "@/app/generated/prisma/client";

// const TRUST_BADGES = [
//   { icon: ShieldCheck, label: "10-Year Warranty" },
//   { icon: Gift, label: "Buy 1 Get 1 Offer" },
//   { icon: Star, label: "5★ Rated" },
// ];

// export default function HomeHeroSection({ banners = [] }: { banners?: HeroBanner[] }) {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     if (banners.length <= 1) return;
//     const timer = setInterval(() => {
//       setCurrentIndex((prev) => (prev + 1) % banners.length);
//     }, 6000); // 6 seconds per slide
//     return () => clearInterval(timer);
//   }, [banners.length]);

//   // If no banners available, render the fallback static hero
//   if (!banners || banners.length === 0) {
//     return (
//       <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#0f0e13]">
//         <Image
//           src="/hero_banner.png"
//           alt="Premium Ann Doctor Mattress"
//           fill
//           priority
//           className="object-cover object-center opacity-40"
//           sizes="100vw"
//         />
//         <div className="absolute inset-0 bg-gradient-to-r from-[#0f0e13] via-[#0f0e13]/70 to-transparent" />
//         <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e13] via-transparent to-transparent" />
//         <div className="relative z-10 container mx-auto px-6 md:px-12 py-20">
//           <div className="max-w-2xl">
//             <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold tracking-widest text-primary uppercase mb-6">
//               <span className="size-1.5 rounded-full bg-primary animate-pulse" />
//               Premium Sleep Solutions
//             </div>
//             <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
//               Sleep Better,{" "}
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
//                 Live Better.
//               </span>
//             </h1>
//             <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 max-w-xl">
//               Discover doctor-recommended orthopaedic mattresses and luxury sofas crafted for your perfect rest. Trusted by thousands across South India.
//             </p>
//             <div className="flex flex-wrap gap-4 mb-12">
//               <Button asChild size="lg" className="h-12 px-8 text-sm font-bold rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 border-none">
//                 <Link href="/products">Shop Now <ArrowRight className="ml-2 size-4" /></Link>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   const currentBanner = banners[currentIndex];

//   return (
//     <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#0f0e13]">
//       {/* Background Images */}
//       {banners.map((banner, index) => (
//         <div key={`bg-${banner.id}`} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-70" : "opacity-0"}`}>
//           {banner.mobileBackgroundImageUrl ? (
//             <>
//               {/* Desktop background */}
//               <Image
//                 src={banner.backgroundImageUrl}
//                 alt={banner.title}
//                 fill
//                 priority={index === 0}
//                 className="object-cover object-center hidden md:block"
//                 sizes="100vw"
//               />
//               {/* Mobile background */}
//               <Image
//                 src={banner.mobileBackgroundImageUrl}
//                 alt={banner.title}
//                 fill
//                 priority={index === 0}
//                 className="object-cover object-center block md:hidden"
//                 sizes="100vw"
//               />
//             </>
//           ) : (
//             <Image
//               src={banner.backgroundImageUrl}
//               alt={banner.title}
//               fill
//               priority={index === 0}
//               className="object-cover object-center"
//               sizes="100vw"
//             />
//           )}
//         </div>
//       ))}

//       {/* Gradient overlays to ensure text readability */}
//       <div className="absolute inset-0 bg-gradient-to-r from-[#0f0e13]/90 via-[#0f0e13]/50 to-transparent" />
//       <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e13] via-transparent to-transparent" />

//       {/* Content */}
//       <div className="relative z-10 container mx-auto px-6 md:px-12 py-20 flex flex-col md:flex-row items-center gap-12">
//         {/* Left Side: Text */}
//         <div className="flex-1 max-w-2xl">
//           <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold tracking-widest text-primary uppercase mb-6 transition-all duration-500">
//             <span className="size-1.5 rounded-full bg-primary animate-pulse" />
//             Special Offer
//           </div>

//           <h1 
//             key={`title-${currentBanner.id}`}
//             className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6 animate-in slide-in-from-bottom-4 fade-in duration-700"
//           >
//             {currentBanner.title}
//           </h1>

//           {currentBanner.subtitle && (
//             <p 
//               key={`desc-${currentBanner.id}`}
//               className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 max-w-xl animate-in slide-in-from-bottom-4 fade-in duration-700 delay-150 fill-mode-backwards"
//             >
//               {currentBanner.subtitle}
//             </p>
//           )}

//           <div 
//             key={`cta-${currentBanner.id}`}
//             className="flex flex-wrap gap-4 mb-12 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 fill-mode-backwards"
//           >
//             <Button
//               asChild
//               size="lg"
//               className="h-12 px-8 text-sm font-bold rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 border-none"
//             >
//               <Link href={currentBanner.buttonLink || "/products"}>
//                 {currentBanner.buttonText || "Shop Now"} <ArrowRight className="ml-2 size-4" />
//               </Link>
//             </Button>
//             <Button
//               asChild
//               variant="outline"
//               size="lg"
//               className="h-12 px-8 text-sm font-bold rounded-full border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white"
//             >
//               <Link href="/products">Explore Collection</Link>
//             </Button>
//           </div>

//           {/* Trust badges */}
//           <div className="flex flex-wrap gap-6 hidden sm:flex">
//             {TRUST_BADGES.map(({ icon: Icon, label }) => (
//               <div key={label} className="flex items-center gap-2 text-white/60 text-sm font-medium">
//                 <div className="flex items-center justify-center size-8 rounded-full bg-white/10 border border-white/20">
//                   <Icon className="size-4 text-primary" />
//                 </div>
//                 {label}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Right Side: Foreground PNG Image */}
//         <div className="flex-1 w-full relative min-h-[300px] md:min-h-[500px] hidden md:block">
//           {banners.map((banner, index) => {
//             if (!banner.foregroundImageUrl) return null;
//             return (
//               <div
//                 key={`fg-${banner.id}`}
//                 className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${
//                   index === currentIndex 
//                     ? "opacity-100 translate-x-0 scale-100" 
//                     : "opacity-0 translate-x-12 scale-95 pointer-events-none"
//                 }`}
//               >
//                 <div className="relative w-full h-[120%] -mt-10 animate-float">
//                   <Image
//                     src={banner.foregroundImageUrl}
//                     alt={banner.title}
//                     fill
//                     className="object-contain object-center drop-shadow-2xl"
//                     sizes="(max-width: 768px) 100vw, 50vw"
//                   />
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Bottom fade */}
//       <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />

//       {/* Slide Indicators */}
//       {banners.length > 1 && (
//         <div className="absolute bottom-10 right-10 z-30 flex gap-2">
//           {banners.map((_, idx) => (
//             <button
//               key={idx}
//               onClick={() => setCurrentIndex(idx)}
//               className={`h-1.5 rounded-full transition-all duration-300 ${
//                 idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-white/30 hover:bg-white/50"
//               }`}
//               aria-label={`Go to slide ${idx + 1}`}
//             />
//           ))}
//         </div>
//       )}
//     </section>
//   );
// }