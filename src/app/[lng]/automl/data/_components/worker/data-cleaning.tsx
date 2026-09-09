import PlayArrow from "@mui/icons-material/PlayArrow";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import { useEffect } from "react";

import CompleteCard from "@/components/complete-card";
import StatusProgress from "@/components/status-progress";
import StypedCard from "@/components/styled-card";
import { ChoosedMethods } from "@/server/api/schemas/automl";
import { trpc } from "@/server/trpc/client";
import { RouterOutputs } from "@/server/trpc/shared";
import { useWorkflowStore } from "@/store/workflow/workflow-store-provider";

interface DataCleaningProps {
  datasetInfo: NonNullable<RouterOutputs["dataset"]["getDatasetInfo"]>;
}

export default function DataCleaning(props: DataCleaningProps) {
  const {
    cleaningStatus,
    onStepBack,
    onStepNext,
    setState,
    cleaningOptions,
    cleaningComplete,
    taskOptions,
  } = useWorkflowStore(
    (state) => state,
  );

  const previewApplierActions = trpc.automl.applier.previewApplierActions
    .useQuery(props.datasetInfo.oid);

  const previewApplierProcessingResult = trpc.automl.applier
    .previewApplierProcessingResult.useMutation();

  useEffect(() => {
    const missingValues: ChoosedMethods = {};

    previewApplierActions.data?.content?.at(0)?.modeling_approaches.at(0)
      ?.data_cleaning.missing_values.forEach((v, i) => {
        missingValues[i] = new Array(v.methods.length).fill(
          true,
        );
      });

    setState({
      cleaningOptions: {
        missing_values: missingValues,
      },
    });
  }, [previewApplierActions.data?.content, setState]);

  const handleOptionSingleChange = (
    checked: boolean,
    strategy_idx: number,
    method_idx: number,
  ) => {
    if (!cleaningOptions.missing_values) {
      return;
    }

    cleaningOptions.missing_values[strategy_idx][method_idx] = checked;
    setState({
      cleaningOptions,
      cleaningComplete: false,
      cleaningStatus: "unavailable",
    });
  };

  const handleOptionAllChange = (
    checked: boolean,
    strategy_idx: number,
  ) => {
    if (!cleaningOptions.missing_values) {
      return;
    }

    cleaningOptions.missing_values[strategy_idx] = cleaningOptions
      .missing_values[strategy_idx].map((_) => checked);

    setState({
      cleaningComplete: false,
      cleaningStatus: "unavailable",
      cleaningOptions,
    });
  };

  const handleStartCleaning = async () => {
    setState({ cleaningStatus: "generating" });

    await previewApplierProcessingResult.mutateAsync({
      dataset_id: props.datasetInfo.oid,
      body: {
        only_cleaning: true,
        data_cleaning_options: cleaningOptions,
        task_options: taskOptions,
      },
    }, {
      onSuccess(data) {
        setState({
          cleaningComplete: true,
          cleaningStatus: "complete",
          cleaningResultPreview: data,
        });
      },
    });
  };

  return (
    <Box>
      <StypedCard title="Data Cleaning Options">
        <Divider>
          <Chip label="Missing Value" />
        </Divider>
        {previewApplierActions.data?.content?.at(0)?.modeling_approaches.at(0)
          ?.data_cleaning.missing_values.map((v, strategy_idx) => {
            return (
              <Box key={v.column}>
                <FormGroup>
                  <FormControlLabel
                    sx={{ color: "secondary.main" }}
                    control={
                      <Checkbox
                        color="info"
                        checked={cleaningOptions.missing_values?.[strategy_idx]
                          ?.every((v) => v === true) ?? false}
                        indeterminate={cleaningOptions.missing_values
                          ?.[strategy_idx]?.some((v) => v === false) ?? true}
                        onChange={(_, checked) =>
                          handleOptionAllChange(
                            checked,
                            strategy_idx,
                          )}
                      />
                    }
                    label={v.column}
                  />
                  <Box sx={{ display: "flex", flexDirection: "column", ml: 3 }}>
                    {v.methods.map((m, method_idx) => {
                      return (
                        <FormControlLabel
                          key={method_idx}
                          control={
                            <Checkbox
                              color="info"
                              checked={cleaningOptions.missing_values
                                ?.[strategy_idx]?.at(method_idx) ?? false}
                              onChange={(_, checked) =>
                                handleOptionSingleChange(
                                  checked,
                                  strategy_idx,
                                  method_idx,
                                )}
                            />
                          }
                          label={m}
                        />
                      );
                    })}
                  </Box>
                </FormGroup>
              </Box>
            );
          })}
      </StypedCard>
      <StatusProgress
        title={cleaningStatus === "generating" ? "Cleaning in progress..." : ""}
        status={cleaningStatus}
      />
      <CompleteCard
        status={cleaningStatus}
        message="Data cleaning successfully!"
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
          disabled={cleaningComplete}
          size="small"
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={async () => await handleStartCleaning()}
        >
          Start
        </Button>
        <Button
          disabled={!cleaningComplete}
          size="small"
          variant="contained"
          onClick={() => onStepNext()}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
}
