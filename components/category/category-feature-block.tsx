import Image from "next/image";

export interface FeatureItem {
  title: string;
  description: string;
}

export interface CategoryFeatureBlockProps {
  features: FeatureItem[];
  layerImageUrl: string;
}

export function CategoryFeatureBlock({ features, layerImageUrl }: CategoryFeatureBlockProps) {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-16">
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
          <div className="relative w-4/5 h-4/5 max-w-[300px] max-h-[300px]">
            <Image 
              src={layerImageUrl} 
              alt="Mattress Layers" 
              fill 
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
