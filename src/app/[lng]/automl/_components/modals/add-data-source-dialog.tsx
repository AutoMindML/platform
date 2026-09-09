"use client";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import { ChangeEvent, useState } from "react";

import { useTranslation } from "@/i18n/client";
import { useLngNs } from "@/i18n/hooks";

type DataSourceType = "file" | "database" | "fusion";
const acceptFileTypes = ["text/csv", "application/vnd.ms-excel"];

export interface DataSourceForm {
  type: DataSourceType;
  name: string;
  description: string;
  file?: File | null;
  engine?: string;
  connection_args?: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
  };
}

interface AddDataSourceDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DataSourceForm) => void;
}

const AddDataSourceDialog = (
  { open, onClose, onSubmit }: AddDataSourceDialogProps,
) => {
  const p = useParams();
  const { t: t_general } = useTranslation(p.lng as string, "general");
  const t = useLngNs("mutation");

  const [dataSourceType, setDataSourceType] = useState<DataSourceType>(
    "file",
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [dataSourceForm, setDataSourceForm] = useState<DataSourceForm>({
    type: "file",
    name: "",
    description: "",
    file: null,
    engine: "mssql",
    connection_args: {
      host: "",
      port: 1433,
      user: "",
      password: "",
      database: "",
    },
  });

  const handleTypeChange = (
    e: SelectChangeEvent<DataSourceType>,
  ) => {
    const type = e.target.value as DataSourceType;

    setDataSourceType(type);
    setDataSourceForm((prev) => ({
      ...prev,
      type,
      file: type === "file" ? null : undefined,
    }));
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setDataSourceForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file && !acceptFileTypes.includes(file.type)) {
      alert("Only CSV files are allowed!");
      return;
    }

    setDataSourceForm((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleConnectionArgsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDataSourceForm((prev) => ({
      ...prev,
      connection_args: {
        ...prev.connection_args,
        [name]: name === "port" ? parseInt(value) || 0 : value,
      },
    }));
  };

  const handleSubmit = () => {
    if (dataSourceType === "file" && !dataSourceForm.file) {
      alert("Please upload a valid CSV file.");
      return;
    }
    onSubmit(dataSourceForm);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("add-source")}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel id="data-source-type-label">
            {t("source-type")}
          </InputLabel>
          <Select
            label={t("source-type")}
            labelId="data-source-type-label"
            value={dataSourceType}
            onChange={handleTypeChange}
          >
            <MenuItem value="file">File</MenuItem>
            <MenuItem value="fusion">Fusion</MenuItem>
          </Select>
        </FormControl>

        <TextField
          required
          label={t_general("name")}
          name="name"
          value={dataSourceForm.name}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label={t_general("description")}
          name="description"
          value={dataSourceForm.description}
          onChange={handleInputChange}
          fullWidth
          multiline
          rows={3}
          margin="normal"
        />

        {dataSourceType === "file" && (
          <>
            <Button
              variant="outlined"
              component="label"
              sx={{ marginTop: 2 }}
            >
              Upload CSV
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileChange}
              />
            </Button>
            {dataSourceForm.file && (
              <Typography variant="body2" sx={{ marginTop: "8px" }}>
                Selected File: {dataSourceForm.file.name}
              </Typography>
            )}
          </>
        )}

        {dataSourceType === "database" && (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel id="database-engine-label">
                {t("engine")}
              </InputLabel>
              <Select
                label={t("engine")}
                labelId="database-engine-label"
                value={dataSourceForm.engine || ""}
                onChange={(e) =>
                  setDataSourceForm((prev) => ({
                    ...prev,
                    engine: e.target.value as string,
                  }))}
              >
                <MenuItem value="mssql">MSSQL</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <TextField
                required
                label={t_general("host")}
                name="host"
                error={!dataSourceForm.connection_args?.host}
                value={dataSourceForm.connection_args?.host || ""}
                onChange={handleConnectionArgsChange}
                fullWidth
                margin="normal"
              />
              <TextField
                required
                label={t_general("port")}
                name="port"
                type="number"
                error={!dataSourceForm.connection_args?.port}
                value={dataSourceForm.connection_args?.port || ""}
                onChange={handleConnectionArgsChange}
                fullWidth
                margin="normal"
              />
              <TextField
                required
                label={t_general("user")}
                name="user"
                error={!dataSourceForm.connection_args?.user}
                value={dataSourceForm.connection_args?.user || ""}
                onChange={handleConnectionArgsChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t_general("password")}
                name="password"
                type={showPassword ? "text" : "password"}
                value={dataSourceForm.connection_args?.password || ""}
                onChange={handleConnectionArgsChange}
                fullWidth
                margin="normal"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showPassword
                            ? <VisibilityIcon />
                            : <VisibilityOffIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                label={t_general("database")}
                name="database"
                value={dataSourceForm.connection_args?.database || ""}
                onChange={handleConnectionArgsChange}
                fullWidth
                margin="normal"
              />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {t_general("cancel")}
        </Button>
        <Button
          disabled={(function () {
            if (dataSourceForm.type == "file") {
              return !dataSourceForm.file || !dataSourceForm.name.trim();
            }

            return !dataSourceForm.name.trim();
          })()}
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          {t_general("create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDataSourceDialog;
