import EditAppBar from "../../../../../components/app-bar/edit-app-bar";
import WorkFlow from "../_containers/workflow";

import { Box } from "@mui/material";

import { HydrateClient, trpc } from "@/server/trpc/server";
import { WorkflowStoreProvider } from "@/store/workflow/workflow-store-provider";
import { PageWithIdProps } from "@/types/page";

const workflowSteps = [
  {
    label: "Metadata Preparation",
    description:
      "Defining the dataset's Metadata and Schema (data types, fields) to establish the processing foundation.",
  },
  {
    label: "Task Definition",
    description: "Specificate Task Options",
  },
  {
    label: "Rule-based Data Cleaning Applier",
    description:
      "Applying predefined rules to handle Missing Values, Outliers, and format errors for data quality assurance.",
  },
  {
    label: "Rule-based Feature Engineering Applier",
    description:
      "Applying rules to transform and create new Features (e.g., scaling, encoding) to maximize model performance.",
  },
  {
    label: "Review & Save",
    description:
      "Final quality review of the processed data and features. Saving the resulting configuration or dataset for production use.",
  },
];

export default async function ProjectIdPage(
  props: PageWithIdProps,
) {
  const { id } = await props.params;
  const dataset = await trpc.dataset.getDatasetInfo(id);
  const datasetContent = await trpc.dataset.getDatasetContent(Number(id));

  return (
    <HydrateClient>
      <WorkflowStoreProvider>
        <Box sx={{ width: "100%" }}>
          <EditAppBar title={dataset?.name ?? "undefined"} />
          {dataset &&
            (
              <WorkFlow
                workflowSteps={workflowSteps}
                datasetInfo={dataset}
                datasetContent={datasetContent}
              />
            )}
        </Box>
      </WorkflowStoreProvider>
    </HydrateClient>
  );
}
