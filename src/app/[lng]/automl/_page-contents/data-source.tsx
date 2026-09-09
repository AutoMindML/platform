"use client";

import AddDataSourceDialog from "../_components/modals/add-data-source-dialog";
import EditItemDialog from "../_components/modals/edit-item-dialog";
import Manager from "../_containers/manager";

import { LinearProgress } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useContext, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import ActionMenu, { ActionMenuContext } from "@/components/menu/action-menu";
import GeneralSnackbar, {
  GeneralSnackbarData,
} from "@/components/snackbar/general-snackbar";
import { DynamicTable } from "@/components/table/dynamic-table";
import { useLngNs } from "@/i18n/hooks";
import { trpc } from "@/server/trpc/client";
import { useConfirmDialogStore } from "@/store/confirm-dialog";
import { BasicItemInfo } from "@/types/shared";

export default function DataSource() {
  const tMutation = useLngNs("mutation");
  const tButtion = useLngNs("button");

  const session = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const actionMenuContext = useContext(ActionMenuContext);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [generalSnackbarData, setGeneralSnackbarData] = useState<
    GeneralSnackbarData
  >({ open: false, message: "", severity: "success" });

  const [currentItem, setCurrentItem] = useState<BasicItemInfo | undefined>(
    undefined,
  );

  const datasets = trpc.dataset.getManyDatasets.useQuery();
  const datasetContent = trpc.dataset.getDatasetContent.useQuery(
    currentItem?.id,
  );
  const deleteDataSource = trpc.dataset.deleteDataset.useMutation();
  const updateObject = trpc.i3s.updateObject.useMutation();
  const initDataFusion = trpc.automl.fusion.initDataFusion.useMutation();
  const confirmDialogState = useConfirmDialogStore(
    useShallow((state) => ({ ...state })),
  );

  const handleDeleteAction = () => {
    confirmDialogState.setState({
      open: true,
      title: tMutation("delete-source-title"),
      onClose: () =>
        confirmDialogState.setState({
          open: false,
        }),
      onConfirm: async () => {
        if (currentItem?.id) {
          deleteDataSource.mutateAsync(currentItem.id, {
            onSuccess: (data) => {
              if (data.state === 0) {
                setGeneralSnackbarData({
                  open: true,
                  message: tMutation("success-delete-source"),
                  severity: "success",
                });
                datasets.refetch();
              } else {
                setGeneralSnackbarData({
                  open: true,
                  message: tMutation("error-delete-source"),
                  severity: "error",
                });
              }
            },
          });
        }
      },
      children: tMutation("delete-source-des"),
    });
  };

  return (
    <div>
      <Manager
        isLoading={datasets.isFetching}
        isSuccess={datasets.isSuccess}
        add={{
          title: tMutation("add-source"),
          onClick: () => setOpenAddDialog(true),
        }}
        detailModalAdditionalComponent={
          <>
            {datasetContent.isFetching && (
              <>
                <LinearProgress sx={{ width: "100%" }} color="info" />
                <DynamicTable
                  data={[]}
                  height={"calc(100% - 50px)"}
                  tableHeightLimit={"100%"}
                />
              </>
            )}

            {datasetContent.isFetched &&
              (
                <DynamicTable
                  data={datasetContent?.data?.content ?? []}
                  height={"calc(100% - 50px)"}
                  tableHeightLimit={"100%"}
                />
              )}
          </>
        }
        item={{
          onClick: (v) => {
            setCurrentItem(v);
          },
          onActionMenuClick: (event, v) => {
            setCurrentItem(v);
            actionMenuContext.handleActionMenuClick(event);
          },
        }}
        data={datasets.data
          ? datasets.data.map<BasicItemInfo>((v) => ({
            id: v.oid,
            name: v.name ?? "",
            type: v.source_type ?? "",
            description: v.description ?? "",
            createdAt: v.created_at,
            updatedAt: v.updated_at,
          }))
          : []}
        additionalInfo={datasets.data?.reduce(
          (acc, current) => {
            acc[current.oid] = [
              "rows: " + current.rows?.toString(),
              "cols: " + current.cols?.toString(),
              `size: ${
                current.size
                  ? (current.size / (1024 ** 2)).toFixed(1) +
                    " MB"
                  : "undefined"
              }`,
            ];
            return acc;
          },
          {} as Exclude<
            React.ComponentProps<typeof Manager>["additionalInfo"],
            undefined
          >,
        )}
      />

      {currentItem?.type === "fusion" &&
        (
          <ActionMenu
            actions={{
              [tButtion("fusion")]: () => {
                router.push(
                  pathname + "/fusion/" + currentItem?.id.toString(),
                );
              },
              [tButtion("process-data")]: () => {
                router.push(
                  pathname + "/" +
                    currentItem?.id.toString(),
                );
              },
              [tButtion("edit")]: () => {
                setOpenEditDialog(true);
              },
              [tButtion("delete")]: () => {
                handleDeleteAction();
              },
            }}
          />
        )}

      {currentItem?.type === "file" &&
        (
          <ActionMenu
            actions={{
              [tButtion("process-data")]: () => {
                router.push(
                  pathname + "/" +
                    currentItem?.id.toString(),
                );
              },
              [tButtion("edit")]: () => {
                setOpenEditDialog(true);
              },
              [tButtion("delete")]: () => {
                handleDeleteAction();
              },
            }}
          />
        )}

      <AddDataSourceDialog
        onSubmit={(data) => {
          if (data.type == "fusion") {
            initDataFusion.mutateAsync({
              name: data.name,
              des: data.description,
            }, {
              onSuccess: (data) => {
                if (data.state == 0) {
                  setGeneralSnackbarData({
                    open: true,
                    message: tMutation("success-add-source"),
                    severity: "success",
                  });
                  datasets.refetch();
                }
              },
            });
            return;
          }

          if (data.file && session.data) {
            const formData = new FormData();

            formData.append("name", data.name);
            formData.append("des", data.description);
            formData.append("file", data.file);

            fetch(
              "/api/upload",
              {
                method: "POST",
                body: formData,
              },
            ).then(async (res) => {
              if (res.status === 200) {
                setGeneralSnackbarData({
                  open: true,
                  message: tMutation("success-add-source"),
                  severity: "success",
                });
                datasets.refetch();
              }
            });

            return;
          }
        }}
        onClose={() => setOpenAddDialog(false)}
        open={openAddDialog}
      />

      <EditItemDialog
        title={tMutation("edit-source")}
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
                  message: tMutation("success-update-source"),
                  severity: "success",
                });
                datasets.refetch();
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
