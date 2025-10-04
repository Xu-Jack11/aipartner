import { useCallback, useEffect, useState } from "react";
import type { ModelInfo } from "../api/models";
import { listModels } from "../api/models";

export const useAvailableModels = (accessToken?: string) => {
  const [models, setModels] = useState<readonly ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listModels(accessToken);
      setModels(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取模型列表失败");
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return { error, loading, models, refetch: fetchModels };
};
