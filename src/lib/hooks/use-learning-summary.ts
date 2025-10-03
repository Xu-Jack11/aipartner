"use client";

import { useEffect, useState } from "react";
import type { LearningSummaryResponse } from "@/lib/api/learning";
import { fetchLearningSummary } from "@/lib/api/learning";
import { useAuth } from "@/lib/auth-context";

export type LearningSummaryState = {
  readonly data?: LearningSummaryResponse;
  readonly status: "idle" | "loading" | "error" | "success";
  readonly error?: string;
};

export const useLearningSummary = (): LearningSummaryState => {
  const { accessToken, status: authStatus } = useAuth();
  const [state, setState] = useState<LearningSummaryState>({ status: "idle" });

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
  }, [accessToken, authStatus]);

  return state;
};
