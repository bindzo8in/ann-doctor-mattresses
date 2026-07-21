import Image from "next/image";

export interface FeatureItem {
  title: string;
  description: string;
}

export interface CategoryFeatureBlockProps {
  features: FeatureItem[];
  layerImageUrl?: string | null;
  layerVideoUrl?: string | null;
}

export function CategoryFeatureBlock({ features, layerImageUrl, layerVideoUrl }: CategoryFeatureBlockProps) {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 section-padding">
      <div className="flex flex-col md:flex-row w-full min-h-[400px] shadow-sm rounded-lg overflow-hidden">
        
        {/* Left Side: Gray background with list */}
        <div className="w-full md:w-1/2 bg-[#efefef] p-10 md:p-14 flex items-center">
          <ul className="space-y-6">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start">
                {/* Red dot bullet */}
                <div className="flex-shrink-0 mt-2 mr-4">
                  <div className="w-2 h-2 rounded-full bg-red-600"></div>
                </div>
                <p className="text-sm md:text-base text-slate-800 leading-relaxed">
                  <span className="font-bold">{feature.title}:</span> {feature.description}
                </p>
              </li>
            ))}
          </ul>
        </div> 

        {/* Right Side: Pink background with image */}
        <div className="w-full md:w-1/2 bg-[#fbe7e7] p-10 flex items-center justify-center relative min-h-[300px]">
          <div className="relative w-full max-w-[450px] aspect-[9/6]">
            {layerVideoUrl ? (
              <video 
                src={layerVideoUrl} 
                poster={layerImageUrl || undefined}
                autoPlay 
                loop 
                muted 
                playsInline 
                className="object-cover w-full h-full rounded-lg"
              />
            ) : layerImageUrl?.match(/\.(mp4|webm|mov|mkv)$/i) ? (
              <video 
                src={layerImageUrl} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="object-cover w-full h-full rounded-lg"
              />
            ) : (
              <Image 
                src={layerImageUrl || "/cat_mattress.png"} 
                alt="Mattress Layers" 
                fill 
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
