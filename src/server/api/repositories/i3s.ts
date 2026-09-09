import {
  DBInputProps,
  UpdateClassInputProps,
  UpdateObjectInputProps,
} from "../models/i3s";

import { PrismaClient } from "@prisma/client";

const updateClass = async (
  p: PrismaClient,
  input: UpdateClassInputProps,
  userId: string,
) => {
  await p.class.update({
    where: {
      CID: input.cid,
      OwnerMID: Number(userId),
    },
    data: {
      EName: input.name,
      CDes: input.des,
    },
  });
};

const updateObject = async (
  { p, input, userId }: DBInputProps<UpdateObjectInputProps>,
) => {
  await p.object.update({
    where: {
      OID: input.oid,
      OwnerMID: Number(userId),
    },
    data: {
      CName: input.name,
      CDes: input.des,
    },
  });
};

export { updateClass, updateObject };
