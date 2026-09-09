"use client";

import EndpointCard from "./endpoint-card";
import ExampleCode from "./example-code";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import KeyIcon from "@mui/icons-material/Key";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Tab,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/system";
import { useState } from "react";

import SelectAutoComplete from "@/components/select/select-auto-complete";
import GeneralSnackbar, {
  GeneralSnackbarData,
} from "@/components/snackbar/general-snackbar";
import { basePathName } from "@/pathname";
import { datasetToBasicItem } from "@/server/api/utils/dataset";
import { trpc } from "@/server/trpc/client";
import { Endpoint } from "@/store/project/project-store";
import { useProjectStore } from "@/store/project/project-store-provider";
import { BasicItemInfo } from "@/types/shared";

interface APIManagementProps {
  projectId: number;
}

const requestExample = `// headers
{
    'X-API-Key': 'Bearer YOUR_API_KEY',
}

// body
{
    'input': [
       {
          'feature1': number
          'feature2': 'string'
       }
    ],
    'model_id': '1198',
    'limit': -1
}
`;

const responseExample = `// return JSON in records format 
[
    {...row1},
    {...row2},
    {...row3},
    ...
]
`;

export default function APIManagement(props: APIManagementProps) {
  const [generalSnackbarData, setGeneralSnackbarData] = useState<
    GeneralSnackbarData
  >({ open: false, message: "", severity: "success" });
  const projectStore = useProjectStore((state) => state);

  const [tabValue, setTabValue] = useState<"request" | "response">(
    "request",
  );

  const handleTabChange = (
    _: React.SyntheticEvent,
    newValue: "request" | "response",
  ) => {
    setTabValue(newValue);
  };

  const allDataset = trpc.dataset.getManyDatasets.useQuery().data ?? [];
  const datasetContent = trpc.dataset.getDatasetContent.useQuery(
    projectStore.selectedDatasetId ?? undefined,
  );
  const dataOptions = datasetToBasicItem(allDataset);

  const appInfo = trpc.app.getAppInfo.useQuery(Number(props.projectId));
  const createApp = trpc.app.createApp.useMutation();
  const deleteApp = trpc.app.deleteApp.useMutation();
  const appAPICall = trpc.app.appAPICall.useMutation();

  const allModel = trpc.model.getAllProjectModel.useQuery(props.projectId);
  const modelOptions: BasicItemInfo[] = allModel?.data?.map((
    v,
  ) => ({
    id: v.id,
    name: v.name ?? "",
    description: v.description ?? "",
    createdAt: v.created,
    updatedAt: v.updated,
  })) ?? [];

  const endpoints: Endpoint[] = [
    {
      path: `${basePathName.appDeploymentService}/${
        appInfo.data?.deployment_id ?? "{deployment_id}"
      }`,
      description: "Make predictions using trained model",
      id: "post_" + basePathName.appDeploymentService,
      method: "POST",
    },
  ];

  const handleCreateApp = async () => {
    await createApp.mutateAsync({
      project_id: Number(props.projectId),
      name: "test",
      des: "test",
    }, {
      onSuccess() {
        appInfo.refetch();
      },
    });
  };

  const handleDeleteApp = async () => {
    if (appInfo.data?.app_id) {
      await deleteApp.mutateAsync(appInfo.data?.app_id, {
        onSuccess() {
          appInfo.refetch();
        },
      });
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setGeneralSnackbarData({
      open: true,
      message: "copy to clipboard!",
      severity: "success",
    });
  };

  const handleAppAPICall = async () => {
    if (
      appInfo.data?.api_key && appInfo.data.deployment_id &&
      projectStore.selectedModelId && projectStore.selectedDatasetId &&
      datasetContent.data?.content
    ) {
      const body = {
        input: datasetContent.data?.content.splice(0, 1),
        model_id: projectStore.selectedModelId.toString(),
        limit: 1,
      };
      await appAPICall.mutateAsync({
        api_key: appInfo.data.api_key,
        deployment_id: appInfo.data.deployment_id,
        body,
      }, {
        onSuccess(data) {
          projectStore.setState({
            apiCallRequestCode: `fetch(
    "AUTOMIND_SERVICE_HOST/${projectStore.selectedEndpoint?.path}",
    {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
            "X-API-Key": "YOUR_API_KEY",
        }),
        body: ${JSON.stringify(body, null, 10)},
    },
);
`,
            apiCallResponse: JSON.stringify(data, null, 4),
          });
        },
      });
    }
  };

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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 10,
                mb: 4,
              }}
            >
              <Box>
                <Typography variant="h2" gutterBottom>
                  API Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage API keys, monitor endpoints, and test API calls
                </Typography>
              </Box>

              <Box
                display={"flex"}
                flexDirection={"column"}
                gap={2}
                flexGrow={1}
              >
                <Button
                  disabled={createApp.isPending ||
                    !!appInfo.data?.api_key}
                  variant="contained"
                  startIcon={<KeyIcon />}
                  onClick={async () => await handleCreateApp()}
                >
                  Generate API Key
                </Button>
                {appInfo.data?.api_key &&
                  (
                    <Box display={"flex"} flexDirection={"column"} gap={1}>
                      {/* <Button */}
                      {/*   variant="contained" */}
                      {/*   startIcon={<Delete />} */}
                      {/*   onClick={async () => await handleDeleteApp()} */}
                      {/* > */}
                      {/*   Delete App */}
                      {/* </Button> */}
                      <Typography>
                        Deployment ID
                      </Typography>

                      <FormControl>
                        <OutlinedInput
                          defaultValue={appInfo.data?.deployment_id}
                          readOnly
                          type="text"
                          startAdornment={
                            <InputAdornment position="start">
                              <IconButton
                                aria-label={"copy to clipboard"}
                                onClick={() =>
                                  handleCopy(appInfo.data?.deployment_id ?? "")}
                              >
                                <ContentCopyIcon />
                              </IconButton>
                            </InputAdornment>
                          }
                        />
                      </FormControl>
                      <Typography>API Key</Typography>
                      <FormControl>
                        <OutlinedInput
                          defaultValue={appInfo.data?.api_key}
                          readOnly
                          type={projectStore.showKey ? "text" : "password"}
                          startAdornment={
                            <InputAdornment position="start">
                              <IconButton
                                aria-label={"copy to clipboard"}
                                onClick={() =>
                                  handleCopy(appInfo.data?.api_key ?? "")}
                              >
                                <ContentCopyIcon />
                              </IconButton>
                            </InputAdornment>
                          }
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={projectStore.showKey
                                  ? "hide the api key"
                                  : "display the api key"}
                                onClick={() =>
                                  projectStore.setState({
                                    showKey: !projectStore.showKey,
                                  })}
                              >
                                {projectStore.showKey
                                  ? <VisibilityOff />
                                  : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          }
                        />
                      </FormControl>
                    </Box>
                  )}
              </Box>
            </Box>
          </Box>

          <Divider />

          <Grid container spacing={3} p={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Typography variant="h5">Available Endpoints</Typography>
              <Box paddingTop={2}>
                {endpoints.map((endpoint) => {
                  return (
                    <EndpointCard
                      key={endpoint.id}
                      endpoint={endpoint}
                      selected={endpoint.id ===
                        projectStore.selectedEndpoint?.id}
                      onClick={() => {
                        projectStore.setState({ selectedEndpoint: endpoint });
                      }}
                    />
                  );
                })}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Typography variant="h5">Test Endpoint</Typography>
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <ExampleCode
                    title="Request Example"
                    exampleCode={requestExample}
                  />
                  <ExampleCode
                    title="Response Example"
                    exampleCode={responseExample}
                  />
                  <Box display={"flex"} flexDirection={"column"} gap={2}>
                    <SelectAutoComplete
                      data={modelOptions}
                      required
                      label="Select Model to Run API Call"
                      onItemSelect={(v) => {
                        projectStore.setState({ selectedModelId: v.id });
                      }}
                      onItemClear={() =>
                        projectStore.setState({
                          selectedModelId: undefined,
                        })}
                    />
                    <SelectAutoComplete
                      data={dataOptions}
                      required
                      label="Select Dataset to Run API Call"
                      onItemSelect={(v) => {
                        projectStore.setState({ selectedDatasetId: v.id });
                      }}
                      onItemClear={() =>
                        projectStore.setState({
                          selectedDatasetId: undefined,
                        })}
                    />
                    <Button
                      loading={appAPICall.isPending}
                      fullWidth
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      color="info"
                      sx={{ textTransform: "none" }}
                      disabled={!projectStore.selectedDatasetId ||
                        !projectStore.selectedModelId || appAPICall.isPending ||
                        !projectStore.selectedEndpoint}
                      onClick={() => handleAppAPICall()}
                    >
                      Test API Call
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              container
              size={{ xs: 12, lg: 12 }}
              display={"flex"}
              flexDirection={"column"}
              gap={2}
            >
              <Divider>
                <Chip label={"Test Result"} />
              </Divider>
              <TabContext value={tabValue}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <TabList
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                      "& .MuiTabs-indicator": {
                        display: "flex",
                        justifyContent: "center",
                        backgroundColor: "secondary.main",
                      },
                    }}
                  >
                    <Tab
                      label="Request"
                      value="request"
                    />
                    <Tab label="Response" value="response" />
                  </TabList>
                </Box>
                <TabPanel value="request">
                  <Card>
                    <CardContent>
                      <ExampleCode
                        exampleCode={projectStore.apiCallRequestCode ?? "..."}
                      />
                    </CardContent>
                  </Card>
                </TabPanel>
                <TabPanel value="response">
                  <Card>
                    <CardContent>
                      <ExampleCode
                        exampleCode={projectStore.apiCallResponse ?? "..."}
                      />
                    </CardContent>
                  </Card>
                </TabPanel>
              </TabContext>
            </Grid>
          </Grid>
        </Box>
      </Box>

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
