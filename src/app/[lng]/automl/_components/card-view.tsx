"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { MouseEvent } from "react";

import { useLngNs } from "@/i18n/hooks";
import {
  BasicItemInfo,
  checkStatus,
  errorStatus,
  progressStatus,
} from "@/types/shared";

const nameHeight = 20;
const desHeight = 50;
const propertiesHeight = 20;

interface ItemCardProps {
  data: BasicItemInfo;
  additionalInfo?: string[];
  onClick?: () => void;
  onEdit?: (v: BasicItemInfo) => void;
  onDelete?: (v: BasicItemInfo) => void;
  onActionMenuClick?: (
    event: MouseEvent<HTMLButtonElement>,
    v: BasicItemInfo,
  ) => void;
}

export default function CardView(props: ItemCardProps) {
  const t = useLngNs("general");
  const tButton = useLngNs("button");
  const cardInfos = [
    `${t("created_at")}: ${new Date(props.data.createdAt).toDateString()}`,
    `${t("updated_at")}: ${new Date(props.data.updatedAt).toDateString()}`,
    ...(props.additionalInfo ?? []),
  ];

  return (
    <Card variant="outlined">
      <CardActionArea onClick={props.onClick}>
        <CardContent>
          <Grid container size={12}>
            <Grid size={10}>
              <Typography
                gutterBottom
                variant="h5"
                height={nameHeight}
                whiteSpace={"nowrap"}
                overflow={"hidden"}
                textOverflow={"ellipsis"}
              >
                {`${props.data.id} - ${props.data.name}`}
              </Typography>
            </Grid>

            <Grid size={2}>
              {props.data.status && (checkStatus.includes(props.data.status)) &&
                (
                  <CheckCircleIcon
                    color="success"
                    sx={{ position: "absolute", right: 10 }}
                  />
                )}
              {props.data.status && (errorStatus.includes(props.data.status)) &&
                (
                  <ErrorIcon
                    color="error"
                    sx={{ position: "absolute", right: 10 }}
                  />
                )}
              {props.data.status &&
                (progressStatus.includes(props.data.status)) &&
                (
                  <CircularProgress
                    size={20}
                    color="info"
                    sx={{ position: "absolute", right: 10 }}
                  />
                )}
            </Grid>
          </Grid>

          <Box height={desHeight}>
            <Typography
              variant="subtitle1"
              color="textPrimary"
              gutterBottom
              overflow={"auto"}
            >
              {props.data.type && t("type") + ": "} {props.data.type ?? ""}
            </Typography>
            <Typography
              variant="subtitle1"
              color="textPrimary"
              gutterBottom
              overflow={"auto"}
            >
              {props.data.status && t("status") + ": "}{" "}
              {props.data.status ?? ""}
            </Typography>
          </Box>

          {cardInfos.map((v, i) => {
            return (
              <Typography
                key={i}
                variant="subtitle2"
                textAlign={"start"}
                height={propertiesHeight}
                {...(v.split(":").at(1)?.trim() === "undefined") &&
                  { color: "warning.main" }}
              >
                {v}
              </Typography>
            );
          })}
        </CardContent>
      </CardActionArea>

      {props.data.type !== "system" &&
        (
          <CardActions>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "right",
              }}
            >
              <Tooltip title={tButton("action")}>
                <IconButton
                  size="small"
                  aria-label="actions"
                  onClick={(event) =>
                    props.onActionMenuClick &&
                    props.onActionMenuClick(event, props.data)}
                >
                  <MoreHorizIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </CardActions>
        )}
    </Card>
  );
}
