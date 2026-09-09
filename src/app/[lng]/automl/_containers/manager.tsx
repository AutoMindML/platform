"use client";

import CardView from "../_components/card-view";
import ControlDataToolbar from "../_components/control-data-toolbar";
import GridTopbar from "../_components/grid-topbar";
import ListView from "../_components/list-view";
import DetailModal from "../_components/modals/detail-modal";

import { Button, Grid, Skeleton, Typography } from "@mui/material";
import { MouseEvent, useEffect, useMemo, useReducer, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useLngNs } from "@/i18n/hooks";
import { SortAction, useToolbarStore } from "@/store/toolbar";
import { BasicItemInfo } from "@/types/shared";

interface ManagerProps {
  add?: {
    title?: string;
    onClick?: () => void;
  };
  item?: {
    onClick?: (v: BasicItemInfo) => void;
    onActionMenuClick?: (
      event: MouseEvent<HTMLButtonElement>,
      v: BasicItemInfo,
    ) => void;
  };
  data: BasicItemInfo[];
  additionalInfo?: { [id: string]: string[] };
  detailModalAdditionalComponent?: React.ReactNode;
  isLoading?: boolean;
  isSuccess?: boolean;
  children?: React.ReactNode;
}

const dataReducer = (
  state: BasicItemInfo[],
  action: {
    type: SortAction | "fetch";
    isDescending?: boolean;
    newData?: BasicItemInfo[];
  },
) => {
  switch (action.type) {
    case "id": {
      return state.toSorted((a, b) => {
        return action.isDescending ? b.id - a.id : a.id - b.id;
      });
    }
    case "name":
      return state.toSorted((a, b) => {
        return action.isDescending
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      });
    case "created_at":
      return state.toSorted((a, b) => {
        return action.isDescending
          ? b.createdAt.getTime() - a.createdAt.getTime()
          : a.createdAt.getTime() - b.createdAt.getTime();
      });
    case "updated_at":
      return state.toSorted((a, b) => {
        return action.isDescending
          ? b.updatedAt.getTime() - a.updatedAt.getTime()
          : a.updatedAt.getTime() - b.updatedAt.getTime();
      });
    case "fetch":
      if (action.newData) {
        return action.newData.toSorted((a, b) => {
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
      }
      return action.newData ?? state;
    default:
      return state;
  }
};

export default function Manager(props: ManagerProps) {
  const t = useLngNs("general");

  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [data, setData] = useReducer(
    dataReducer,
    [],
  );

  const toolbarState = useToolbarStore(useShallow((state) => ({
    view: state.view,
    sortBy: state.sortBy,
    isDescending: state.isDescending,
    search: state.search,
    filterType: state.filterType,
  })));

  const filterData = useMemo(() => {
    return data.filter((v) => {
      const search = toolbarState.search.toLowerCase();
      return v.name.toLowerCase().includes(
        search,
      ) ||
        v.id.toString().toLowerCase().includes(
          search,
        );
    });
  }, [data, toolbarState.search]);

  const [detail, setDetail] = useState<BasicItemInfo>({
    id: 0,
    name: "",
    description: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  useEffect(() => {
    if (props.isSuccess) {
      setData({ type: "fetch", newData: props.data });
    }
  }, [props.isSuccess, props.data]);

  useEffect(() => {
    setData({
      type: toolbarState.sortBy,
      isDescending: toolbarState.isDescending,
    });
  }, [props.data, toolbarState]);

  return (
    <Grid container spacing={1}>
      <GridTopbar>
        <Grid container size={12}>
          {props.children}
        </Grid>
        {props.add?.title &&
          (
            <Grid size={12}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  if (props.add?.onClick) props.add.onClick();
                }}
              >
                {props.add?.title ?? ""}
              </Button>
            </Grid>
          )}
        <Grid size={12}>
          <ControlDataToolbar />
        </Grid>
      </GridTopbar>

      <DetailModal
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        detail={detail}
        additionalDetail={props.additionalInfo?.[detail.id]}
      >
        {props.detailModalAdditionalComponent}
      </DetailModal>

      <Grid container size={12}>
        {props.isLoading &&
          Array.from({ length: 20 }).map((_, i) => {
            return (
              <Grid key={i} size={{ lg: 3, md: 4, xs: 12 }}>
                <Skeleton variant="rectangular" height={100} />
              </Grid>
            );
          })}
        {!props.isLoading && data.length === 0 && (
          <Typography
            sx={{ textAlign: "center" }}
            width={"100%"}
            variant="h3"
            color="textSecondary"
          >
            {t("empty")}
          </Typography>
        )}
        {!props.isLoading && data.length > 0 && ((toolbarState.view === "grid")
          ? filterData.map((v, i) => {
            return (
              <Grid
                key={i}
                size={{ lg: 3, md: 4, xs: 12 }}
              >
                <CardView
                  data={v}
                  additionalInfo={props.additionalInfo?.[v.id]}
                  onClick={() => {
                    if (props.item && props.item.onClick) {
                      props.item.onClick(v);
                    }
                    setDetail(v);
                    setOpenDetailModal(true);
                  }}
                  onActionMenuClick={props.item?.onActionMenuClick}
                />
              </Grid>
            );
          })
          : (
            <ListView
              data={filterData}
              additionalInfo={props.additionalInfo}
              onCheck={(v) => {
                if (props.item && props.item?.onClick) {
                  props.item.onClick(v);
                }

                setDetail(v);
                setOpenDetailModal(true);
              }}
              onActionMenuClick={props.item?.onActionMenuClick}
            />
          ))}
      </Grid>
    </Grid>
  );
}
