"use client";

import {
  AppBar,
  Box,
  ButtonGroup,
  Link,
  Toolbar,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

import ArrowBackButton from "@/components/button/arrow-back-button";
import SwitchThemeButton from "@/components/button/switch-theme-button";

interface EditAppBarProps {
  title?: string | null;
  menu?: Record<string, string>;
  currentMenuName?: string;
  goBackPathname?: string;
}

export default function EditAppBar(props: EditAppBarProps) {
  const { title = "", menu = {}, currentMenuName, goBackPathname } = props;
  const router = useRouter();

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ position: "relative" }}>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          flexGrow={1}
          alignItems={"center"}
        >
          <Typography variant="h6" noWrap component="div">
            {title}
          </Typography>
          <Box
            display={"flex"}
            gap={2}
          >
            {Object.keys(menu).map((k, i) => {
              return (
                <Link
                  key={`${k.toString()}_${i}`}
                  underline="hover"
                  href={menu[k]}
                  color={currentMenuName == k ? "info.light" : "common.white"}
                >
                  {k}
                </Link>
              );
            })}
          </Box>
          <ButtonGroup>
            <ArrowBackButton
              backAction={goBackPathname ? false : true}
              onClick={() => goBackPathname && router.push(goBackPathname)}
            />
            <SwitchThemeButton />
          </ButtonGroup>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
