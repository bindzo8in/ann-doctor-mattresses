import * as z from "zod";

export interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
  inputs?: T;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const isBrowser = typeof window !== "undefined";

const fileSchema = z
  .any()
  .refine((file) => {
    if (!file) return false;

    if (!isBrowser) return true;

    return file instanceof File;
  }, "Invalid file")
  .refine((file) => {
    if (!file || !isBrowser) return true;

    return ["image/png", "image/jpeg", "image/webp"].includes(file.type);
  }, "Invalid image type")
  .refine((file) => {
    if (!file || !isBrowser) return true;

    return file.size <= MAX_FILE_SIZE;
  }, "File size must be less than 5MB");

export const productSchema = z.object({
  name: z.string({ error: "This field is required" }).nonempty(),
  shortDescription: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      }),
      { error: "Please enter at least one tag" },
    )
    .min(1, "Please enter at least one tag")
    .nullable(),
  description: z.string({ error: "This field is required" }).optional(),
  thumbnail: z.union([
    fileSchema,
    z.array(fileSchema).nonempty(),
    z.string().min(1),
  ]),

  images: z.union([
    fileSchema,
    z.array(fileSchema).nonempty(),
    z.string().min(1),
  ]),
  categoryId: z.string().min(1, "Please select an item"),
  isFeatured: z.boolean({ error: "This field is required" }),
  isActive: z.boolean({ error: "This field is required" }),
});

export type ProductInput = z.infer<typeof productSchema>;
