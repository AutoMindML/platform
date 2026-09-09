import { GeneralStatusSchema } from "./shared";

import { z } from "zod";

export const ModelDisplaySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  dataset: z.string(),
  status: GeneralStatusSchema,
  accuracyValue: z.number(),
  f1ScoreValue: z.number(),
  formatAccuracy: z.string(),
  formatF1Score: z.string(),
  startTime: z.string(),
  estimatedCompletion: z.string(),
  created: z.date(),
  updated: z.date(),
});

export type ModelDisplay = z.infer<typeof ModelDisplaySchema>;
