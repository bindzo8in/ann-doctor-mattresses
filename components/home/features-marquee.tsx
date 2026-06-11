import React from "react";
import Image from "next/image";

// const features = [
//   "Orthopedic Support",
//   "Breathable Materials",
//   "Hypoallergenic Fabric",
//   "Eco-Friendly & Non-Toxic Foam",
//   "Motion Isolation",
//   "Durable Comfort Layers",
//   "Moisture & Odor Control",
// ];

const features = [{
  title:"Orthopedic Support",
  image: "/carousal/orthopedic-support.png",
  
},
{
  title: "Breathable Materials",
  image: "/carousal/breathable-materials.png",
  
},
{
  title: "Hypoallergenic Fabric",
  image: "/carousal/hypoallergenic-fabric.png",
  
},
{
  title: "Eco-Friendly & Non-Toxic Foam",
  image: "/carousal/eco-friendly-non-toxic-foam.png",
  
},
{
  title: "Motion Isolation",
  image: "/carousal/motion-isolation.png",
  
},
{
  title: "Durable Comfort Layers",
  image: "/carousal/durable-comfort-layers.png",
  
},
{
  title: "Moisture & Odor Control",
  image: "/carousal/moisture-odor-control.png",
  
},]

export function FeaturesMarquee() {
  // Duplicate sets to ensure smooth infinite scrolling even on ultra-wide screens
  const marqueeItems = [...features, ...features, ...features, ...features];

  return (
    <section className="py-8 bg-slate-50/50">
      <div className="page-container">
        <div className="border border-red-500 rounded-3xl p-4 md:p-6 bg-white overflow-hidden shadow-sm flex flex-col justify-center">
          <div className="relative flex overflow-x-hidden group">
            {/* The animate-marquee class applies a translateX(-50%) over 20s */}
            <div className="animate-marquee flex gap-6 min-w-max group-hover:[animation-play-state:paused] transition-all">
              {marqueeItems.map((feature, idx) => (
                <div key={idx} className="flex flex-col gap-3 w-64 flex-shrink-0">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-100">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                  <div className="bg-[#e3282c] text-white text-center py-2 px-3 rounded-lg font-bold text-sm shadow-sm">
                    {feature.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
