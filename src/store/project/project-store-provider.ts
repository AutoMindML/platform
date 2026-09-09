"use client";

import { createProjectStore } from "./project-store";
import { createZustandStore } from "../adapter/next";

const [ProjectStoreProvider, useProjectStore] = createZustandStore(
  createProjectStore,
);

export { ProjectStoreProvider, useProjectStore };
