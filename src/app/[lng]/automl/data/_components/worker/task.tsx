"use client";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import StypedCard from "@/components/styled-card";
import { MLTaskSchema } from "@/server/api/schemas/automl";
import { trpc } from "@/server/trpc/client";
import { RouterOutputs } from "@/server/trpc/shared";
import { useWorkflowStore } from "@/store/workflow/workflow-store-provider";

interface TaskProps {
  datasetInfo: NonNullable<RouterOutputs["dataset"]["getDatasetInfo"]>;
}

export default function Task(props: TaskProps) {
  const {
    onStepBack,
    onStepNext,
    actionIndex,
    modelingApproachIndex,
    taskOptions,
    targetColumn,
    setState,
  } = useWorkflowStore(
    (state) => state,
  );

  const previewApplierActions = trpc.automl.applier.previewApplierActions
    .useQuery(props.datasetInfo.oid);
  const applierAction = previewApplierActions.data?.content?.at(actionIndex)
    ?.modeling_approaches.at(modelingApproachIndex);

  return (
    <Box>
      <StypedCard title="Task Options">
        <Typography variant="subtitle1">
          Target: {targetColumn}
        </Typography>
        {
          // if original task type is classification, can't convert to regression
          (applierAction?.task_type === "REGRESSION")
            ? (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Task Type</InputLabel>
                <Select
                  value={taskOptions.type}
                  label="Task Type"
                  onChange={(e) => {
                    setState({
                      taskOptions: {
                        ...taskOptions,
                        discretize: e.target.value === "CLASSIFICATION",
                        type: e.target.value,
                      },
                    });
                  }}
                >
                  {MLTaskSchema.options.map((v, i) => {
                    return <MenuItem key={i} value={v}>{v}</MenuItem>;
                  })}
                </Select>
              </FormControl>
            )
            : (
              <Typography variant="subtitle1">
                Task Type: {taskOptions.type}
              </Typography>
            )
        }
      </StypedCard>
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
          disabled={false}
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
