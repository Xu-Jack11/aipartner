"use client";

import type { ThemeConfig } from "antd";
import { App as AntdApp, ConfigProvider, theme as antdTheme } from "antd";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (nextMode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const themeStorageKey = "aipartner-theme-mode";

const resolveThemeConfig = (mode: ThemeMode): ThemeConfig => ({
  algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  token: {
    borderRadius: 12,
    colorBgBase: mode === "dark" ? "#08090a" : "#ffffff",
    colorBgContainer: mode === "dark" ? "#16181c" : "#ffffff",
    colorBorder: mode === "dark" ? "#2b2f36" : "#dfe3ea",
    colorBorderSecondary: mode === "dark" ? "#373b42" : "#ebedf2",
    colorPrimary: mode === "dark" ? "#5b8def" : "#1677ff",
    colorTextBase: mode === "dark" ? "#d9dbdf" : "#1f1f1f",
  },
});

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const storedMode = window.localStorage.getItem(themeStorageKey) as ThemeMode | null;
    if (storedMode === "light" || storedMode === "dark") {
      setMode(storedMode);
      return;
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setMode("dark");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(themeStorageKey, mode);
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const handleModeChange = useCallback((nextMode: ThemeMode) => {
    setMode(nextMode);
  }, []);

  const providedValue = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode: handleModeChange,
    }),
    [mode, handleModeChange],
  );

  const themeConfig = useMemo(() => resolveThemeConfig(mode), [mode]);

  return (
    <ThemeContext.Provider value={providedValue}>
      <ConfigProvider theme={themeConfig}>
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export { ThemeProvider, useTheme };
export type { ThemeMode };
