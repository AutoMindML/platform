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

import SelectAutoComplete from "@/components/select/select-auto-complete";
import { useLngNs } from "@/i18n/hooks";
import { trpc } from "@/server/trpc/client";
import { BasicItemInfo } from "@/types/shared";
import { disableEnterAction } from "@/utils/form";

type AddModelData = {
  dataId: number;
  engineId: number;
  name: string;
  description: string;
  predict: string;
  tag: string;
  selectDataQuery: string;
  trainingOptions: string[];
};

interface AddModelDialogProps {
  open: boolean;
  dataOptions: BasicItemInfo[];
  engineOptions: BasicItemInfo[];
  onClose: () => void;
  onSubmit: (data: AddModelData) => void;
}

const AddModelDialog = ({
  open,
  onClose,
  onSubmit,
  dataOptions,
  engineOptions,
}: AddModelDialogProps) => {
  const t = useLngNs("mutation");
  const tGeneral = useLngNs("general");

  const [selectedDataId, setSelectedDataId] = useState<string | undefined>(
    undefined,
  );
  const [selectedEngineId, setSelectedEngineId] = useState<string | undefined>(
    undefined,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [predict, setPredict] = useState("");

  const datasetInfo = trpc.dataset.getDatasetInfo.useQuery(selectedDataId).data;
  const predictionOptions: BasicItemInfo[] = datasetInfo
    ? datasetInfo.col_names?.split(
      ",",
    ).map((v, i) => {
      return {
        id: i,
        name: v,
        description: datasetInfo.description ?? "",
        createdAt: datasetInfo.created_at,
        updatedAt: datasetInfo.updated_at,
      };
    }) ?? []
    : [];

  const handleSubmit = () => {
    if (selectedDataId && selectedEngineId) {
      const formData: AddModelData = {
        dataId: Number(selectedDataId),
        engineId: Number(selectedEngineId),
        name,
        description,
        tag: "",
        predict,
        selectDataQuery: "",
        trainingOptions: [],
      };
      onSubmit(formData);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("add-model")}</DialogTitle>
      <DialogContent>
        <form
          id="create-model-form"
          onKeyDown={disableEnterAction}
          action={handleSubmit}
        >
          <Box display="flex" flexDirection="column" gap={2} padding={2}>
            <SelectAutoComplete
              data={dataOptions}
              name={"dataId"}
              required
              label={t("select-source")}
              onItemSelect={(value) => {
                setSelectedDataId(value.id.toString());
              }}
            />

            <SelectAutoComplete
              data={engineOptions}
              name={"engineId"}
              required
              optionIncludeId={false}
              label={t("select-engine")}
              onItemSelect={(value) => setSelectedEngineId(value.id.toString())}
            />

            <TextField
              label={"Name"}
              name={"name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              color="info"
            />

            <TextField
              label={tGeneral("description")}
              name={"description"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />

            <SelectAutoComplete
              data={predictionOptions}
              name={"predict"}
              optionIncludeId={false}
              required
              label={tGeneral("predict")}
              onItemSelect={(value) => setPredict(value.name)}
            />
          </Box>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {tGeneral("cancel")}
        </Button>
        <Button
          disabled={!name.trim() || !selectedDataId || !selectedEngineId ||
            !predict}
          variant="contained"
          type="submit"
          form="create-model-form"
          color="primary"
        >
          {tGeneral("create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddModelDialog;
