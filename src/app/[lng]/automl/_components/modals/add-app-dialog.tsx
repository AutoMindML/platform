import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";
import * as React from "react";

import SelectAutoComplete from "@/components/select/select-auto-complete";
import { useLngNs } from "@/i18n/hooks";
import { BasicItemInfo } from "@/types/shared";

interface AddAppDialogProps {
  open: boolean;
  modelOptions: BasicItemInfo[];
  onClose?: () => void;
  onSubmit?: (data: { id: string; name: string; description: string }) => void;
}

const AddAppDialog: React.FC<AddAppDialogProps> = ({
  open,
  modelOptions,
  onClose = () => {},
  onSubmit = () => {},
}) => {
  const t_general = useLngNs("general");
  const t = useLngNs("mutation");

  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(
    undefined,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (selectedModelId) {
      onSubmit({ id: selectedModelId, name, description });
      setName("");
      setDescription("");
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("add-app")}</DialogTitle>
      <DialogContent>
        <Box sx={{ padding: 1 }}>
          <SelectAutoComplete
            required
            data={modelOptions}
            label={t("select-model")}
            onItemSelect={(value) => setSelectedModelId(value.id.toString())}
          />
          <TextField
            autoFocus
            margin="dense"
            label={t("app-name")}
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {t_general("cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={!name.trim() || !selectedModelId}
          variant="contained"
        >
          {t_general("create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAppDialog;
