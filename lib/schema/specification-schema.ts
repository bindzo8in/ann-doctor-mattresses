import z from "zod";

export const specificationSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});
