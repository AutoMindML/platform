import { protectedProcedure } from "@/server/trpc/procedure";

export const getManyEngines = protectedProcedure.query(async ({ ctx }) => {
  const engines = await ctx.prismaAdmin.vd_ML_Engine.findMany({
    where: {
      OR: [
        {
          owner_mid: Number(ctx.session.user.id),
        },
        {
          engine_type: "system",
        },
      ],
    },

    orderBy: { created_at: "desc" },
  });

  return engines;
});
