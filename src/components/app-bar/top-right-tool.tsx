"use client";

import SwitchThemeButton from "../button/switch-theme-button";

import {
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

import { useLngNs } from "@/i18n/hooks";

export default function TopRightTool() {
  const router = useRouter();
  const { data, status } = useSession();
  const t_button = useLngNs("button");

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(
    null,
  );

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <Box
      sx={{
        position: "absolute",
        right: 0,
        display: "flex",
        gap: 1,
        padding: 2,
        alignItems: "center",
      }}
    >
      <SwitchThemeButton />
      {status === "unauthenticated" &&
        (
          <Box sx={{ flexGrow: 0 }}>
            <Button
              color="info"
              variant="contained"
              onClick={() => router.push("/login")}
            >
              {t_button("login")}
            </Button>
          </Box>
        )}
      {status === "authenticated" &&
        (
          <Box sx={{ flexGrow: 0 }}>
            <IconButton
              onClick={handleOpenUserMenu}
              size={"small"}
            >
              <Avatar
                src={data?.user.image ?? undefined}
                alt={data?.user.name ?? "user"}
              />
            </IconButton>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem
                onClick={() => {
                  handleCloseUserMenu();
                  signOut();
                }}
              >
                <Typography sx={{ textAlign: "center" }}>
                  {t_button("logout")}
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        )}
    </Box>
  );
}
