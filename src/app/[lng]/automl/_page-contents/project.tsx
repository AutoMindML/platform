"use client";

import AddProjectDialog from "../_components/modals/add-project-dialog";
import EditItemDialog from "../_components/modals/edit-item-dialog";
import Manager from "../_containers/manager";

import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import ActionMenu, { ActionMenuContext } from "@/components/menu/action-menu";
import GeneralSnackbar, {
  GeneralSnackbarData,
} from "@/components/snackbar/general-snackbar";
import { useLngNs } from "@/i18n/hooks";
import { basePathName } from "@/pathname";
import { trpc } from "@/server/trpc/client";
import { useConfirmDialogStore } from "@/store/confirm-dialog";
import { BasicItemInfo } from "@/types/shared";

export default function Project() {
  const t = useLngNs("mutation");

  const projects = trpc.project.getManyProjects.useQuery(undefined);
  const addProject = trpc.project.addProject.useMutation();
  const updateProject = trpc.project.updateProject.useMutation();
  const deleteProject = trpc.project.deleteProject.useMutation();

  const actionMenuContext = useContext(ActionMenuContext);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [currentItem, setCurrentItem] = useState<BasicItemInfo | undefined>(
    undefined,
  );
  const [generalSnackbarData, setGeneralSnackbarData] = useState<
    GeneralSnackbarData
  >({ open: false, message: "", severity: "success" });

  const router = useRouter();
  const confirmDialogState = useConfirmDialogStore(
    useShallow((state) => ({ ...state })),
  );

  const handleDeleteAction = () => {
    confirmDialogState.setState({
      open: true,
      title: t("delete-source-title"),
      onClose: () =>
        confirmDialogState.setState({
          open: false,
        }),
      onConfirm: async () => {
        if (currentItem?.id) {
          deleteProject.mutateAsync(currentItem.id, {
            onSuccess: (data) => {
              if (data?.status === 0) {
                setGeneralSnackbarData({
                  open: true,
                  message: t("success-delete-project"),
                  severity: "success",
                });
                projects.refetch();
              } else {
                setGeneralSnackbarData({
                  open: true,
                  message: t("error-delete-project"),
                  severity: "error",
                });
              }
            },
          });
        }
      },
      children: t("delete-source-des"),
    });
  };

  return (
    <div>
      <Manager
        isLoading={projects.isLoading}
        isSuccess={projects.isSuccess}
        add={{ title: t("add-project"), onClick: () => setOpenAddDialog(true) }}
        data={projects.data
          ? projects.data.map<BasicItemInfo>((v) => ({
            id: v.cid,
            name: v.name ?? "",
            description: v.description ?? "",
            createdAt: v.created_at,
            updatedAt: v.updated_at,
          }))
          : []}
        item={{
          onClick: (v) => {
            setCurrentItem(v);
          },
          onActionMenuClick: (event, v) => {
            setCurrentItem(v);
            actionMenuContext.handleActionMenuClick(event);
          },
        }}
      />

      <ActionMenu
        actions={{
          ["Open project"]: () => {
            router.push(`${basePathName.project}/${currentItem?.id}/model`);
          },
          "Edit proect": () => setOpenEditDialog(true),
          "Delete project": () => handleDeleteAction(),
        }}
      />

      <EditItemDialog
        title={t("edit-project")}
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
        }}
        onSave={async (name, description) => {
          if (currentItem?.id) {
            updateProject.mutateAsync({
              cid: currentItem.id,
              name,
              des: description,
            }, {
              onSuccess: () => {
                setGeneralSnackbarData({
                  open: true,
                  severity: "success",
                  message: t("success-update-project"),
                });
                projects.refetch();
              },
            });
          }
        }}
        initialName={currentItem?.name ?? ""}
        initialDescription={currentItem?.description ?? ""}
      />

      <GeneralSnackbar
        open={generalSnackbarData.open}
        severity={generalSnackbarData.severity}
        onClose={() =>
          setGeneralSnackbarData({ ...generalSnackbarData, open: false })}
      >
        {generalSnackbarData.message}
      </GeneralSnackbar>

      <AddProjectDialog
        open={openAddDialog}
        onSubmit={async (data) => {
          await addProject.mutateAsync({
            name: data.name,
            des: data.description,
          }, {
            onSuccess: (data) => {
              setGeneralSnackbarData({
                open: true,
                severity: "success",
                message: t("success-add-project"),
              });
              projects.refetch();
              router.push(`${basePathName.project}/${data?.new_id}/model`);
            },
          });
        }}
        onClose={() => setOpenAddDialog(false)}
      />
    </div>
  );
}
