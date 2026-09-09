import { colorTokens } from "./color-token";

import { alpha, ThemeOptions } from "@mui/material";

export const themeSettings = (mode: "dark" | "light"): ThemeOptions => {
  const colors = colorTokens(mode);
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
          primary: {
            main: colors.primary[400],
          },
          secondary: {
            main: colors.greenAccent[500],
          },
          neutral: {
            dark: colors.grey[700],
            main: colors.grey[500],
            light: colors.grey[100],
          },
          action: {
            active: "#fcfcfc",
            hoverOpacity: 0.1,
          },
          background: {
            default: colors.primary[500],
          },
          common: {
            white: "#fcfcfc",
          },
        }
        : {
          primary: {
            main: colors.primary[400],
          },
          secondary: {
            main: colors.greenAccent[500],
          },
          neutral: {
            dark: colors.grey[700],
            main: colors.grey[500],
            light: colors.grey[100],
          },
          action: {
            active: colors.grey[400],
            hover: alpha(colors.grey[400], 0.3),
            hoverOpacity: 0.3,
          },
          background: {
            default: "#fcfcfc",
          },
          common: {
            white: "#fcfcfc",
          },
        }),
    },
    typography: {
      fontFamily: ["Inter", "TaipeiSans", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Inter", "TaipeiSans", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Inter", "TaipeiSans", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Inter", "TaipeiSans", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Inter", "TaipeiSans", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Inter", "TaipeiSans", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Inter", "TaipeiSans", "sans-serif"].join(","),
        fontSize: 14,
      },
    },
  };
};
