import {
  ProcedureContextWithSession,
  UpdateClassInputProps,
  UpdateObjectInputProps,
} from "../models/i3s";
import { updateClass, updateObject } from "../repositories/i3s";

export const updateClassService = async (
  { input, ctx }: ProcedureContextWithSession<UpdateClassInputProps>,
) => {
  await updateClass(ctx.prismaAdmin, input, ctx.session.user.id);
};

export const updateObjectService = async (
  { input, ctx }: ProcedureContextWithSession<UpdateObjectInputProps>,
) => {
  await updateObject({
    p: ctx.prismaAdmin,
    input,
    userId: ctx.session.user.id,
  });
};
