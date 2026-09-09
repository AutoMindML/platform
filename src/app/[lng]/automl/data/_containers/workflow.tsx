"use client";

import DetailModal from "../../_components/modals/detail-modal";
import ProgressSummary from "../_components/progress-summary";
import { PromptDisplay } from "../_components/prompt-display";
import StepperSection from "../_components/stepper-section";
import DataCleaning from "../_components/worker/data-cleaning";
import FeatureEngineering from "../_components/worker/feature-engineering";
import Metadata from "../_components/worker/metadata";
import Save from "../_components/worker/save";
import Task from "../_components/worker/task";

import AutoAwesome from "@mui/icons-material/AutoAwesome";
import InfoIcon from "@mui/icons-material/Info";
import {
  Box,
  Grid,
  SpeedDial,
  SpeedDialAction,
  Typography,
} from "@mui/material";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import { useMemo } from "react";

import StypedCard from "@/components/styled-card";
import { DynamicTable } from "@/components/table/dynamic-table";
import { trpc } from "@/server/trpc/client";
import { RouterOutputs } from "@/server/trpc/shared";
import { useWorkflowStore } from "@/store/workflow/workflow-store-provider";

interface WorkflowProps {
  workflowSteps: {
    label: string;
    description: string;
  }[];
  datasetInfo: NonNullable<RouterOutputs["dataset"]["getDatasetInfo"]>;
  datasetContent: RouterOutputs["dataset"]["getDatasetContent"];
}

export default function Workflow(props: WorkflowProps) {
  const {
    activeStep,
    metadataComplete,
    cleaningComplete,
    featureComplete,
    cleaningResultPreview,
    engineeringResultPreview,
    showDataInfo,
    setState,
    generateDatasetStatus,
  } = useWorkflowStore((state) => state);

  const getMetadataPrompt = trpc.automl.metadata.getMetadataPrompt.useQuery(
    props.datasetInfo.oid,
  );

  const speedDialActions = useMemo(() => {
    return [
      {
        icon: <InfoIcon />,
        name: "Info",
        onClick: () => {
          setState({ showDataInfo: true });
        },
      },
    ];
  }, [setState]);

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 80px)" }}>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            p: 3,
            bgcolor: "background.default",
          }}
        >
          <Box sx={{ maxWidth: 1400, mx: "auto" }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h2" gutterBottom>
                  Data Processing Workflow
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <AutoAwesome fontSize="small" color="secondary" />
                  <Typography variant="subtitle2" color="secondary">
                    AI-Powered
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Semi-automated data cleaning and feature engineering with
                real-time preview
              </Typography>
            </Box>

            {/* Stepper Section */}
            <Grid container spacing={3}>
              <Grid
                size={{
                  xs: 12,
                  md: 8,
                }}
              >
                <StepperSection
                  activeStep={activeStep}
                  steps={props.workflowSteps}
                  completed={generateDatasetStatus == "complete"
                    ? true
                    : undefined}
                >
                  {[
                    <Metadata
                      datasetInfo={props.datasetInfo}
                      key={"metadata"}
                    />,
                    <Task
                      datasetInfo={props.datasetInfo}
                      key={"task"}
                    />,
                    <DataCleaning
                      datasetInfo={props.datasetInfo}
                      key={"data-cleaning"}
                    />,
                    <FeatureEngineering
                      datasetInfo={props.datasetInfo}
                      key={"feature-engineering"}
                    />,
                    <Save
                      datasetInfo={props.datasetInfo}
                      key={"review"}
                    />,
                  ]}
                </StepperSection>
              </Grid>

              {/* Information Display */}
              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <Box
                  sx={{
                    position: "sticky",
                    top: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <ProgressSummary
                    completeStates={[
                      metadataComplete,
                      cleaningComplete,
                      featureComplete,
                    ]}
                    titles={[
                      "Metadata is ready",
                      "Data Cleaning",
                      "Feature Engineering",
                    ]}
                  />
                  {metadataComplete && (
                    <StypedCard
                      title="Metadata"
                      variant="elevation"
                    >
                      <PromptDisplay
                        content={getMetadataPrompt.data?.content as string ??
                          ""}
                      />
                    </StypedCard>
                  )}
                  <StypedCard
                    title="Data Cleaning"
                    variant="elevation"
                  >
                    <DynamicTable
                      data={cleaningResultPreview}
                      tableHeightLimit={300}
                    />
                  </StypedCard>

                  <StypedCard
                    title="Feature Engineering"
                    variant="elevation"
                  >
                    <DynamicTable
                      data={engineeringResultPreview}
                      tableHeightLimit={300}
                    />
                  </StypedCard>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Tool Buttons */}

      <SpeedDial
        ariaLabel="tool-buttons"
        sx={{ position: "absolute", bottom: 16, right: 28 }}
        icon={<SpeedDialIcon />}
      >
        {speedDialActions.map((v) => {
          return (
            <SpeedDialAction
              key={v.name}
              icon={v.icon}
              slotProps={{
                tooltip: {
                  open: true,
                  title: v.name,
                },
              }}
              onClick={v.onClick}
            />
          );
        })}
      </SpeedDial>

      {props.datasetInfo &&
        (
          <DetailModal
            open={showDataInfo}
            onClose={() => setState({ showDataInfo: false })}
            detail={{
              id: props.datasetInfo.oid,
              name: props.datasetInfo.name ?? "",
              type: props.datasetInfo.source_type ?? "",
              description: props.datasetInfo.description ?? "",
              createdAt: props.datasetInfo.created_at,
              updatedAt: props.datasetInfo.updated_at,
            }}
            additionalDetail={[
              "rows: " + props.datasetInfo.rows?.toString(),
              "cols: " + props.datasetInfo.cols?.toString(),
              `size: ${
                props.datasetInfo.size
                  ? (props.datasetInfo.size / (1024 ** 2)).toFixed(1)
                    .toString() + " MB"
                  : "undefined"
              }`,
            ]}
          >
            <DynamicTable
              data={props.datasetContent.content ?? []}
              height={"calc(100% - 50px)"}
              tableHeightLimit={"100%"}
            />
          </DetailModal>
        )}
    </Box>
  );
}
