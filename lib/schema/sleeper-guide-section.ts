import z from "zod";

export const tagSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
});

export const sleeperGuideSectionSchema = z.object({
  guides: z
    .array(
      z.object({
        title: z.string().min(1),

        mattressType: z.string().min(1),

        supportNeeded: z.string().min(1),

        features: z.array(tagSchema).min(1),
      }),
    )
    .min(1),
});
