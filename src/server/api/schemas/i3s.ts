import { z } from "zod";

export const UpdateClassInputSchema = z.object({
  cid: z.number(),
  name: z.string(),
  des: z.string(),
});

export const UpdateObjectInputSchema = z.object({
  oid: z.number(),
  name: z.string(),
  des: z.string(),
});

export const AddObjectBasicSchema = z.object({
  name: z.string(),
  des: z.string(),
});

export interface MutationResponseResultOnlyMessage {
  state: number;
  message: string;
}

export interface MutationResponseResult<T = object | string>
  extends MutationResponseResultOnlyMessage {
  new_id: number | null;
  content: T | null;
}
