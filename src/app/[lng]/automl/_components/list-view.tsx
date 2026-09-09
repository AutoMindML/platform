"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { MouseEvent } from "react";

import { useLngNs } from "@/i18n/hooks";
import {
  BasicItemInfo,
  checkStatus,
  errorStatus,
  progressStatus,
} from "@/types/shared";

interface ListViewProps {
  data: BasicItemInfo[];
  additionalInfo?: Record<string, string[]>;
  onCheck?: (v: BasicItemInfo) => void;
  onEdit?: (v: BasicItemInfo) => void;
  onDelete?: (v: BasicItemInfo) => void;
  onActionMenuClick?: (
    event: MouseEvent<HTMLButtonElement>,
    v: BasicItemInfo,
  ) => void;
}

const ListView = (props: ListViewProps) => {
  const t = useLngNs("general");
  const tButton = useLngNs("button");

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t("id")}</TableCell>
            <TableCell>{t("name")}</TableCell>

            {props.data.length > 0 && props.data[0].type &&
              <TableCell>{t("type")}</TableCell>}

            {props.data.length > 0 && props.data[0].status &&
              <TableCell>{t("status")}</TableCell>}

            <TableCell>{t("created_at")}</TableCell>
            <TableCell>{t("updated_at")}</TableCell>

            {Object.values(props.additionalInfo ?? {}).at(0)?.map((v, i) => {
              return (
                <TableCell key={i}>{v.split(":").at(0)?.trim()}</TableCell>
              );
            })}

            <TableCell>{t("actions")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map((v) => (
            <TableRow
              key={v.id}
              sx={{
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <TableCell>{v.id}</TableCell>
              <TableCell>{v.name}</TableCell>

              {props.data.length > 0 && props.data[0].type &&
                <TableCell>{v.type}</TableCell>}

              {props.data.length > 0 && props.data[0].status &&
                (
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {v.status}
                      {v.status && checkStatus.includes(v.status) && (
                        <CheckCircleIcon color="success" />
                      )}
                      {v.status && errorStatus.includes(v.status) && (
                        <ErrorIcon color="error" />
                      )}
                      {v.status && progressStatus.includes(v.status) &&
                        v.status !== "complete" &&
                        <CircularProgress size={20} color="info" />}
                    </Box>
                  </TableCell>
                )}

              <TableCell>{new Date(v.createdAt).toDateString()}</TableCell>
              <TableCell>{new Date(v.updatedAt).toDateString()}</TableCell>

              {props.additionalInfo?.[v.id]?.map((v, i) => {
                const value = v.split(":").at(1)?.trim();

                return (
                  <TableCell
                    key={i}
                    sx={{
                      ...(value === "undefined" && { color: "warning.main" }),
                    }}
                  >
                    {value}
                  </TableCell>
                );
              })}

              <TableCell>
                {v.type !== "system" &&
                  (
                    <>
                      <Tooltip title={tButton("action")}>
                        <IconButton
                          size="small"
                          aria-label="actions"
                          onClick={(event) => {
                            if (props.onActionMenuClick) {
                              props.onActionMenuClick(event, v);
                            }
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                <Tooltip title={tButton("view")}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => props.onCheck &&
                      props.onCheck(v)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ListView;
