"use client";

import { Box, CircularProgress, useTheme } from "@mui/material";

export default function Loading(
  props: { floating?: boolean } = { floating: true },
) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        backdropFilter: "blur(10px)",
        display: props.floating ? "fixed" : "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99,
        position: "fixed",
        backgroundColor: theme.palette.mode === "dark"
          ? "rgb(0, 0, 0, 0.3)"
          : "rgb(252, 252, 252, 0.3)",
      }}
    >
      <Box>
        <CircularProgress color={"info"} size={80}></CircularProgress>
      </Box>
    </Box>
  );
}
