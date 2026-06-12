import z from "zod";

export const tagSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
});

export const sleeperGuideSectionSchema = z.object({
  guides: z
    .array(
      z.object({
        title: z.string(),

        mattressType: z.string(),

        supportNeeded: z.string(),

        features: z.array(tagSchema),
      }),
    )
});
