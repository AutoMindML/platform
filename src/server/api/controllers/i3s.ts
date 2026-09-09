import { UpdateObjectInputSchema } from "../schemas/i3s";
import { updateObjectService } from "../services/i3s";

import { protectedProcedure } from "@/server/trpc/procedure";

export const updateObject = protectedProcedure.input(UpdateObjectInputSchema)
  .mutation(updateObjectService);
