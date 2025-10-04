"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProgressTrendResponse } from "../api/progress";
import { fetchProgressTrend } from "../api/progress";
import { useAuth } from "../auth-context";

type QueryStatus = "idle" | "loading" | "success" | "error";

export const useProgressTrend = (days = 30) => {
  const { accessToken } = useAuth();
  const [data, setData] = useState<ProgressTrendResponse | null>(null);
  const [status, setStatus] = useState<QueryStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!accessToken) {
      return;
    }

    setStatus("loading");
    setError(null);

    fetchProgressTrend(accessToken, days)
      .then((trend) => {
        setData(trend);
        setStatus("success");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "获取学习趋势失败");
        setStatus("error");
      });
  }, [accessToken, days]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, refetch, status };
};

export type ProgressTrendQuery = ReturnType<typeof useProgressTrend>;
