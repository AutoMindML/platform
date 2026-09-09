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
import {
  ChoosedMethods,
  FeatureEngineeringOptions,
} from "@/server/api/schemas/automl";
import { trpc } from "@/server/trpc/client";
import { RouterOutputs } from "@/server/trpc/shared";
import { useWorkflowStore } from "@/store/workflow/workflow-store-provider";

interface FeatureEngineeringProps {
  datasetInfo: NonNullable<RouterOutputs["dataset"]["getDatasetInfo"]>;
}

export default function FeatureEngineering(props: FeatureEngineeringProps) {
  const {
    setState,
    onStepBack,
    taskOptions,
    featureOptions,
    featureStatus,
    featureComplete,
    cleaningOptions,
    onStepNext,
  } = useWorkflowStore((state) => state);

  const previewApplierActions = trpc.automl.applier.previewApplierActions
    .useQuery(props.datasetInfo.oid);

  const previewApplierProcessingResult = trpc.automl.applier
    .previewApplierProcessingResult.useMutation();

  useEffect(() => {
    const transformation: ChoosedMethods = {};
    const encoding: ChoosedMethods = {};
    const extraction: ChoosedMethods = {};

    previewApplierActions.data?.content?.at(0)?.modeling_approaches.at(0)
      ?.feature_engineering.transformation.forEach((v, i) => {
        transformation[i] = new Array(v.methods.length).fill(
          true,
        );
      });
    previewApplierActions.data?.content?.at(0)?.modeling_approaches.at(0)
      ?.feature_engineering.encoding.forEach((v, i) => {
        encoding[i] = new Array(v.methods.length).fill(
          true,
        );
      });
    previewApplierActions.data?.content?.at(0)?.modeling_approaches.at(0)
      ?.feature_engineering.extraction.forEach((v, i) => {
        extraction[i] = new Array(v.methods.length).fill(
          true,
        );
      });

    setState({
      featureOptions: {
        encoding,
        transformation,
        extraction,
      },
    });
  }, [previewApplierActions.data?.content, setState]);

  const handleOptionSingleChange = (
    checked: boolean,
    strategy_idx: number,
    method_idx: number,
    featureOptionType: keyof FeatureEngineeringOptions,
  ) => {
    if (!featureOptions[featureOptionType]) {
      return;
    }

    featureOptions[featureOptionType][strategy_idx][method_idx] = checked;
    setState({
      featureOptions,
      featureComplete: false,
      featureStatus: "unavailable",
    });
  };

  const handleOptionAllChange = (
    checked: boolean,
    strategy_idx: number,
    featureOptionType: keyof FeatureEngineeringOptions,
  ) => {
    if (!featureOptions[featureOptionType]) {
      return;
    }

    featureOptions[featureOptionType][strategy_idx] =
      featureOptions[featureOptionType][strategy_idx].map((_) => checked);

    setState({
      featureComplete: false,
      featureStatus: "unavailable",
      featureOptions,
    });
  };

  const handleStartEngineering = async () => {
    setState({ featureStatus: "generating" });

    await previewApplierProcessingResult.mutateAsync({
      dataset_id: props.datasetInfo.oid,
      body: {
        only_cleaning: false,
        data_cleaning_options: cleaningOptions,
        feature_engineering_options: featureOptions,
        task_options: taskOptions,
      },
    }, {
      onSuccess(data) {
        setState({
          featureComplete: true,
          featureStatus: "complete",
          engineeringResultPreview: data,
        });
      },
    });
  };

  return (
    <Box>
      <StypedCard title="Data Cleaning Options">
        <Divider>
          <Chip label="Feature Transformation" />
        </Divider>
        {previewApplierActions.data?.content?.at(0)?.modeling_approaches.at(0)
          ?.feature_engineering.transformation.map((v, strategy_idx) => {
            return (
              <Box key={v.column}>
                <FormGroup>
                  <FormControlLabel
                    sx={{ color: "secondary.main" }}
                    control={
                      <Checkbox
                        color="info"
                        checked={featureOptions.transformation?.[strategy_idx]
                          ?.every((v) => v === true) ?? false}
                        indeterminate={featureOptions.transformation
                          ?.[strategy_idx]?.some((v) => v === false) ?? true}
                        onChange={(_, checked) =>
                          handleOptionAllChange(
                            checked,
                            strategy_idx,
                            "transformation",
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
                              checked={featureOptions.transformation
                                ?.[strategy_idx]?.at(method_idx) ?? false}
                              onChange={(_, checked) =>
                                handleOptionSingleChange(
                                  checked,
                                  strategy_idx,
                                  method_idx,
                                  "transformation",
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

        <Divider>
          <Chip label="Feature Encoding" />
        </Divider>

        {previewApplierActions.data?.content?.at(0)?.modeling_approaches.at(0)
          ?.feature_engineering.encoding.map((v, strategy_idx) => {
            return (
              <Box key={v.column}>
                <FormGroup>
                  <FormControlLabel
                    sx={{ color: "secondary.main" }}
                    control={
                      <Checkbox
                        color="info"
                        checked={featureOptions.encoding?.[strategy_idx]
                          ?.every((v) => v === true) ?? false}
                        indeterminate={featureOptions.encoding
                          ?.[strategy_idx]?.some((v) => v === false) ?? true}
                        onChange={(_, checked) =>
                          handleOptionAllChange(
                            checked,
                            strategy_idx,
                            "encoding",
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
                              checked={featureOptions.encoding
                                ?.[strategy_idx]?.at(method_idx) ?? false}
                              onChange={(_, checked) =>
                                handleOptionSingleChange(
                                  checked,
                                  strategy_idx,
                                  method_idx,
                                  "encoding",
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
        title={featureStatus === "generating"
          ? "Engineering in progress..."
          : ""}
        status={featureStatus}
      />
      <CompleteCard
        status={featureStatus}
        message="Feature engineering successfully!"
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
          disabled={featureComplete}
          size="small"
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={async () => await handleStartEngineering()}
        >
          Start
        </Button>
        <Button
          disabled={!featureComplete}
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
