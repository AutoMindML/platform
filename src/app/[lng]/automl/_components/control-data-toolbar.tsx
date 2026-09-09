"use client";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SearchIcon from "@mui/icons-material/Search";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import {
  AppBar,
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Toolbar as MUIToolbar,
  Tooltip,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

import { useTranslation } from "@/i18n/client";
import { SortAction, useToolbarStore } from "@/store/toolbar";

export default function ControlDataToolbar() {
  const p = useParams();
  const { t } = useTranslation(p.lng as string, "general");

  const state = useToolbarStore(useShallow((state) => ({
    view: state.view,
    sortBy: state.sortBy,
    isDescending: state.isDescending,
    search: state.search,
    filterType: state.filterType,
  })));

  const dispatch = useToolbarStore((state) => state.setActions);

  return (
    <AppBar position="static" color="default" elevation={1}>
      <MUIToolbar>
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            value={state.search}
            onChange={(event) =>
              dispatch({ ...state, search: event.target.value })}
            placeholder="Search..."
            size="small"
            variant="outlined"
            sx={{ marginRight: 2, wdth: 250 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        <FormControl>
          <InputLabel>{t("sortby")}</InputLabel>
          <Select
            label={t("sortby")}
            value={state.sortBy}
            onChange={(event) => {
              dispatch({ ...state, sortBy: event.target.value as SortAction });
            }}
            variant="outlined"
            size="small"
            sx={{ marginRight: 2 }}
          >
            <MenuItem value="id">{t("id")}</MenuItem>
            <MenuItem value="name">{t("name")}</MenuItem>
            <MenuItem value="created_at">{t("created_at")}</MenuItem>
            <MenuItem value="updated_at">{t("updated_at")}</MenuItem>
          </Select>
        </FormControl>

        <IconButton
          onClick={() =>
            dispatch({ ...state, isDescending: !state.isDescending })}
          color="primary"
          sx={{ marginRight: 2 }}
        >
          {state.isDescending ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
        </IconButton>

        <Tooltip title={t(state.view)}>
          <IconButton
            onClick={() =>
              dispatch({
                ...state,
                view: state.view === "grid" ? "list" : "grid",
              })}
            color="primary"
          >
            {state.view === "grid" ? <ViewModuleIcon /> : <ViewListIcon />}
          </IconButton>
        </Tooltip>
      </MUIToolbar>
    </AppBar>
  );
}
