import { themeSettings } from "./setting";

import { createTheme } from "@mui/material";
import { createContext, useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";

import { cookieOptions } from "@/cookie/setting";

interface ColorModeContextProps {
  toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextProps>({
  toggleColorMode: () => {},
});

export type ThemeMode = "dark" | "light";

export const useMode = (initTheme: ThemeMode = "light") => {
  const [mode, setMode] = useState<ThemeMode>(initTheme);
  const [, setCookie] = useCookies(["theme"]);

  useEffect(() => {
    setCookie("theme", mode, cookieOptions);
  }, [mode, setCookie]);

  const colorMode = useMemo<ColorModeContextProps>(() => {
    return {
      toggleColorMode: () => {
        setMode((prev) => (prev === "light" ? "dark" : "light"));
      },
    };
  }, []);
  // const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return { theme, colorMode };
};
