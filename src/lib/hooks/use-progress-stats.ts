"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProgressStatsResponse } from "../api/progress";
import { fetchProgressStats } from "../api/progress";
import { useAuth } from "../auth-context";

type QueryStatus = "idle" | "loading" | "success" | "error";

export function useProgressStats() {
  const { accessToken } = useAuth();
  const [data, setData] = useState<ProgressStatsResponse | null>(null);
  const [status, setStatus] = useState<QueryStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!accessToken) {
      return;
    }

    setStatus("loading");
    setError(null);

    fetchProgressStats(accessToken)
      .then((stats) => {
        setData(stats);
        setStatus("success");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "获取进度统计失败");
        setStatus("error");
      });
  }, [accessToken]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, refetch, status };
}
