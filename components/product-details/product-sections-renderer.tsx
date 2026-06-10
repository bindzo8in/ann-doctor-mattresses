import { ProductSection } from "@/app/generated/prisma/browser";
import Image from "next/image";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  sections: ProductSection[];
  sectionHeading?: string | null;
}

export function ProductSectionsRenderer({ sections, sectionHeading }: Props) {
  if (!sections?.length) return null;

  return (
    <div className="space-y-24">
      {sections.map((section, index) => {
        const content = section.content as any;

        // Base types (from before)
        const title = content?.title || null;
        const subtitle = content?.subtitle || null;
        const textContent = content?.content || null;
        const imageUrl = content?.imageUrl || null;

        return (
          <div key={section.id} id={`section-${section.id}`} className="space-y-6">

            {/* Base Types Rendering */}
            {section.type === "TEXT" && textContent && (
              <div className="prose prose-slate max-w-none dark:prose-invert">
                {textContent}
              </div>
            )}

            {section.type === "IMAGE" && imageUrl && (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                <Image src={imageUrl} alt={title || "Section Image"} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" />
              </div>
            )}

            {section.type === "CONTENT_WITH_IMAGE" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {textContent && (
                  <div className="prose prose-slate max-w-none dark:prose-invert order-2 md:order-1">
                    {textContent}
                  </div>
                )}
                {imageUrl && (
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-muted order-1 md:order-2">
                    <Image src={imageUrl} alt={title || "Section Image"} fill className="object-cover" />
                  </div>
                )}
              </div>
            )}

            {section.type === "HTML" && textContent && (
              <div className="prose prose-slate max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: textContent }} />
            )}

            {section.type === "FEATURE_GRID" && textContent && (
              <div className="bg-muted/50 p-6 rounded-xl border border-border">
                {textContent}
              </div>
            )}

            {/* NEW TYPES */}
            {section.type === "FEATURES_WITH_IMAGE" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                <div className="space-y-8 order-2 lg:order-1">
                  {index === 0 && sectionHeading && (
                    <h2 className="text-3xl font-bold text-[#E53935] leading-snug">{sectionHeading}</h2>
                  )}
                  {content.description && (
                    <p className="text-slate-600 leading-relaxed">{content.description}</p>
                  )}

                  {content.features && Array.isArray(content.features) && (
                    <ul className="space-y-4">
                      {content.features.map((feature: any, i: number) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-[#E53935] mt-1.5 text-[8px]">■</span>
                          <div>
                            <span className="text-[#E53935] font-semibold">{feature.title}</span>
                            {feature.description && <span className="text-slate-600"> - {feature.description}</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="order-1 lg:order-2 flex justify-center">
                  {content.image?.url && (
                    <div className="relative w-full max-w-md aspect-[4/3]">
                      <Image
                        src={content.image.url}
                        alt="Features"
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {section.type === "IMAGE_COMPARISON" && content.items && (
              <div className="flex flex-col gap-12 items-center">
                {content.items.map((item: any, i: number) => (
                  <div key={i} className="relative w-full max-w-4xl flex items-center gap-6">
                    <div className="flex-1 relative aspect-[3/1] rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-white">
                      {item.image?.url && (
                        <Image
                          src={item.image.url}
                          alt={`Comparison ${item.label}`}
                          fill
                          className="object-contain p-4"
                          sizes="(max-width: 1024px) 100vw, 80vw"
                        />
                      )}
                    </div>
                    {/* Status Icon based on order or label */}
                    <div className="shrink-0">
                      {i === 0 ? (
                        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
                          <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#E53935] flex items-center justify-center shadow-lg shadow-red-200">
                          <XCircle className="w-10 h-10 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.type === "SLEEPER_GUIDE" && content.guides && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pt-8">
                {content.guides.map((guide: any, i: number) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-shadow">
                    <h4 className="text-xl font-bold text-slate-900 mb-6">{guide.title}</h4>
                    <ul className="space-y-3">
                      <li className="flex gap-3 text-slate-600 text-sm">Ideal Mattress Type :{guide.mattressType}</li>
                      <li className="flex gap-3 text-slate-600 text-sm">Support Needed :{guide.supportNeeded}</li>
                      <li className="flex gap-3 text-slate-600 text-sm">Features :
                        <ul>
                          {guide.features && guide.features.map((feature: any, j: number) => (
                            <li key={j} className="flex gap-3 text-slate-600 text-sm list-inside">
                              <span className="text-[#E53935] mt-1.5 text-[6px]">■</span>
                              <span>{typeof feature === 'string' ? feature : feature.text}</span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}
