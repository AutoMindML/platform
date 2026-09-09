import { ModelDisplay, ModelDisplaySchema } from "../models/model";
import { GeneralStatus } from "../models/shared";
import {
  MutationResponseResult,
  MutationResponseResultOnlyMessage,
} from "../schemas/i3s";
import { FetchAutoMindServerWithCsvResponse } from "../services/automind";

import { z } from "zod";

import { env } from "@/env.mjs";
import { protectedProcedure } from "@/server/trpc/procedure";

export const getManyModelsBasicInfo = protectedProcedure.query(
  async ({ ctx }) => {
    const models = await ctx.prismaAdmin.vd_Model.findMany({
      distinct: ["model_id"],
      where: {
        owner_mid: Number(ctx.session.user.id),
      },
    });

    return models;
  },
);

export const addModel = protectedProcedure.input(
  z.object({
    projectId: z.number(),
    dataId: z.number(),
    engineId: z.number(),
    name: z.string(),
    des: z.string(),
    predict: z.string(),
    tag: z.string(),
    selectDataQuery: z.string(),
    trainingOptions: z.array(z.string()),
  }),
).mutation(async ({ input, ctx }) => {
  await fetch(
    env.AUTOMIND_BACKEND_URL + "/api/automl/model/train",
    {
      method: "POST",
      body: JSON.stringify({
        cid: input.projectId,
        data_oid: input.dataId,
        engine_oid: input.engineId,
        name: input.name.trim(),
        des: input.des,
        predict: input.predict.trim(),
        tag: input.tag.trim(),
        select_data_query: input.selectDataQuery,
        training_options: input.trainingOptions.join(","),
      }),
      headers: new Headers({
        "Content-Type": "application/json",
        "X-User-Id": ctx.session.user.id,
      }),
    },
  );
});

export const deleteModel = protectedProcedure.input(
  z.object({ modelId: z.number() }),
).mutation(
  async ({ input, ctx }): Promise<MutationResponseResultOnlyMessage> => {
    const model = await ctx.prismaAdmin.vd_Model.findFirst(
      {
        select: { project_id: true },
        where: { model_id: input.modelId },
      },
    );

    if (!model?.project_id) {
      return {
        "state": 1,
        "message": "Model must has project id",
      };
    }

    await fetch(
      env.AUTOMIND_BACKEND_URL + "/api/automl/model",
      {
        method: "DELETE",
        body: JSON.stringify({
          project_id: model.project_id,
          model_id: input.modelId,
        }),
        headers: new Headers({
          "Content-Type": "application/json",
          "X-User-Id": ctx.session.user.id,
        }),
      },
    );

    return { "state": 0, "message": "Delete model successfully" };
  },
);

export const getModelDetail = protectedProcedure.input(z.number().optional())
  .query(
    async ({ ctx, input }) => {
      const model = await ctx.prismaAdmin.vd_Model.findFirst({
        where: {
          owner_mid: Number(ctx.session.user.id),
          model_id: input,
        },
      });

      return model;
    },
  );

export const getAllProjectModel = protectedProcedure.input(z.number()).output(
  z.array(ModelDisplaySchema),
)
  .query(
    async ({ ctx, input }) => {
      const allModel = await ctx.prismaAdmin.vd_Model.findMany({
        where: {
          owner_mid: Number(ctx.session.user.id),
          project_id: input,
        },
        orderBy: {
          created_at: "desc",
        },
      });

      return allModel.map<ModelDisplay>((model) => {
        const score = model.score ? JSON.parse(model.score) : {};
        return {
          status: (model.status ?? "unavailable") as GeneralStatus,
          estimatedCompletion: model.training_time
            ? (model.training_time / 60).toFixed(1) + " min"
            : "0 min",
          startTime: model.created_at.toLocaleString(),
          dataset: "...",
          name: model.name ?? "...",
          description: model.description ?? "...",
          id: model.model_id,
          formatAccuracy: score.accuracy
            ? (Number(score.accuracy) * 100).toFixed(1)
            : "...",
          accuracyValue: score.accuracy ?? 0,
          f1ScoreValue: score.f1 ?? 0,
          formatF1Score: score.f1 ? (Number(score.f1) * 100).toFixed(1) : "...",
          created: model.created_at,
          updated: model.updated_at,
        };
      });
    },
  );

export const modelPredict = protectedProcedure.input(
  z.object({
    dataset_id: z.number(),
    project_id: z.number(),
    model_id: z.number(),
  }),
)
  .mutation(
    async ({ input, ctx }) => {
      return FetchAutoMindServerWithCsvResponse({
        method: "POST",
        path: `/api/automl/model/predict`,
        ctx,
        body: input,
      });
    },
  );
