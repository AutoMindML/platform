"use client";

import AddModelDialog from "../../../_components/modals/add-model-dialog";
import EditItemDialog from "../../../_components/modals/edit-item-dialog";

import Bolt from "@mui/icons-material/Bolt";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Pause from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Stop from "@mui/icons-material/Stop";
import TrendingDown from "@mui/icons-material/TrendingDown";
import TrendingUp from "@mui/icons-material/TrendingUp";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import SelectAutoComplete from "@/components/select/select-auto-complete";
import GeneralSnackbar, {
  GeneralSnackbarData,
} from "@/components/snackbar/general-snackbar";
import { DynamicTable } from "@/components/table/dynamic-table";
import { trpc } from "@/server/trpc/client";
import { useConfirmDialogStore } from "@/store/confirm-dialog";
import { useProjectStore } from "@/store/project/project-store-provider";
import { BasicItemInfo } from "@/types/shared";

interface ModelManagementProps {
  projectId: string;
}

export default function ModelManagement(props: ModelManagementProps) {
  const allModel = trpc.model.getAllProjectModel.useQuery(
    Number(props.projectId),
    { refetchInterval: 5000 },
  );
  const addModel = trpc.model.addModel.useMutation();
  const deleteModel = trpc.model.deleteModel.useMutation();
  const updateObject = trpc.i3s.updateObject.useMutation();
  const datasets = trpc.dataset.getManyDatasets.useQuery();
  const engines = trpc.engine.getManyEngines.useQuery();
  const modelPredict = trpc.model.modelPredict.useMutation();

  //-------------------- Prepare data ----------
  const allDataset = datasets.data ?? [];
  const dataOptions: BasicItemInfo[] | undefined = allDataset?.map((
    v,
  ) => ({
    id: v.oid,
    name: v.name ?? "",
    description: v.description ?? "",
    createdAt: v.created_at,
    updatedAt: v.updated_at,
    type: v.source_type ?? "",
  }));

  const engineOptions: BasicItemInfo[] | undefined = engines.data?.map((
    v,
  ) => ({
    id: v.oid,
    name: v.name ?? "",
    description: v.description ?? "",
    createdAt: v.created_at,
    updatedAt: v.updated_at,
  }));
  const allCompleteModel =
    allModel.data?.filter((v) => v.status === "complete") ?? [];

  const currentModel = allCompleteModel?.at(0);
  const lastModel = allCompleteModel?.at(1);

  const accuracyChange = (currentModel && lastModel)
    ? (currentModel.accuracyValue - lastModel.accuracyValue) * 100
    : 0;
  const f1ScoreChange = (currentModel && lastModel)
    ? (currentModel.f1ScoreValue - lastModel.f1ScoreValue) * 100
    : 0;
  const modelMetrics = (currentModel && lastModel)
    ? [
      {
        name: "Accuracy",
        value: currentModel.formatAccuracy,
        change: accuracyChange >= 0
          ? `+${accuracyChange.toFixed(1)}%`
          : `${accuracyChange.toFixed(1)}%`,
        trend: accuracyChange >= 0 ? "up" : "down",
      },
      {
        name: "F1 Score",
        value: currentModel.formatF1Score,
        change: f1ScoreChange >= 0
          ? `+${f1ScoreChange.toFixed(1)}%`
          : `${f1ScoreChange.toFixed(1)}%`,
        trend: f1ScoreChange >= 0 ? "up" : "down",
      },
    ]
    : [];

  //-------------------- State --------------------

  const confirmDialogState = useConfirmDialogStore(
    useShallow((state) => ({ ...state })),
  );
  const modelStore = useProjectStore((state) => state);

  //-------------------- Handler --------------------
  const handleDeleteModel = (modelId: number) => {
    confirmDialogState.setState({
      open: true,
      title: "Delete Model",
      onClose: () =>
        confirmDialogState.setState({
          open: false,
        }),
      onConfirm: async () => {
        deleteModel.mutateAsync({ modelId: modelId }, {
          onSuccess: (data) => {
            if (data.state === 0) {
              setGeneralSnackbarData({
                open: true,
                message: data.message,
                severity: "success",
              });
              allModel.refetch();
            } else {
              setGeneralSnackbarData({
                open: true,
                message: data.message,
                severity: "error",
              });
            }
          },
        });
      },
      children: "Are you sure to delete this model?",
    });
  };

  const handleModelPredict = async () => {
    if (modelStore.selectedModelId && modelStore.selectedDatasetId) {
      await modelPredict.mutateAsync({
        project_id: Number(props.projectId),
        model_id: modelStore.selectedModelId,
        dataset_id: modelStore.selectedDatasetId,
      }, {
        onSuccess(data) {
          modelStore.setState({ predictedResult: data });
        },
      });
    }
  };

  const [generalSnackbarData, setGeneralSnackbarData] = useState<
    GeneralSnackbarData
  >({ open: false, message: "", severity: "success" });

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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 4,
              }}
            >
              <Box>
                <Typography variant="h2" gutterBottom>
                  Model Training
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Monitor AutoML training progress and model performance
                </Typography>
              </Box>
              <Box display={"flex"} flexDirection={"column"} gap={2}>
                <Button
                  variant="contained"
                  startIcon={<Bolt />}
                  onClick={() => modelStore.setState({ openAddModal: true })}
                >
                  Start New Training
                </Button>
              </Box>

              <AddModelDialog
                open={modelStore.openAddModal}
                onClose={() => modelStore.setState({ openAddModal: false })}
                onSubmit={async (data) => {
                  setGeneralSnackbarData({
                    open: true,
                    message: "Model training...",
                    severity: "warning",
                  });

                  addModel.mutateAsync({
                    name: data.name,
                    des: data.description,
                    projectId: Number(props.projectId),
                    dataId: data.dataId,
                    engineId: data.engineId,
                    predict: data.predict,
                    tag: data.tag,
                    selectDataQuery: data.selectDataQuery,
                    trainingOptions: data.trainingOptions,
                  }, {
                    onSuccess: () => {
                      setGeneralSnackbarData({
                        open: true,
                        message: "Create new model successfully",
                        severity: "success",
                      });
                      allModel.refetch();
                    },
                  });
                }}
                dataOptions={dataOptions ?? []}
                engineOptions={engineOptions ?? []}
              />
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {modelMetrics.map((metric) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={metric.name}>
                  <Card>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            {metric.name}
                          </Typography>
                          <Typography variant="h4" sx={{ mt: 1 }}>
                            {metric.value}
                          </Typography>
                        </Box>
                        {metric.trend === "up"
                          ? <TrendingUp sx={{ color: "success.main" }} />
                          : <TrendingDown sx={{ color: "error.main" }} />}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 2,
                          color: metric.trend === "up"
                            ? "success.main"
                            : "error.main",
                        }}
                      >
                        {metric.change} from last run
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box>
              <Typography variant="h5" gutterBottom>
                Training Jobs
              </Typography>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
              >
                {allModel?.data?.length == 0 &&
                  (
                    <Typography
                      textAlign={"center"}
                      variant="h6"
                      color="text.secondary"
                      mt={10}
                    >
                      No model has been trained yet; you can start a new
                      training session now.
                    </Typography>
                  )}
                {allModel.data &&
                  allModel.data.map((model) => (
                    <Card key={model.id}>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Box sx={{ flexGrow: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                mb: 1,
                              }}
                            >
                              <Typography variant="h6">{model.name}</Typography>
                              <Chip
                                label={model.status}
                                color={model.status === "complete"
                                  ? "success"
                                  : model.status === "training"
                                  ? "info"
                                  : "default"}
                                size="small"
                              />
                            </Box>
                            <Box sx={{ display: "flex", gap: 2 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Dataset: {model.dataset}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {model.status === "training" && (
                              <>
                                <IconButton size="small">
                                  <Pause fontSize="small" />
                                </IconButton>
                                <IconButton size="small">
                                  <Stop fontSize="small" />
                                </IconButton>
                              </>
                            )}
                            <IconButton
                              onClick={() => handleDeleteModel(model.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                            <IconButton
                              onClick={() =>
                                modelStore.setState({
                                  openEditModal: true,
                                  currentModelInfo: {
                                    id: model.id,
                                    name: model.name,
                                    description: model.description,
                                  },
                                })}
                            >
                              <EditIcon />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Metrics Grid */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Card variant="outlined">
                              <CardContent
                                sx={{ p: 2, "&:last-child": { pb: 2 } }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Accuracy
                                </Typography>
                                <Typography variant="h5" sx={{ mt: 0.5 }}>
                                  {model.formatAccuracy}%
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>

                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Card variant="outlined">
                              <CardContent
                                sx={{ p: 2, "&:last-child": { pb: 2 } }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  F1 Score
                                </Typography>
                                <Typography variant="h5" sx={{ mt: 0.5 }}>
                                  {model.formatF1Score}%
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>

                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Card variant="outlined">
                              <CardContent
                                sx={{ p: 2, "&:last-child": { pb: 2 } }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Est. Completion
                                </Typography>
                                <Typography variant="h5" sx={{ mt: 0.5 }}>
                                  {model.estimatedCompletion}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Started: {model.startTime}
                          </Typography>
                          {model.status === "complete" && (
                            <Button
                              color="info"
                              size="small"
                              variant="text"
                              sx={{ textTransform: "none" }}
                              onClick={() =>
                                modelStore.setState({
                                  selectedModelId: model.id,
                                  openValidationModal: true,
                                  currentModelInfo: {
                                    id: model.id,
                                    name: model.name,
                                    description: model.description,
                                  },
                                })}
                            >
                              Validation Your Model
                            </Button>
                          )}

                          {model.status === "training" && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  bgcolor: "info.main",
                                  animation:
                                    "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                                  "@keyframes pulse": {
                                    "0%, 100%": { opacity: 1 },
                                    "50%": { opacity: 0.5 },
                                  },
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Training in progress...
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Dialog
        fullScreen
        open={modelStore.openValidationModal}
        onClose={() => modelStore.setState({ openValidationModal: false })}
      >
        <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
          <Box
            bgcolor={"background.main"}
            display={"flex"}
            flexDirection={"column"}
            flexGrow={1}
            gap={2}
          >
            <SelectAutoComplete
              data={dataOptions}
              required
              label={"Select Validation Dataset"}
              onItemSelect={(value) => {
                modelStore.setState({
                  selectedDatasetId: value.id,
                });
              }}
            />

            <Typography variant="h6">
              {`Model: ${modelStore.currentModelInfo.name} (${modelStore.currentModelInfo.id})`}
            </Typography>

            <Divider>
              <Typography variant="h6">Result</Typography>
            </Divider>

            <Box
              display={"flex"}
              flexGrow={1}
              alignItems={"center"}
              justifyContent={"center"}
              gap={2}
            >
              {modelPredict.isSuccess &&
                (
                  <DynamicTable
                    tableHeightLimit={500}
                    data={modelStore.predictedResult}
                  />
                )}
              {modelPredict.isPending &&
                (
                  <>
                    <CircularProgress color="info" />
                    <Typography>Executing validation task</Typography>
                  </>
                )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={!modelStore.selectedDatasetId || modelPredict.isPending}
            color="info"
            startIcon={<PlayArrowIcon />}
            variant="contained"
            onClick={() => handleModelPredict()}
          >
            Start
          </Button>
          <IconButton
            onClick={() => modelStore.setState({ openValidationModal: false })}
          >
            <CloseIcon />
          </IconButton>
        </DialogActions>
      </Dialog>

      <EditItemDialog
        title={"Edit Model"}
        open={modelStore.openEditModal}
        onClose={() => {
          modelStore.setState({ openEditModal: false });
        }}
        onSave={async (name, description) => {
          if (modelStore.currentModelInfo.id) {
            updateObject.mutateAsync({
              oid: modelStore.currentModelInfo.id,
              name: name,
              des: description,
            }, {
              onSuccess: () => {
                setGeneralSnackbarData({
                  open: true,
                  message: "Update model successfully",
                  severity: "success",
                });
                allModel.refetch();
              },
            });
          }
        }}
        initialName={modelStore.currentModelInfo.name}
        initialDescription={modelStore.currentModelInfo.description}
      />

      <GeneralSnackbar
        open={generalSnackbarData.open}
        severity={generalSnackbarData.severity}
        onClose={() =>
          setGeneralSnackbarData({ ...generalSnackbarData, open: false })}
      >
        {generalSnackbarData.message}
      </GeneralSnackbar>
    </Box>
  );
}
