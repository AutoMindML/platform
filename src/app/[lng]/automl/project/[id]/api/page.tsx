import EditAppBar from "../../../../../../components/app-bar/edit-app-bar";
import APIManagement from "../_components/api-management";

import { Box } from "@mui/material";

import { basePathName } from "@/pathname";
import { trpc } from "@/server/trpc/server";
import { ProjectStoreProvider } from "@/store/project/project-store-provider";
import { PageProps } from "@/types/page";

export default async function ProjectIdPage(
  props: { params: Promise<{ id: string }> } & PageProps,
) {
  const { id } = await props.params;
  const project = await trpc.project.getProject(id);

  const menu = {
    "Model Training": `${basePathName.project}/${id}/model`,
    "API Management": `${basePathName.project}/${id}/api`,
  };

  return (
    <Box sx={{ width: "100%" }}>
      <ProjectStoreProvider>
        <EditAppBar
          title={project?.name}
          menu={menu}
          currentMenuName="API Management"
          goBackPathname={basePathName.project}
        />
        <APIManagement projectId={Number(id)} />
      </ProjectStoreProvider>
    </Box>
  );
}
