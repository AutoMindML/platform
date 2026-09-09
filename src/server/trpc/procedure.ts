import { prismaAdmin } from "../db";
import { transformer } from "./shared";

import { initTRPC, TRPCError } from "@trpc/server";
import { Session } from "next-auth";
import { ZodError } from "zod";

export const createTRPCContext = (
  opt: { headers: Headers; session?: Session | null },
) => {
  return {
    ...opt,
    prismaAdmin,
  };
};

export type TRPCContextWithSession =
  & Omit<ReturnType<typeof createTRPCContext>, "session">
  & {
    session: Session;
  };

const t = initTRPC.context<typeof createTRPCContext>().create({
  // migrate to v11: transformers moved to here
  transformer,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError
          ? error.cause.flatten()
          : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const createCallerFactory = t.createCallerFactory;
