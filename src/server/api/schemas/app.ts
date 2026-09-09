import { z } from "zod";

const PostAppDeployment = z.object({
  input: z.array(z.record(z.string().or(z.number()).optional())),
  model_id: z.string(),
  limit: z.number(),
});

export const AppAPICallSchema = z.object({
  api_key: z.string(),
  deployment_id: z.string(),
  body: PostAppDeployment,
});
