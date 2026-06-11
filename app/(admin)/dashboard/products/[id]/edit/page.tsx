import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProductForm } from "@/components/forms/product/product-form";
import { CreateProductInput } from "@/lib/schema/product-form-schema";

export const metadata = {
  title: "Edit Product",
  description: "Edit existing product",
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' }
      },
      specifications: true,
      sections: {
        orderBy: { sortOrder: 'asc' }
      },
      faqs: true,
      variants: {
        include: {
          mattressVariant: true,
          sofaVariant: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }



  // Map the database product to the CreateProductInput format expected by the form
  const formattedProduct: CreateProductInput = {
    name: product.name,
    slug: product.slug,
    type: product.type as "MATTRESS" | "SOFA",
    categoryId: product.categoryId,
    shortDescription: product.shortDescription.map((desc, i) => ({ id: i.toString(), text: desc })),
    thumbnail: {
      url: product.thumbnailUrl,
      publicId: product.thumbnailPublicId,
    },
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    firmness: product.firmness || undefined,
    comfortLevel: product.comfortLevel || undefined,
    healthBenefits: product.healthBenefits || undefined,

    recommendedPositions: product.recommendedPositions || undefined,
    availableColors: product.availableColors || undefined,
    allowCustomSize: product.allowCustomSize,
    minWidth: product.minWidth || undefined,
    maxWidth: product.maxWidth || undefined,
    minLength: product.minLength || undefined,
    maxLength: product.maxLength || undefined,
    customSizePricing: product.customSizePricing || undefined,
    images: product.images.map(img => ({
      url: img.url,
      publicId: img.publicId,
      sortOrder: img.sortOrder,
    })),
    specifications: product.specifications.map(spec => ({
      label: spec.label,
      value: spec.value,
    })),
    sectionsHeading: product.sectionHeading,
    sections: product.sections.map(section => ({
      title: "",
      type: section.type,
      content: section.content,
      sortOrder: section.sortOrder,
    })) as CreateProductInput["sections"],
    faqs: product.faqs.map(faq => ({
      question: faq.question,
      answer: faq.answer,
    })),
    variants: product.variants.map((v) => {
      if (product.type === "MATTRESS" && v.mattressVariant) {
        return {
          variantType: "MATTRESS",
          id: v.id,
          mrp: v.mrp.toNumber(),
          salePrice: v.salePrice.toNumber(),
          isDefault: v.isDefault,
          sizeName: v.mattressVariant.sizeName as "SINGLE" | "DOUBLE" | "QUEEN" | "KING" | "CUSTOM",
          width: v.mattressVariant.width,
          length: v.mattressVariant.length,
          thickness: v.mattressVariant.thickness,
        };
      }

      if (product.type === "SOFA" && v.sofaVariant) {
        return {
          variantType: "SOFA",
          id: v.id,
          mrp: v.mrp.toNumber(),
          salePrice: v.salePrice.toNumber(),
          isDefault: v.isDefault,
          seatCount: v.sofaVariant.seatCount,
          material: v.sofaVariant.material,
          shape: v.sofaVariant.shape || undefined,
        };
      }

      return null;
    }).filter(Boolean) as CreateProductInput["variants"],
  };


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
      </div>
      <div className="mx-auto mt-6 bg-white p-6 rounded-lg shadow-sm border border-border">
        <ProductForm initialData={formattedProduct} productId={product.id} />
      </div>
    </div>
  );
}
