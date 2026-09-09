import { MutationResponseResult } from "../schemas/i3s";

import { z } from "zod";

import { env } from "@/env.mjs";
import { protectedProcedure } from "@/server/trpc/procedure";
import { csvStr2Array } from "@/utils/transformer/csv";

export const getManyDatasets = protectedProcedure.query(
  async ({ ctx }) => {
    const sources = await ctx.prismaAdmin.vd_Data_Source.findMany({
      where: { owner_mid: Number(ctx.session.user.id) },
      orderBy: { created_at: "desc" },
    });

    return sources;
  },
);

export const getDatasetInfo = protectedProcedure.input(z.string().optional()).query(
  async ({ ctx, input }) => {
    if (!input) {
      return null;
    }

    const source = await ctx.prismaAdmin.vd_Data_Source.findFirst({
      where: {
        AND: [
          {
            owner_mid: Number(ctx.session.user.id),
          },
          {
            oid: Number(input),
          },
        ],
      },
    });

    return source;
  },
);

export const getDatasetContent = protectedProcedure.input(z.number().optional())
  .query(
    async ({ input, ctx }) => {
      if (!input) {
        return {};
      }

      const res = await fetch(
        env.AUTOMIND_BACKEND_URL +
          `/api/dataset/${input}/preview`,
        {
          method: "GET",
          headers: new Headers({
            "X-User-Id": ctx.session.user.id,
          }),
        },
      );

      if (res.status != 200) {
        return { status: -1, content: null };
      }

      const data = await (await res.blob()).text();
      return { status: 0, content: csvStr2Array(data) };
    },
  );

export const getDatasetPreview = protectedProcedure.input(z.array(z.string()))
  .query(
    async ({ input, ctx }) => {
      const result = await Promise.all(input.map(async (id) => {
        const res = await fetch(
          env.AUTOMIND_BACKEND_URL +
            `/api/dataset/${id}/preview`,
          {
            method: "GET",
            headers: new Headers({
              "X-User-Id": ctx.session.user.id,
            }),
          },
        );
        if (res.status === 200) {
          const data = await (await res.blob()).text();
          return csvStr2Array(data);
        }
        return [];
      }));

      return input.reduce(
        (acc, id, idx) => {
          acc[id] = result[idx];
          return acc;
        },
        {} as { [id: string]: Record<string, unknown>[] },
      );
    },
  );

export const deleteDataset = protectedProcedure.input(z.number()).mutation(
  async ({ input, ctx }) => {
    const res = await fetch(
      env.AUTOMIND_BACKEND_URL + "/api/dataset/" + input.toString(),
      {
        method: "DELETE",
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
