import { CreateProductInput } from "@/lib/schema/product-form-schema";

export const PRODUCT_STEPS = [
  "Basic Info",
  "Media",
  "Variants",
  "Specifications",
  "Sections",
  "FAQs",
] as const;

export const defaultValues: CreateProductInput = {
  name: "",
  slug: "",

  type: "MATTRESS",

  shortDescription: [],

  description: "",

  categoryId: "",

  thumbnail: null,
  // thumbnailUrl: "",
  // thumbnailPublicId: "",

  images: [],

  variants: [],

  specifications: [],

  sections: [
    {
      type: "FEATURES_WITH_IMAGE",
      title: "Features",
      sortOrder: 1,
      content: {
        description: "",
        image: null,
        features: [],
      },
    },

    {
      type: "IMAGE_COMPARISON",
      title: "Comparison",
      sortOrder: 2,
      content: {
        items: [
          {
            label: "",
            image: null,
          },
          {
            label: "",
            image: null,
          },
        ],
      },
    },

    {
      type: "SLEEPER_GUIDE",
      title: "Sleeper Guide",
      sortOrder: 3,
      content: {
        guides: [],
      },
    },
  ],

  faqs: [],

  isFeatured: false,
  isActive: true,
};

export const SOFA_SHAPES = [
  { value: "STRAIGHT", label: "Straight Sofa" },
  { value: "L_SHAPE", label: "L Shape Sofa" },
  { value: "U_SHAPE", label: "U Shape Sofa" },
  { value: "CORNER", label: "Corner Sofa" },
  { value: "RECLINER", label: "Recliner Sofa" },
  { value: "SOFA_CUM_BED", label: "Sofa Cum Bed" },
] as const;
