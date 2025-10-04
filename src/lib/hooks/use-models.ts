"use client";

import { useCallback, useEffect, useState } from "react";
import type { ModelsResponse } from "../api/models";
import { fetchModels } from "../api/models";
import { useAuth } from "../auth-context";

type QueryStatus = "idle" | "loading" | "success" | "error";

export type ModelOption = {
  readonly label: string;
  readonly value: string;
};

/**
 * 将 API 模型信息转换为 Select 选项格式
 */
const transformModels = (response: ModelsResponse): readonly ModelOption[] =>
  response.data.map((model) => ({
    label: model.id,
    value: model.id,
  }));

/**
 * Hook for fetching and managing AI model list
 */
export const useModels = () => {
  const { accessToken } = useAuth();
  const [data, setData] = useState<readonly ModelOption[]>([]);
  const [status, setStatus] = useState<QueryStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!accessToken) {
      return;
    }

    setStatus("loading");
    setError(null);

    fetchModels(accessToken)
      .then((response) => {
        setData(transformModels(response));
        setStatus("success");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "获取模型列表失败");
        setStatus("error");
      });
  }, [accessToken]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, refetch, status };
};

export type ModelsQuery = ReturnType<typeof useModels>;
