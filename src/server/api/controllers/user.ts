import { z } from "zod";

import { publicProcedure } from "@/server/trpc/procedure";

const isEmailUsed = publicProcedure.input(z.string()).query(
  async ({ input, ctx }) => {
    const member = await ctx.prismaAdmin.member.findUnique({
      select: {
        EMail: true,
      },
      where: {
        EMail: input,
      },
    });

    if (member?.EMail) return true;
    return false;
  },
);

const isUserNameUsed = publicProcedure.input(z.string()).query(
  async ({ input, ctx }) => {
    const user = await ctx.prismaAdmin.member.findUnique({
      select: {
        Account: true,
      },
      where: {
        Account: input,
      },
    });

    if (user?.Account) return true;
    return false;
  },
);

const enable = publicProcedure
  .input(
    z
      .object({
        username: z.string(),
        email: z.string(),
        MID: z.number(),
      })
      .optional(),
  )
  .mutation(async ({ input, ctx }) => {
    if (!input) return;

    await ctx.prismaAdmin.member.update({
      data: {
        Account: input.username,
        Valid: true,
        EMail: input.email,
      },
      where: {
        MID: input.MID,
      },
    });

    return;
  });

const unLinkAccount = publicProcedure
  .input(
    z.object({
      MID: z.number(),
      provider: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const account = await ctx.prismaAdmin.oAuthAccount.findFirst({
      select: {
        providerAccountId: true,
      },
      where: {
        MID: input.MID,
        provider: input.provider,
      },
    });

    if (!account?.providerAccountId) return;

    await ctx.prismaAdmin.oAuthAccount.delete({
      where: {
        provider_providerAccountId: {
          provider: input.provider,
          providerAccountId: account.providerAccountId,
        },
      },
    });
  });

const getLinkedAccount = publicProcedure.input(z.number().optional()).query(
  async ({ input, ctx }) => {
    if (!input) return [];

    const res = await ctx.prismaAdmin.oAuthAccount.findMany({
      select: {
        provider: true,
      },
      where: {
        MID: input,
      },
    });

    return res;
  },
);

export { enable, getLinkedAccount, isEmailUsed, isUserNameUsed, unLinkAccount };
