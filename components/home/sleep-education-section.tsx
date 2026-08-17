"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Layers, Wind, ShieldBan } from "lucide-react";

export function SleepEducationSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-[80px] md:py-[120px] lg:py-[150px] bg-white font-montserrat">
      <div className="page-container">
        <div className="border border-slate-200 rounded-3xl lg:rounded-[2.5rem] p-4 sm:p-6 lg:p-10 xl:p-12">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-10">
            {/* LEFT */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm h-full">
              {/* Video */}
              <div className="relative aspect-video bg-slate-900">
                <video
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="none"
                >
                  {shouldLoadVideo && (
                    <>
                      <source
                        src="/layers/mattress-layers.webm"
                        type="video/webm"
                      />
                      <source
                        src="/layers/mattresses-layers.mp4"
                        type="video/mp4"
                      />
                    </>
                  )}
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Red Banner */}
              <div className="bg-[#e3282c] text-white px-6 py-8 md:px-10 md:py-12 text-center">
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
                  Sleep deeper, dream better —
                  <br />
                  comfort starts with every layer.
                </h3>

                <div className="mt-8 flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
                  {[
                    <Layers key="layers" />,
                    <Wind key="wind" />,
                    <ShieldBan key="shield" />,
                  ].map((icon, index) => (
                    <div
                      key={index}
                      className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-white shadow"
                    >
                      <div className="text-[#e3282c] [&>svg]:h-6 [&>svg]:w-6 md:[&>svg]:h-8 md:[&>svg]:w-8">
                        {icon}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-6 lg:gap-8">
              {/* Chart */}
              <div className="relative aspect-[16/10] md:aspect-[16/9] rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <Image
                  src="/chart.png"
                  alt="Sleep Chart"
                  fill
                  className="object-contain p-3 sm:p-4 md:p-6"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Sleeping Position */}
              <div className="overflow-hidden rounded-3xl bg-slate-50 border border-slate-100 shadow-sm flex flex-col md:flex-row">
                {/* Image */}
                <div className="relative w-full md:w-5/12 min-h-[220px] md:min-h-[240px] shrink-0">
                  <Image
                    src="/sleeping.png"
                    alt="Sleeping Positions"
                    fill
                    className="object-contain object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 md:w-7/12">
                  <h4 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-[#e3282c] mb-2 sm:mb-3">
                    Sleep Posture Guide
                  </h4>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-700">
                    The healthiest sleeping positions are on your side or back,
                    as they help maintain proper spinal alignment and reduce
                    pressure points. The ideal position ultimately depends on
                    your body type, comfort preferences, and any existing pain
                    conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}