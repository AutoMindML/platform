"use client";

import EditItemDialog from "../_components/modals/edit-item-dialog";
import Manager from "../_containers/manager";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import GeneralSnackbar, {
  GeneralSnackbarData,
} from "@/components/snackbar/general-snackbar";
import { useLngNs } from "@/i18n/hooks";
import { trpc } from "@/server/trpc/client";
import { useConfirmDialogStore } from "@/store/confirm-dialog";
import { BasicItemInfo } from "@/types/shared";

export default function AllApp() {
  const t = useLngNs("mutaion");

  const confirmDialogState = useConfirmDialogStore(
    useShallow((state) => ({ ...state })),
  );
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [generalSnackbarData, setGeneralSnackbarData] = useState<
    GeneralSnackbarData
  >({ open: false, message: "", severity: "success" });

  const [currentItem, setCurrentItem] = useState<BasicItemInfo | undefined>(
    undefined,
  );

  const apps = trpc.app.getManyApps.useQuery();
  const deleteAppPrediction = trpc.app.deleteApp.useMutation();
  const updateObject = trpc.i3s.updateObject.useMutation();

  return (
    <div>
      <Manager
        isLoading={apps.isLoading}
        isSuccess={apps.isSuccess}
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
          //   confirmDialogState.setState({
          //     ...confirmDialogState,
          //     open: true,
          //     title: t("delete-app-title"),
          //     onClose: () =>
          //       confirmDialogState.setState({
          //         open: false,
          //       }),
          //     onConfirm: async () => {
          //       if (currentItem?.id) {
          //         deleteAppPrediction.mutateAsync(currentItem.id, {
          //           onSuccess: (data) => {
          //             if (data?.status === 0) {
          //               setGeneralSnackbarData({
          //                 open: true,
          //                 message: t("success-delete-app"),
          //                 severity: "success",
          //               });
          //               apps.refetch();
          //             } else {
          //               setGeneralSnackbarData({
          //                 open: true,
          //                 message: t("error-delete-app"),
          //                 severity: "error",
          //               });
          //             }
          //           },
          //         });
          //       }
          //     },
          //     children: t("delete-app-des"),
          //   });
          // },
        }}
        data={apps.data
          ? apps.data.map<BasicItemInfo>((v) => ({
            id: v.app_id,
            name: v.name ?? "",
            description: v.description ?? "",
            createdAt: v.created_at,
            updatedAt: v.updated_at,
            status: v.app_status ?? "",
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
                apps.refetch();
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
