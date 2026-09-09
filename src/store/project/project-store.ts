import { WithSetState } from "../adapter/shared";

import { createStore } from "zustand/vanilla";

import { DatasetTable } from "@/types/dataset";
import { HTTP_METHOD } from "@/types/web/http";

type CurrentModelInfo = {
  id: number | null;
  name: string;
  description: string;
};

export type Endpoint = {
  id: string;
  method: HTTP_METHOD;
  path: string;
  description: string;
};

// -------------------- State Interface --------------------
export interface ProjectStoreState {
  currentModelInfo: CurrentModelInfo;
  openAddModal: boolean;
  openEditModal: boolean;
  openDeleteModal: boolean;
  openValidationModal: boolean;
  selectedDatasetId: number | null;
  selectedModelId: number | null;
  predictedResult: DatasetTable;
  selectedEndpoint: Endpoint | null;
  showKey: boolean;
  apiCallRequestCode?: string;
  apiCallResponse?: string;
}

// -------------------- Store Implementation --------------------
export const createProjectStore = () => {
  return createStore<WithSetState<ProjectStoreState>>((set, get) => ({
    currentModelInfo: {
      id: null,
      name: "",
      description: "",
    },
    showKey: false,
    openAddModal: false,
    openEditModal: false,
    openDeleteModal: false,
    openValidationModal: false,
    selectedDatasetId: null,
    selectedModelId: null,
    predictedResult: [],
    selectedEndpoint: null,

    // -------------------- Actions --------------------
    setState(newState) {
      set(newState);
    },
  }));
};
