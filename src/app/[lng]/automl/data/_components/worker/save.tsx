import SaveIcon from "@mui/icons-material/Save";
import { Box, Button } from "@mui/material";

import CompleteCard from "@/components/complete-card";
import StatusProgress from "@/components/status-progress";
import { trpc } from "@/server/trpc/client";
import { RouterOutputs } from "@/server/trpc/shared";
import { useWorkflowStore } from "@/store/workflow/workflow-store-provider";

interface ReviewProps {
  datasetInfo: NonNullable<RouterOutputs["dataset"]["getDatasetInfo"]>;
}

export default function Save(props: ReviewProps) {
  const {
    onStepBack,
    metadataComplete,
    cleaningComplete,
    featureComplete,
    generateDatasetStatus,
    taskOptions,
    cleaningOptions,
    featureOptions,
    setState,
  } = useWorkflowStore((state) => state);

  const saveApplierProcessingResult = trpc.automl.applier
    .saveApplierProcessingResult.useMutation();

  const manyDatasets = trpc.dataset.getManyDatasets.useQuery();

  const handleGenerateDataset = async () => {
    setState({ generateDatasetStatus: "generating" });
    saveApplierProcessingResult.mutateAsync({
      dataset_id: props.datasetInfo.oid,
      body: {
        data_cleaning_options: cleaningOptions,
        feature_engineering_options: featureOptions,
        task_options: taskOptions,
      },
    }, {
      onSuccess() {
        setState({ generateDatasetStatus: "complete" });
        manyDatasets.refetch();
      },
    });
  };

  return (
    <Box>
      <StatusProgress
        title={generateDatasetStatus === "generating"
          ? "Generating in progress..."
          : ""}
        status={generateDatasetStatus}
      />
      <CompleteCard
        status={generateDatasetStatus}
        message="Generate dataset successfully!"
      />

      <Box
        sx={{
          mb: 2,
          gap: 2,
          display: "flex",
        }}
      >
        <Button
          size="small"
          variant="contained"
          onClick={() => onStepBack()}
        >
          Back
        </Button>
        <Button
          disabled={(!metadataComplete && !featureComplete &&
            !cleaningComplete) || generateDatasetStatus === "generating"}
          size="small"
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={async () => handleGenerateDataset()}
        >
          Generate Dataset
        </Button>
      </Box>
    </Box>
  );
}
