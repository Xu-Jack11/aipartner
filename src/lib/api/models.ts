import { apiFetch } from "./client";

export type ModelInfo = {
  readonly id: string;
  readonly object: string;
  readonly created: number;
  // biome-ignore lint/style/useNamingConvention: API response uses snake_case
  readonly owned_by: string;
};

export type ModelsResponse = {
  readonly object: string;
  readonly data: readonly ModelInfo[];
};

/**
 * 获取可用的 AI 模型列表
 */
export const fetchModels = (accessToken: string): Promise<ModelsResponse> =>
  apiFetch<ModelsResponse>("v1/ai/models", {
    accessToken,
    method: "GET",
  });
