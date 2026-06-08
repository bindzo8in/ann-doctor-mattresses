import { CreateProductInput } from "@/lib/schema/product-form-schema";

export const PRODUCT_STEPS = [
  "Basic Info",
  "Media",
  "Mattress Attributes",
  "Variants",
  "Specifications",
  "Sections",
  "FAQs",
] as const;

export const MATTRESS_SIZES = [
  { value: "SINGLE", label: "Single", width: 36, length: 72 },
  { value: "DOUBLE", label: "Double", width: 48, length: 72 },
  { value: "QUEEN", label: "Queen", width: 60, length: 72 },
  { value: "KING", label: "King", width: 72, length: 72 },
] as const;

export const FIRMNESS_OPTIONS = [
  { value: "SOFT", label: "Soft" },
  { value: "MEDIUM_SOFT", label: "Medium Soft" },
  { value: "MEDIUM", label: "Medium" },
  { value: "MEDIUM_FIRM", label: "Medium Firm" },
  { value: "FIRM", label: "Firm" },
] as const;

export const COMFORT_LEVEL_OPTIONS = [
  { value: "PLUSH", label: "Plush" },
  { value: "BALANCED", label: "Balanced" },
  { value: "SUPPORTIVE", label: "Supportive" },
] as const;

export const AGE_GROUP_OPTIONS = [
  { value: "KIDS", label: "Kids" },
  { value: "TEEN", label: "Teen" },
  { value: "ADULT", label: "Adult" },
  { value: "SENIOR", label: "Senior" },
] as const;

export const WEIGHT_GROUP_OPTIONS = [
  { value: "UNDER_60", label: "Under 60 kg" },
  { value: "KG_60_80", label: "60 - 80 kg" },
  { value: "KG_80_100", label: "80 - 100 kg" },
  { value: "OVER_100", label: "Over 100 kg" },
] as const;

export const SLEEPING_POSITION_OPTIONS = [
  { value: "SIDE", label: "Side Sleeper" },
  { value: "BACK", label: "Back Sleeper" },
  { value: "STOMACH", label: "Stomach Sleeper" },
  { value: "COMBINATION", label: "Combination Sleeper" },
] as const;

export const HEALTH_BENEFIT_OPTIONS = [
  {
    value: "ORTHOPEDIC",
    label: "Orthopedic Support",
  },
  {
    value: "BACK_PAIN_RELIEF",
    label: "Back Pain Relief",
  },
  {
    value: "PRESSURE_RELIEF",
    label: "Pressure Relief",
  },
  {
    value: "COOLING",
    label: "Cooling Comfort",
  },
  {
    value: "MOTION_ISOLATION",
    label: "Motion Isolation",
  },
] as const;

export const defaultValues: CreateProductInput = {
  name: "",
  slug: "",

  type: "MATTRESS",

  shortDescription: [],

  // description: "",

  firmness: "MEDIUM",
  comfortLevel: "BALANCED",
  healthBenefits: [],
  recommendedAgeGroups: [],
  recommendedWeightGroups: [],
  recommendedPositions: [],

  categoryId: "",

  thumbnail: {
    url: "",
    publicId: "",
  },
  // thumbnailUrl: "",
  // thumbnailPublicId: "",

  images: [],

  variants: [],

  allowCustomSize: false,
  minWidth: null,
  maxWidth: null,
  minLength: null,
  maxLength: null,
  customSizePricing: null,

  specifications: [],

  sectionsHeading: "",

  sections: [
    {
      type: "FEATURES_WITH_IMAGE",
      title: "Features",
      sortOrder: 1,
      content: {
        description: "",
        image: null,
        features: [{ title: "", description: "" }],
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