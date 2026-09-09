"use client";

import { AppBar, AppBarProps, styled, Toolbar } from "@mui/material";
import { ComponentProps } from "react";

interface StyledAppBarProps extends AppBarProps {
  open?: boolean;
}

export const leftSideBarWidth = 240;

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<StyledAppBarProps>(({ theme }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        // width: `calc(100% - ${leftSideBarWidth}px)`,
        // marginLeft: `${leftSideBarWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

export default function CustomAppBar(
  props: ComponentProps<typeof StyledAppBar>,
) {
  return (
    <StyledAppBar {...props}>
      <Toolbar sx={{ position: "relative" }}>
        {props.children}
      </Toolbar>
    </StyledAppBar>
  );
}
