import { MetadataStatus, ViewDataFusion } from "../models/automl";
import {
  ApplierProcessingBodySchema,
  GenerateMetadataPrompt,
  LLMResponse,
  SaveDataFusionSchema,
} from "../schemas/automl";
import { AddObjectBasicSchema, MutationResponseResult } from "../schemas/i3s";
import {
  FetchAutoMindServerWithCommonResponse,
  FetchAutoMindServerWithCsvResponse,
} from "../services/automind";

import { z } from "zod";

import { ObjectPosition } from "@/app/[lng]/automl/data/fusion/[id]/_components/schema";
import { env } from "@/env.mjs";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/procedure";
import { csvStr2Array } from "@/utils/transformer/csv";

const initDataFusion = protectedProcedure.input(AddObjectBasicSchema)
  .mutation(async ({ input, ctx }) => {
    const res = await fetch(
      env.AUTOMIND_BACKEND_URL + "/api/automl/fusion/init",
      {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
          "X-User-Id": ctx.session.user.id,
        }),
        body: JSON.stringify(input),
      },
    );

    const result: MutationResponseResult = await res.json();
    return result;
  });

const putDataFusion = protectedProcedure.input(SaveDataFusionSchema).mutation(
  async ({ input, ctx }) => {
    const body = {
      fusion_id: input.fusion_id,
      target_dataset_id: input.target_dataset_id,
      dataset_ids: input.dataset_ids,
      primary_keys: input.primary_keys,
      relationships: input.relationships.map((v) =>
        `${v.fromTable},${v.fromColumn};${v.toTable},${v.toColumn}`
      ),
      position: input.position,
    };
    const res = await fetch(
      env.AUTOMIND_BACKEND_URL + "/api/automl/fusion/save",
      {
        method: "PUT",
        headers: new Headers({
          "Content-Type": "application/json",
          "X-User-Id": ctx.session.user.id,
        }),
        body: JSON.stringify(body),
      },
    );

    const result: MutationResponseResult = await res.json();
    return result;
  },
);

const getSavedDataFusion = protectedProcedure.input(z.number()).query(
  async ({ input, ctx }) => {
    const res = await fetch(
      env.AUTOMIND_BACKEND_URL + `/api/automl/fusion/${input}`,
      {
        method: "GET",
        headers: new Headers({
          "Content-Type": "application/json",
          "X-User-Id": ctx.session.user.id,
        }),
      },
    );

    const result: ViewDataFusion = await res.json();

    // ["id_1,key_1;id_2,key_2", "..."]
    const relationships: string[] = JSON.parse(
      result.relationships,
    );

    return {
      fusion_id: result.fusion_id,
      target_dataset_id: result.target_dataset_id,
      primary_keys: result.primary_keys.split(","),
      dataset_ids: result.dataset_ids.split(","),
      position: JSON.parse(result.position) as ObjectPosition[],
      relationships: relationships.map((v) => {
        const connectionPair = v.split(";");

        const from = connectionPair[0].split(",");
        const fromId = from[0];
        const fromColumn = from[1];

        const to = connectionPair[1].split(",");
        const toId = to[0];
        const toColumn = to[1];

        return {
          "id": `${fromId}_${fromColumn}_${toId}_${toColumn}`,
          "fromTable": fromId,
          "fromColumn": fromColumn,
          "toTable": toId,
          "toColumn": toColumn,
        };
      }),
    };
  },
);

const getFeatureGenerated = protectedProcedure.input(z.number()).query(
  async ({ input, ctx }) => {
    const res = await fetch(
      env.AUTOMIND_BACKEND_URL + `/api/automl/fusion/${input}/generate`,
      {
        method: "GET",
        headers: new Headers({
          "Content-Type": "application/json",
          "X-User-Id": ctx.session.user.id,
        }),
      },
    );

    if (res.status === 200) {
      const data = await (await res.blob()).text();
      return csvStr2Array(data);
    }

    return [];
  },
);

const postFeatureGenerated = protectedProcedure.input(z.number()).mutation(
  async ({ input, ctx }) => {
    const res = await fetch(
      env.AUTOMIND_BACKEND_URL + `/api/automl/fusion/${input}/merge`,
      {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
          "X-User-Id": ctx.session.user.id,
        }),
      },
    );

    const result: MutationResponseResult = await res.json();
    return result;
  },
);

const generateMetadataPrompt = protectedProcedure.input(GenerateMetadataPrompt)
  .mutation(
    async ({ input, ctx }) => {
      return FetchAutoMindServerWithCommonResponse({
        method: "POST",
        path:
          `/api/automl/metadata/${input.dataset_id}?target_column=${input.target_column}`,
        ctx,
      });
    },
  );

const getMetadataPrompt = protectedProcedure.input(z.number()).query(
  async ({ input, ctx }) => {
    return FetchAutoMindServerWithCommonResponse({
      method: "GET",
      path: `/api/automl/metadata/${input}`,
      ctx,
    });
  },
);

const getMetadataStatus = protectedProcedure.input(z.number()).query(
  async ({ input, ctx }) => {
    return FetchAutoMindServerWithCommonResponse<MetadataStatus>({
      method: "GET",
      path: `/api/automl/metadata/${input}/status`,
      ctx,
    });
  },
);

const previewApplierActions = protectedProcedure.input(z.number()).query(
  async ({ input, ctx }) => {
    return FetchAutoMindServerWithCommonResponse<LLMResponse[]>({
      method: "GET",
      path: `/api/automl/applier/${input}/preview/actions`,
      ctx,
    });
  },
);

const previewApplierProcessingResult = protectedProcedure.input(
  z.object({ dataset_id: z.number(), body: ApplierProcessingBodySchema }),
)
  .mutation(
    async ({ input, ctx }) => {
      return FetchAutoMindServerWithCsvResponse({
        method: "POST",
        path: `/api/automl/applier/${input.dataset_id}/preview/processing`,
        ctx,
        body: input.body,
      });
    },
  );

const saveApplierProcessingResult = protectedProcedure.input(
  z.object({ dataset_id: z.number(), body: ApplierProcessingBodySchema }),
).mutation(
  async ({ input, ctx }) => {
    return FetchAutoMindServerWithCommonResponse({
      method: "POST",
      path: `/api/automl/applier/${input.dataset_id}/save`,
      ctx,
      body: input.body,
    });
  },
);

export const fusion = createTRPCRouter({
  initDataFusion,
  putDataFusion,
  getSavedDataFusion,
  getFeatureGenerated,
  postFeatureGenerated,
});

export const metadata = createTRPCRouter({
  generateMetadataPrompt,
  getMetadataPrompt,
  getMetadataStatus,
});

export const applier = createTRPCRouter({
  previewApplierActions,
  previewApplierProcessingResult,
  saveApplierProcessingResult,
});
