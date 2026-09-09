import { AppAPICallSchema } from "../schemas/app";
import { testAutoMindAppWithJSONResponse } from "../services/app";
import { FetchAutoMindServerWithCommonResponse } from "../services/automind";

import { z } from "zod";

import { protectedProcedure } from "@/server/trpc/procedure";

export const createApp = protectedProcedure.input(
  z.object({
    project_id: z.number(),
    name: z.string(),
    des: z.string(),
  }),
).mutation(async ({ input, ctx }) => {
  return await FetchAutoMindServerWithCommonResponse(
    {
      path: "/api/app",
      method: "POST",
      ctx,
      body: input,
    },
  );
});

export const deleteApp = protectedProcedure.input(
  z.number(),
).mutation(async ({ input, ctx }) => {
  return await FetchAutoMindServerWithCommonResponse({
    path: "/api/app",
    ctx,
    method: "DELETE",
    body: { app_id: input },
  });
});

export const getAppInfo = protectedProcedure.input(z.number()).query(
  async ({ input, ctx }) => {
    return await ctx.prismaAdmin.vd_App_Prediction.findFirst({
      where: {
        project_id: input,
        owner_mid: Number(ctx.session.user.id),
      },
    });
  },
);

export const getManyApps = protectedProcedure.query(async ({ ctx }) => {
  const apps = await ctx.prismaAdmin.vd_App_Prediction.findMany({
    where: {
      owner_mid: Number(ctx.session.user.id),
    },
  });

  return apps;
});

export const appAPICall = protectedProcedure.input(
  AppAPICallSchema,
).mutation(async ({ input }) => {
  return await testAutoMindAppWithJSONResponse({
    apiKey: input.api_key,
    deploymentId: input.deployment_id,
    body: input.body,
  });
});
