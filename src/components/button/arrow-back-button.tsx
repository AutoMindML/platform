"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { ComponentProps } from "react";

import { useLngNs } from "@/i18n/hooks";

export default function ArrowBackButton(
  props: ComponentProps<typeof IconButton> & { backAction?: boolean },
) {
  const { backAction, ...rest } = props;
  const theme = useTheme();
  const router = useRouter();
  const tButton = useLngNs("button");

  return (
    <Tooltip title={tButton("previous")}>
      <IconButton
        {...rest}
        onClick={(event) => {
          if (props.onClick) {
            props.onClick(event);
          }

          if (backAction) {
            router.back();
          }
        }}
      >
        <ArrowBackIcon sx={{ color: theme.palette.common.white }} />
      </IconButton>
    </Tooltip>
  );
}
