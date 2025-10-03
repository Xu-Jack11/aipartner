"use client";

import { useCallback, useEffect, useState } from "react";
import type { LearningSummaryResponse } from "@/lib/api/learning";
import { fetchLearningSummary } from "@/lib/api/learning";
import { useAuth } from "@/lib/auth-context";

// 等待状态更新的延迟时间(毫秒)
const STATE_UPDATE_DELAY = 100;

export type LearningSummaryState = {
  readonly data?: LearningSummaryResponse;
  readonly status: "idle" | "loading" | "error" | "success";
  readonly error?: string;
  readonly refetch: () => Promise<void>;
};

export const useLearningSummary = (): LearningSummaryState => {
  const { accessToken, status: authStatus } = useAuth();
  const [state, setState] = useState<Omit<LearningSummaryState, "refetch">>({
    status: "idle",
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(async () => {
    setRefreshKey((prev) => prev + 1);
    // 等待下一次状态更新完成
    await new Promise((resolve) => {
      setTimeout(resolve, STATE_UPDATE_DELAY);
    });
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is intentionally included to trigger refetch
  useEffect(() => {
    if (authStatus !== "authenticated" || accessToken === undefined) {
      return;
    }
    let isMounted = true;
    setState({ status: "loading" });
    fetchLearningSummary(accessToken)
      .then((response) => {
        if (!isMounted) {
          return;
        }
        setState({ data: response, status: "success" });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }
        setState({
          error: error instanceof Error ? error.message : "获取学习数据失败",
          status: "error",
        });
      });
    return () => {
      isMounted = false;
    };
  }, [accessToken, authStatus, refreshKey]);

  return { ...state, refetch };
};
