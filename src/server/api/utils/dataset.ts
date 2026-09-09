import { RouterOutputs } from "@/server/trpc/shared";
import { BasicItemInfo } from "@/types/shared";

export const datasetToBasicItem = (
  data: RouterOutputs["dataset"]["getManyDatasets"],
) => {
  const dataOptions: BasicItemInfo[] = data.map((
    v,
  ) => ({
    id: v.oid,
    name: v.name ?? "",
    description: v.description ?? "",
    createdAt: v.created_at,
    updatedAt: v.updated_at,
    type: v.source_type ?? "",
  }));

  return dataOptions;
};
