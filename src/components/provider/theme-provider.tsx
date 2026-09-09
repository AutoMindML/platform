"use client";

import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import * as React from "react";

import { ColorModeContext, type ThemeMode, useMode } from "@/utils/theme/hook";

export function ThemeProvider(
  { children, initTheme }: { children: React.ReactNode; initTheme?: ThemeMode },
) {
  const { theme, colorMode } = useMode(initTheme);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
}
