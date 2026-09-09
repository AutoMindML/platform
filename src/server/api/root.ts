import * as appContoller from "./controllers/app";
import * as automlController from "./controllers/automl";
import * as datasetController from "./controllers/dataset";
import * as engineController from "./controllers/engine";
import * as i3sController from "./controllers/i3s";
import * as modelController from "./controllers/model";
import * as projectController from "./controllers/project";
import * as userController from "./controllers/user";

import { createCallerFactory, createTRPCRouter } from "@/server/trpc/procedure";

const dataset = createTRPCRouter({
  ...datasetController,
});
const user = createTRPCRouter({
  ...userController,
});
const project = createTRPCRouter({
  ...projectController,
});

const i3s = createTRPCRouter({
  ...i3sController,
});
const model = createTRPCRouter({
  ...modelController,
});
const engine = createTRPCRouter({
  ...engineController,
});

const app = createTRPCRouter({
  ...appContoller,
});
const automl = createTRPCRouter({
  ...automlController,
});

export const appRouter = createTRPCRouter({
  dataset,
  user,
  project,
  i3s,
  model,
  app,
  engine,
  automl,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
