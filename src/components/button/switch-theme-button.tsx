"use client";

import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import { useContext } from "react";

import { useLngNs } from "@/i18n/hooks";
import { ColorModeContext } from "@/utils/theme/hook";

export default function SwitchThemeButton() {
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();
  const tButton = useLngNs("button");

  return (
    <Tooltip title={tButton("theme")}>
      <IconButton
        size="large"
        onClick={() => colorMode.toggleColorMode()}
      >
        {theme.palette.mode === "dark"
          ? <DarkModeOutlinedIcon />
          : (
            <LightModeOutlinedIcon
              sx={{ color: theme.palette.common.white }}
            />
          )}
      </IconButton>
    </Tooltip>
  );
}
