import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";
import * as React from "react";

import { useLngNs } from "@/i18n/hooks";

interface AddProjectDialogProps {
  open: boolean;
  onClose?: () => void;
  onSubmit?: (data: { name: string; description: string }) => void;
}

const AddProjectDialog: React.FC<AddProjectDialogProps> = ({
  open,
  onClose = () => {},
  onSubmit = () => {},
}) => {
  const t_general = useLngNs("general");
  const t = useLngNs("mutation");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    onSubmit({ name, description });
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("add-project")}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t("project-name")}
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t_general("description")}
          type="text"
          fullWidth
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {t_general("cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={!name.trim()}
          variant="contained"
        >
          {t_general("create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProjectDialog;
