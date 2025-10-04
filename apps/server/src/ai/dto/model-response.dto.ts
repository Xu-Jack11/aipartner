export type ModelResponse = {
  readonly id: string;
  readonly object: string;
  readonly created?: number;
  readonly ownedBy?: string;
};

export type ModelListResponse = {
  readonly models: readonly ModelResponse[];
};
