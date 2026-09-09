import { GeneralStatus } from "./shared";
import { ViewDataFusionSchema } from "../schemas/automl";

import { z } from "zod";

export type ViewDataFusion = z.infer<typeof ViewDataFusionSchema>;

export type MetadataStatus = {
  metadata_status: GeneralStatus;
  applier_status: GeneralStatus;
  target_column: string;
};
