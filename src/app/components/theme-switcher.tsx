"use client";

import { Segmented } from "antd";
import type { SegmentedValue } from "antd/es/segmented";
import { memo, useCallback } from "react";
import type { ThemeMode } from "../providers";
import { useTheme } from "../providers";

const labelMap: Record<ThemeMode, string> = {
  dark: "深色",
  light: "浅色",
};

const ThemeSwitcher = () => {
  const { mode, setMode } = useTheme();

  const handleChange = useCallback(
    (value: SegmentedValue) => {
      const nextMode = value === "dark" ? "dark" : "light";
      setMode(nextMode);
    },
    [setMode]
  );

  return (
    <Segmented
      aria-label="切换界面主题模式"
      onChange={handleChange}
      options={[
        {
          label: labelMap.light,
          value: "light",
        },
        {
          label: labelMap.dark,
          value: "dark",
        },
      ]}
      value={mode}
    />
  );
};

export default memo(ThemeSwitcher);
