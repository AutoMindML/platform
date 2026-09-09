"use client";

import AppsIcon from "@mui/icons-material/Apps";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FolderIcon from "@mui/icons-material/Folder";
import LayersIcon from "@mui/icons-material/Layers";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

import CustomAppBar, { leftSideBarWidth } from "@/components/app-bar/index";
import TopRightTool from "@/components/app-bar/top-right-tool";
import AutoMindIcon from "@/components/icons/automind";
import {
  ActionMenuContext,
  useActionMenu,
} from "@/components/menu/action-menu";
import { useLngNs } from "@/i18n/hooks";

const links = ["data", "engine", "project", "model", "app"];
const icons = [
  <StorageIcon key={"data"} />,
  <SettingsIcon key={"engine"} />,
  <FolderIcon key={"project"} />,
  <LayersIcon key={"model"} />,
  <AppsIcon key={"app"} />,
];

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  display: "block",
  // width: `calc(100% - ${leftSideBarWidth}px)`,
  // marginLeft: `-${leftSideBarWidth}px`,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create("margin", {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      },
    },
  ],
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function Center(props: { children: ReactNode }) {
  const pathname = usePathname();
  const tAutoml = useLngNs("automl");
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const actionMenuContext = useActionMenu();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleDrawerButtonClick = (links: string[], index: number) => {
    const basePathNames = pathname.split("/");
    basePathNames.pop();
    basePathNames.push(links[index]);
    router.push(basePathNames.join("/"));
  };

  return (
    <Box sx={{ display: "flex", width: "100vw" }}>
      <ActionMenuContext.Provider value={actionMenuContext}>
        <CustomAppBar position="fixed" open={open}>
          <IconButton
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              { mr: 2 },
              open && { display: "none" },
            ]}
          >
            <MenuIcon sx={{ color: theme.palette.common.white }} />
          </IconButton>
          <AutoMindIcon sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap component="div">
            {tAutoml("app-bar-title")}
          </Typography>
          <TopRightTool />
        </CustomAppBar>
        <Drawer
          sx={{
            width: leftSideBarWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: leftSideBarWidth,
              boxSizing: "border-box",
            },
          }}
          variant="temporary"
          anchor="left"
          open={open}
          onClose={handleDrawerClose}
        >
          <DrawerHeader>
            <Box
              sx={{
                display: "flex",
                position: "absolute",
                left: 20,
                gap: 1,
                alignItems: "center",
              }}
            >
              <AutoMindIcon />
              <Typography
                variant="h6"
                noWrap
                component="div"
              >
                {tAutoml("app-bar-title")}
              </Typography>
            </Box>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "ltr"
                ? <ChevronLeftIcon />
                : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            {tAutoml("left-side-bar-items").split(";").map((
              text,
              index,
            ) => (
              <ListItem
                key={text}
                sx={{
                  paddingLeft: 1,
                  paddingRight: 1,
                  paddingTop: 0.2,
                  paddingBottom: 0.2,
                }}
              >
                <ListItemButton
                  selected={pathname.split("/").pop() === links[index]}
                  sx={{
                    borderRadius: 2,
                    "&.Mui-selected": {
                      bgcolor: "secondary.main",
                      // color: "primary.contrastText",
                      "&:hover": {
                        bgcolor: "secondary.dark",
                      },
                      "& .MuiListItemIcon-root": {
                        // color: "primary.contrastText",
                      },
                    },
                  }}
                  onClick={() => handleDrawerButtonClick(links, index)}
                >
                  <ListItemIcon>
                    {icons[index]}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Main open={open}>
          {props.children}
        </Main>
      </ActionMenuContext.Provider>
    </Box>
  );
}
