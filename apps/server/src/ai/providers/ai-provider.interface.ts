export type AiMessage = {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
};

export type AiCompletionOptions = {
  readonly messages: readonly AiMessage[];
  readonly model?: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly tools?: readonly string[];
};

export type AiCompletionResult = {
  readonly content: string;
  readonly tokens?: number;
};

export type AiModelInfo = {
  readonly id: string;
  readonly object: string;
  readonly created?: number;
  readonly ownedBy?: string;
};

export abstract class AiProvider {
  abstract generateCompletion(
    options: AiCompletionOptions
  ): Promise<AiCompletionResult>;

  abstract listModels(): Promise<readonly AiModelInfo[]>;
}
