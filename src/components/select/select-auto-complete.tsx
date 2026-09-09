import { Autocomplete, Box, FormControl, TextField } from "@mui/material";
import { useState } from "react";

import { BasicItemInfo } from "@/types/shared";

interface SelectAutoCompleteProps {
  data: BasicItemInfo[];
  name?: string;
  label?: string;
  optionIncludeId?: boolean;
  required?: boolean;
  defaultValue?: BasicItemInfo;
  onItemSelect?: (value: BasicItemInfo, index?: number) => void;
  onItemClear?: () => void;
}

export default function SelectAutoComplete(
  {
    data,
    name,
    label = "",
    onItemSelect = () => {},
    onItemClear = () => {},
    optionIncludeId = true,
    defaultValue = undefined,
    required = false,
  }: SelectAutoCompleteProps,
) {
  const [value, setValue] = useState<BasicItemInfo | null>(null);
  const [inputValue, setInputValue] = useState("");

  return (
    <FormControl required={required} fullWidth>
      <Autocomplete
        defaultValue={defaultValue}
        fullWidth
        // for select
        value={value}
        onChange={(_, value) => {
          setValue(value);

          if (value) {
            onItemSelect(value);
          } else {
            onItemClear();
          }
        }}
        // for typing
        inputValue={inputValue}
        onInputChange={(_, inputValue) => {
          setInputValue(inputValue);
        }}
        // main data
        options={data}
        renderInput={(params) => (
          <TextField
            {...params}
            required={required}
            color="info"
            name={name}
            label={label}
          />
        )}
        // render selected field
        getOptionLabel={(option) => option.name}
        // render selection menu options
        renderOption={(props, option) => {
          const { ...optionProps } = props;
          return (
            <Box
              component="li"
              {...optionProps}
              key={option.id}
            >
              {option.name} {optionIncludeId ? `(${option.id})` : ""}
            </Box>
          );
        }}
      >
      </Autocomplete>
    </FormControl>
  );
}
