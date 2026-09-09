"use client";

import LoginContent from "./login-content";

import CloseIcon from "@mui/icons-material/Close";
import { DialogActions, IconButton } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { useRouter } from "next/navigation";

export default function LoginDialog() {
  const router = useRouter();

  return (
    <Dialog open={true} onClose={() => router.back()} fullScreen>
      <DialogContent sx={{ display: "flex" }}>
        <LoginContent />
      </DialogContent>

      <DialogActions>
        <IconButton onClick={() => router.back()}>
          <CloseIcon />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}
