import { WithSetState } from "../adapter/shared";

import { createStore } from "zustand/vanilla";

import { GeneralStatus } from "@/server/api/models/shared";
import {
  DataCleaningOptions,
  FeatureEngineeringOptions,
  TaskOptions,
} from "@/server/api/schemas/automl";
import { type DatasetTable } from "@/types/dataset";

// -------------------- State Interface --------------------
export interface WorkflowStoreState {
  // -------------------- Navigation --------------------
  activeStep: number;
  maxActiveStep: number;
  onStepNext: () => void;
  onStepBack: () => void;

  // -------------------- Status & Flags --------------------
  metadataStatus: GeneralStatus;
  metadataComplete: boolean;

  cleaningStatus: GeneralStatus;
  cleaningComplete: boolean;

  featureStatus: GeneralStatus;
  featureComplete: boolean;

  generateDatasetStatus: GeneralStatus;

  // -------------------- Configuration & Options --------------------
  targetColumn: string;
  cleaningOptions: DataCleaningOptions;
  featureOptions: FeatureEngineeringOptions;
  taskOptions: TaskOptions;

  // -------------------- Data Previews & Results --------------------
  cleaningResultPreview: DatasetTable;
  engineeringResultPreview: DatasetTable;

  // -------------------- UI State --------------------
  showDataInfo: boolean;
  actionIndex: number;
  modelingApproachIndex: number;
}

// -------------------- Store Implementation --------------------
export const createWorkflowStore = () => {
  return createStore<WithSetState<WorkflowStoreState>>((set, get) => ({
    // -------------------- Navigation --------------------
    activeStep: 0,
    maxActiveStep: 5,

    // -------------------- Status & Flags --------------------
    metadataStatus: "unavailable",
    metadataComplete: false,

    cleaningStatus: "unavailable",
    cleaningComplete: false,

    featureStatus: "unavailable",
    featureComplete: false,

    generateDatasetStatus: "unavailable",

    // -------------------- Configuration & Options --------------------
    targetColumn: "",
    cleaningOptions: {
      missing_values: {},
      sampling: {},
    },
    featureOptions: {
      encoding: {},
      extraction: {},
      transformation: {},
    },
    taskOptions: { type: "CLASSIFICATION", discretize: true },

    // -------------------- Data Previews & Results --------------------
    cleaningResultPreview: [],
    engineeringResultPreview: [],

    // -------------------- UI State --------------------
    showDataInfo: false,
    actionIndex: 0,
    modelingApproachIndex: 0,

    // -------------------- Actions --------------------
    setState(newState) {
      set(newState);
    },

    onStepNext() {
      const prev = get();
      if (prev.activeStep < prev.maxActiveStep - 1) {
        set({ activeStep: prev.activeStep + 1 });
      }
    },

    onStepBack() {
      const prev = get();
      if (prev.activeStep > 0) {
        set({ activeStep: prev.activeStep - 1 });
      }
    },
  }));
};
