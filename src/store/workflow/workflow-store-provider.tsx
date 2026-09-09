"use client";

import { createZustandStore } from "../adapter/next";
import { createWorkflowStore } from "./workflow-store";

const [WorkflowStoreProvider, useWorkflowStore] = createZustandStore(
  createWorkflowStore,
);

export { useWorkflowStore, WorkflowStoreProvider };
