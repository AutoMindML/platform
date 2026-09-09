import HomeIcon from "@mui/icons-material/Home";
import { IconButton, Tooltip, useTheme } from "@mui/material";

import { useLngNs } from "@/i18n/hooks";

export const AppBarHomeIcon = () => {
  const t = useLngNs("automl");
  const theme = useTheme();

  return (
    <Tooltip title={t("home")}>
      <IconButton href="/">
        <HomeIcon sx={{ color: theme.palette.common.white }} />
      </IconButton>
    </Tooltip>
  );
};
