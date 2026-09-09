"use client";

import { Grid, useTheme } from "@mui/material";

//const topbarHeight = 150;

export default function GridTopbar(props: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <Grid
      container
      size={12}
      spacing={1}
      sx={{
        //height: topbarHeight,
        position: "sticky",
        top: 0,
        backgroundColor: theme.palette.background.paper,
        zIndex: 10,
        padding: 2,
        border: "divider",
      }}
    >
      {props.children}
    </Grid>
  );
}
