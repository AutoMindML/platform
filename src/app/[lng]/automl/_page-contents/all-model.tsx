"use client";

import EditItemDialog from "../_components/modals/edit-item-dialog";
import Manager from "../_containers/manager";

import { useState } from "react";
import { useCookies } from "react-cookie";
import { useShallow } from "zustand/react/shallow";

import GeneralSnackbar, {
  GeneralSnackbarData,
} from "@/components/snackbar/general-snackbar";
import { useLngNs } from "@/i18n/hooks";
import { trpc } from "@/server/trpc/client";
import { useConfirmDialogStore } from "@/store/confirm-dialog";
import { BasicItemInfo } from "@/types/shared";

export default function AllModel() {
  const t = useLngNs("mutation");
  const [cookies] = useCookies();

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [generalSnackbarData, setGeneralSnackbarData] = useState<
    GeneralSnackbarData
  >({ open: false, message: "", severity: "success" });

  const [currentItem, setCurrentItem] = useState<BasicItemInfo | undefined>(
    undefined,
  );

  const models = trpc.model.getManyModelsBasicInfo.useQuery();
  const deleteModel = trpc.model.deleteModel.useMutation();
  const updateObject = trpc.i3s.updateObject.useMutation();

  const confirmDialogState = useConfirmDialogStore(
    useShallow((state) => ({ ...state })),
  );

  const handleDelete = () => {
    confirmDialogState.setState({
      open: true,
      title: t("delete-model-title"),
      onClose: () =>
        confirmDialogState.setState({
          open: false,
        }),
      onConfirm: async () => {
        if (currentItem?.id && cookies["current-project-id"]) {
          deleteModel.mutateAsync({
            modelId: currentItem.id,
          }, {
            onSuccess: (data) => {
              if (data.state === 0) {
                setGeneralSnackbarData({
                  open: true,
                  message: t("success-delete-model"),
                  severity: "success",
                });
                models.refetch();
              } else {
                setGeneralSnackbarData({
                  open: true,
                  message: t("error-delete-model"),
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
        isLoading={models.isLoading}
        isSuccess={models.isSuccess}
        item={{
          onClick: (v) => {
            setCurrentItem(v);
          },
          // onEdit: (v) => {
          //   setCurrentItem(v);
          //   setOpenEditDialog(true);
          // },
          // onDelete: (v) => {
          //   setCurrentItem(v);
          //   handleDelete();
          // },
        }}
        data={models.data
          ? models.data.map<BasicItemInfo>((v) => ({
            id: v.model_id,
            name: v.name ?? "",
            description: v.description ?? "",
            createdAt: v.created_at,
            updatedAt: v.updated_at,
            status: v.status ?? "",
          }))
          : []}
      />

      <EditItemDialog
        title={t("edit-model")}
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
        }}
        onSave={async (name, description) => {
          if (currentItem?.id) {
            updateObject.mutateAsync({
              oid: currentItem.id,
              name,
              des: description,
            }, {
              onSuccess: () => {
                setGeneralSnackbarData({
                  open: true,
                  message: t("success-update-model"),
                  severity: "success",
                });
                models.refetch();
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
    </div>
  );
}
