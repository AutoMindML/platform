import { create } from "zustand";

export type ViewStatus = "grid" | "list";
export type SortAction = "name" | "created_at" | "updated_at" | "id";
export type ToolbarState = {
  view: ViewStatus;
  sortBy: SortAction;
  isDescending: boolean;
  search: string;
  filterType: string;
};

interface ToolbarStoreProps extends ToolbarState {
  setActions: (
    v: {
      view: ViewStatus;
      sortBy: SortAction;
      isDescending: boolean;
      search: string;
      filterType: string;
    },
  ) => void;
}

export const useToolbarStore = create<
  ToolbarStoreProps
>()((set) => ({
  view: "list",
  sortBy: "created_at",
  isDescending: true,
  search: "",
  filterType: "all",

  setActions(v) {
    set({
      view: v.view,
      sortBy: v.sortBy,
      isDescending: v.isDescending,
      search: v.search,
      filterType: v.filterType,
    });
  },
}));
