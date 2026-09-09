import PlayArrow from "@mui/icons-material/PlayArrow";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useEffect } from "react";

import CompleteCard from "@/components/complete-card";
import StatusProgress from "@/components/status-progress";
import StypedCard from "@/components/styled-card";
import { trpc } from "@/server/trpc/client";
import { RouterOutputs } from "@/server/trpc/shared";
import { useWorkflowStore } from "@/store/workflow/workflow-store-provider";

interface MetadataProps {
  datasetInfo: NonNullable<RouterOutputs["dataset"]["getDatasetInfo"]>;
}

export default function Metadata(props: MetadataProps) {
  const {
    targetColumn,
    metadataComplete,
    metadataStatus,
    setState,
    onStepNext,
  } = useWorkflowStore(
    (state) => state,
  );

  const generateMetadataPrompt = trpc.automl.metadata.generateMetadataPrompt
    .useMutation();

  const getMetadataPrompt = trpc.automl.metadata.getMetadataPrompt.useQuery(
    props.datasetInfo.oid,
  );

  const getMetadataStatus = trpc.automl.metadata.getMetadataStatus.useQuery(
    props.datasetInfo.oid,
  );

  useEffect(() => {
    const data = getMetadataStatus.data?.content;
    setState({
      targetColumn: data?.target_column ?? "",
      metadataComplete: data?.metadata_status === "complete",
      metadataStatus: data?.metadata_status,
    });
  }, [getMetadataStatus.data, setState]);

  const handleMetadataGenerate = async () => {
    setState({ metadataStatus: "generating", metadataComplete: false });

    await generateMetadataPrompt.mutateAsync({
      dataset_id: props.datasetInfo.oid,
      target_column: targetColumn,
    }, {
      onSuccess(data) {
        if (data.state === 0) {
          setState({ metadataStatus: "complete", metadataComplete: true });
        } else {
          setState({ metadataStatus: "unavailable", metadataComplete: true });
        }
        getMetadataPrompt.refetch();
        getMetadataStatus.refetch();
      },
    });
  };

  return (
    <Box>
      <StypedCard title="Metadata Options">
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Target Column</InputLabel>
          <Select
            disabled={metadataStatus === "generating"}
            value={targetColumn}
            label="Target Column"
            onChange={(e) => {
              setState({
                targetColumn: e.target.value as string,
                metadataComplete: false,
              });
            }}
          >
            {props.datasetInfo?.col_names?.split(",").map((v, i) => {
              return <MenuItem key={i} value={v}>{v}</MenuItem>;
            })}
          </Select>
        </FormControl>
      </StypedCard>
      <StatusProgress
        title={metadataStatus === "generating"
          ? "Generating in progress..."
          : ""}
        status={metadataStatus}
      />
      <CompleteCard
        status={metadataStatus}
        message="Generate metadata successfully!"
      />

      <Box
        sx={{
          mb: 2,
          gap: 2,
          display: "flex",
        }}
      >
        <Button
          disabled={metadataComplete}
          size="small"
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={async () => await handleMetadataGenerate()}
        >
          Start
        </Button>
        <Button
          disabled={!metadataComplete}
          size="small"
          onClick={() => onStepNext()}
          variant="contained"
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
}
