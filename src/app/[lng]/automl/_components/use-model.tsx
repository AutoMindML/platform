"use client";

import {
  Box,
  Button,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { useLngNs } from "@/i18n/hooks";

interface UseModelProps {
  isLoading?: boolean;
  inputFeatures: string[];
  outputFeature: string;
  onSubmit?: (inputs: Record<string, string> | Record<string, number>) => void;
  modelOutput?: string;
}

const UseModel = (
  {
    isLoading = false,
    inputFeatures,
    outputFeature,
    onSubmit,
    modelOutput = "",
  }: UseModelProps,
) => {
  const t = useLngNs("mutation");
  const t_general = useLngNs("general");

  const [inputValues, setInputValues] = useState<Record<string, string>>(
    inputFeatures.reduce((acc, feature) => ({ ...acc, [feature]: "" }), {}),
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(inputValues);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        maxWidth: 400,
        margin: "0 auto",
      }}
    >
      <Typography variant="h5" textAlign="center">
        {t("use-model")}
      </Typography>

      {inputFeatures.map((feature, i) => (
        <TextField
          key={i}
          label={feature}
          name={feature}
          value={inputValues[feature]}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
        />
      ))}

      <Typography variant="h6" textAlign="start">
        {t("output-feature")}
        {outputFeature}
      </Typography>

      {isLoading
        ? <LinearProgress color="info" sx={{ width: "100%" }} />
        : (
          <Typography variant="h6" textAlign="start" color="primary">
            {modelOutput}
          </Typography>
        )}

      <Button variant="contained" color="primary" onClick={handleSubmit}>
        {t_general("predict")}
      </Button>
    </Box>
  );
};

export default UseModel;
