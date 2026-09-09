"use client";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

import { useTranslation } from "@/i18n/client";
import { useConfirmDialogStore } from "@/store/confirm-dialog";

export default function ConfirmDialog() {
  const state = useConfirmDialogStore(useShallow((state) => ({ ...state })));
  const onClose = state.onClose ?? function () {};
  const onConfirm = state.onConfirm ?? function () {};

  const p = useParams();
  const { t } = useTranslation(p.lng as string, "general");

  return (
    <Dialog
      open={state.open}
      onClose={state.onClose}
    >
      <DialogTitle>
        {state.title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {state.children}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          color="secondary"
          variant="text"
          onClick={state.onClose}
        >
          {t("cancel")}
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          autoFocus
        >
          {t("confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
