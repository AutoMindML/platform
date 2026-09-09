import CloseIcon from "@mui/icons-material/Close";
import { Alert, IconButton, Snackbar } from "@mui/material";
import { ComponentProps } from "react";

export type GeneralSnackbarSeverity = ComponentProps<typeof Alert>["severity"];
export type GeneralSnackbarData = {
  open: boolean;
  message: string;
  severity: GeneralSnackbarSeverity;
};

export default function GeneralSnackbar(
  props: {
    open: boolean;
    children: string;
    severity?: GeneralSnackbarSeverity;
    onClose?: () => void;
  },
) {
  return (
    <div>
      <Snackbar
        open={props.open}
        autoHideDuration={6000}
        onClose={() => props.onClose && props.onClose()}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => props.onClose && props.onClose()}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          onClose={() => props.onClose && props.onClose()}
          severity={props.severity}
          variant="filled"
          sx={{
            color: "primary.main",
          }}
        >
          {props.children}
        </Alert>
      </Snackbar>
    </div>
  );
}
