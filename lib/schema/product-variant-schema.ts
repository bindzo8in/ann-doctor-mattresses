import z from "zod";
import { mattressVariantSchema } from "./mattress-variant-schema";
import { sofaVariantSchema } from "./sofa-variant-schema";

export const productVariantSchema = z.discriminatedUnion("variantType", [
  mattressVariantSchema,
  sofaVariantSchema,
]);
