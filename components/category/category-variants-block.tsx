import Image from "next/image";
import Link from "next/link";

export interface VariantItem {
  id: string;
  name: string;
  imageUrl?: string;
  colorHex: string;
  link: string;
}

export interface CategoryVariantsBlockProps {
  categoryName: string;
  coverImageUrl: string;
  variants: VariantItem[];
}

export function CategoryVariantsBlock({ categoryName, coverImageUrl, variants }: CategoryVariantsBlockProps) {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 section-padding relative overflow-hidden">
      {/* Decorative background swirly lines could go here */}
      
      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20">
        
        {/* Left Side: Room Image with Title */}
        <div className="w-full md:w-5/12 flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-light text-red-500 uppercase tracking-widest mb-6 text-center" style={{ textShadow: "1px 1px 0px rgba(255,0,0,0.2)" }}>
            {categoryName}
          </h2>
          <div className="relative w-full max-w-[320px] aspect-[4/5] rounded-t-[100px] rounded-b-[20px] overflow-hidden shadow-2xl border-4 border-white">
            <Image 
              src={coverImageUrl}
              alt={categoryName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </div>

        {/* Right Side: Curved Variants List */}
        <div className="w-full md:w-7/12 flex flex-col relative z-10 space-y-[-20px] pt-10">
          {variants.map((variant, idx) => {
            // Determine z-index and padding to create the overlapping stacked effect
            const zIndex = variants.length - idx;
            // The first item is usually larger and has an image
            const isFirst = idx === 0;

            return (
              <Link 
                key={variant.id} 
                href={variant.link}
                className="relative group transition-transform hover:-translate-x-2"
                style={{ zIndex }}
                scroll
              >
                <div 
                  className={`
                    flex items-center 
                    rounded-l-[50px] md:rounded-l-[80px] rounded-r-lg shadow-md
                    overflow-hidden
                    ${isFirst ? 'p-2 pr-8 ml-0' : 'py-4 px-8'}
                  `}
                  style={{ 
                    backgroundColor: variant.colorHex,
                    marginLeft: `${idx * 40}px` // Indent each subsequent item
                  }}
                >
                  {isFirst && variant.imageUrl && (
                    <div className="relative w-32 h-20 md:w-40 md:h-28 rounded-lg overflow-hidden shadow-sm shrink-0 mr-6 bg-white">
                      <Image 
                        src={variant.imageUrl} 
                        alt={variant.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <span className={`
                    font-medium tracking-wide
                    ${isFirst ? 'text-xl md:text-2xl text-slate-800' : 'text-lg md:text-xl text-slate-800'}
                    ${idx > 1 ? 'text-white/90' : ''} // If background gets too dark, switch text to white
                  `}>
                    {variant.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
