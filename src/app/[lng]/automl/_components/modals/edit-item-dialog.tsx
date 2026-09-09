"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useParams } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";

import { useTranslation } from "@/i18n/client";

interface EditItemDialogProps {
  title?: string;
  open: boolean;
  initialName: string;
  initialDescription: string;
  onClose?: () => void;
  onSave?: (name: string, description: string) => void;
}

const EditItemDialog = ({
  title = "",
  open,
  onClose = () => {},
  onSave = () => {},
  initialName,
  initialDescription,
}: EditItemDialogProps) => {
  const p = useParams();
  const { t } = useTranslation(p.lng as string, "general");

  const [name, setName] = useState<string>(initialName);
  const [description, setDescription] = useState<string>(initialDescription);

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
  }, [initialName, initialDescription]);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleSubmit = () => {
    onSave(name, description);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          required
          label={t("name")}
          value={name}
          onChange={handleNameChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label={t("description")}
          value={description}
          onChange={handleDescriptionChange}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {t("cancel")}
        </Button>
        <Button
          disabled={!name.trim()}
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          {t("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditItemDialog;
