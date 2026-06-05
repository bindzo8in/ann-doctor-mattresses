import { ProductSection } from "@/app/generated/prisma/browser";
import Image from "next/image";

interface Props {
  sections: ProductSection[];
}

export function ProductSectionsRenderer({ sections }: Props) {
  if (!sections?.length) return null;

  return (
    <div className="space-y-16">
      {sections.map((section) => {
        const content = section.content as any;
        const title = content?.title || null;
        const subtitle = content?.subtitle || null;
        const textContent = content?.content || null;
        const imageUrl = content?.imageUrl || null;

        return (
        <div key={section.id} id={`section-${section.id}`} className="space-y-6">
          {(title || subtitle) && (
            <div className="space-y-2">
              {title && <h3 className="text-2xl font-bold tracking-tight">{title}</h3>}
              {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
            </div>
          )}

          {/* Render based on type */}
          {section.type === "TEXT" && textContent && (
            <div className="prose prose-slate max-w-none dark:prose-invert">
              {textContent}
            </div>
          )}

          {section.type === "IMAGE" && imageUrl && (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
              <Image
                src={imageUrl}
                alt={title || "Section Image"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
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
                  <Image
                    src={imageUrl}
                    alt={title || "Section Image"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {section.type === "HTML" && textContent && (
            <div 
              className="prose prose-slate max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: textContent }} 
            />
          )}

          {section.type === "FEATURE_GRID" && textContent && (
            <div className="bg-muted/50 p-6 rounded-xl border border-border">
              {textContent}
            </div>
          )}
        </div>
      )})}
    </div>
  );
}
