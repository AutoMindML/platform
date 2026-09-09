import {
  UpdateClassInputSchema,
  UpdateObjectInputSchema,
} from "../schemas/i3s";

import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { TRPCContextWithSession } from "@/server/trpc/procedure";

type UpdateClassInputProps = z.infer<typeof UpdateClassInputSchema>;
type UpdateObjectInputProps = z.infer<typeof UpdateObjectInputSchema>;
type ProcedureContextWithSession<T> = {
  input: T;
  ctx: TRPCContextWithSession;
};
type DBInputProps<T> = {
  p: PrismaClient;
  input: T;
  userId: string;
};

export {
  type DBInputProps,
  type ProcedureContextWithSession,
  type UpdateClassInputProps,
  type UpdateObjectInputProps,
};
