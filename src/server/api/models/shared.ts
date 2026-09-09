import { z } from "zod";

export const GeneralStatusSchema = z.enum([
  "unavailable",
  "generating",
  "complete",
  "training",
]);

export type GeneralStatus = z.infer<typeof GeneralStatusSchema>;
