import {
  AddObjectBasicSchema,
  MutationResponseResult,
  UpdateClassInputSchema,
} from "../schemas/i3s";
import { updateClassService } from "../services/i3s";

import { z } from "zod";

import { env } from "@/env.mjs";
import { protectedProcedure } from "@/server/trpc/procedure";

const getManyProjects = protectedProcedure.query(
  async ({ ctx }) => {
    const projects = await ctx.prismaAdmin.vd_Project.findMany({
      where: { owner_mid: Number(ctx.session.user.id) },
      orderBy: { created_at: "desc" },
    });
    return projects;
  },
);

const getProject = protectedProcedure.input(z.string()).query(
  async ({ ctx, input }) => {
    const project = await ctx.prismaAdmin.vd_Project.findFirst({
      where: {
        AND: [{ owner_mid: Number(ctx.session.user.id) }, {
          cid: Number(input),
        }],
      },
    });

    return project;
  },
);

const addProject = protectedProcedure.input(
  AddObjectBasicSchema,
).mutation(async ({ input, ctx }) => {
  const res = await fetch(
    env.AUTOMIND_BACKEND_URL + "/api/project",
    {
      method: "POST",
      body: JSON.stringify(input),
      headers: new Headers({
        "Content-Type": "application/json",
        "X-User-Id": ctx.session.user.id,
      }),
    },
  );

  const result: MutationResponseResult = await res.json();
  return result;
});

const deleteProject = protectedProcedure.input(
  z.number(),
).mutation(async ({ input, ctx }) => {
  const res = await fetch(
    env.AUTOMIND_BACKEND_URL + "/api/project",
    {
      method: "DELETE",
      body: JSON.stringify({
        cid: input,
      }),
      headers: new Headers({
        "Content-Type": "application/json",
        "X-User-Id": ctx.session.user.id,
      }),
    },
  );

  return { status: res.status == 200 ? 0 : -1 };
});

const updateProject = protectedProcedure.input(UpdateClassInputSchema).mutation(
  updateClassService,
);

const getProject_ModelsBasicInfo = protectedProcedure.input(
  z.optional(z.number()),
).query(
  async ({ input, ctx }) => {
    const models = await ctx.prismaAdmin.vd_Model.findMany({
      distinct: ["model_id"],
      where: {
        AND: [{ owner_mid: Number(ctx.session.user.id) }, {
          project_id: input,
        }],
      },
      orderBy: { created_at: "desc" },
    });

    return models;
  },
);

const getProject_ManyApp = protectedProcedure.input(z.number().optional())
  .query(
    async ({ input, ctx }) => {
      const apps = await ctx.prismaAdmin.vd_App_Prediction.findMany({
        where: {
          owner_mid: Number(ctx.session.user.id),
          project_id: input,
        },
      });

      return apps;
    },
  );

export {
  addProject,
  deleteProject,
  getManyProjects,
  getProject,
  getProject_ManyApp,
  getProject_ModelsBasicInfo,
  updateProject,
};
