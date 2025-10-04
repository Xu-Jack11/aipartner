import { apiFetch } from "./client";

export type ModelInfo = {
  readonly id: string;
  readonly object: string;
  readonly created?: number;
  readonly ownedBy?: string;
};

export type ModelListResponse = {
  readonly models: readonly ModelInfo[];
};

export const listModels = async (
  accessToken?: string
): Promise<readonly ModelInfo[]> => {
  const response = await apiFetch<ModelListResponse>("v1/ai/models", {
    accessToken,
  });
  return response.models;
};
