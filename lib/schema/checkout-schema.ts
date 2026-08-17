import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.email("Valid email address is required").optional().or(z.literal("")),
  phone: z.string()
    .transform((val) => {
      const digits = val.replace(/\D/g, "");
      if (digits.length === 12 && digits.startsWith("91")) {
        return digits.slice(2);
      }
      if (digits.length === 11 && digits.startsWith("0")) {
        return digits.slice(1);
      }
      return digits;
    })
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: "Valid 10-digit Indian phone number is required (starting with 6-9)",
    }),
  addressLine1: z.string().min(5, "Address Line 1 is required"),
  addressLine2: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string()
    .transform((val) => val.replace(/\s+/g, "").replace(/-+/g, ""))
    .refine((val) => /^[1-9]\d{5}$/.test(val), {
      message: "Valid 6-digit Indian PIN code is required",
    }),
  country: z.string().refine(
    (val) => ["india", "in"].includes(val.toLowerCase().trim()),
    { message: "Delivery is only available in India" }
  ),
  isDefault: z.boolean().default(false).optional(),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const checkoutSchema = z.object({
  addressId: z.string().optional(),
  address: addressSchema.optional(),
  notes: z.string().optional(),
});

export const promotionSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["BUY_X_GET_Y"]),
  isActive: z.boolean().default(true),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  buyQuantity: z.number().int().min(1).default(1),
  getQuantity: z.number().int().min(1).default(1),
  productIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
});

export const trackingSchema = z.object({
  courierName: z.string().min(2, "Courier name is required"),
  trackingNumber: z.string().min(2, "Tracking number is required"),
  trackingUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
