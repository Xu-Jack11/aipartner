import { Injectable, Logger } from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { ConfigService } from "@nestjs/config";
import type { AppConfig } from "../../types";
import type {
  AiCompletionOptions,
  AiCompletionResult,
} from "./ai-provider.interface";
import { AiProvider } from "./ai-provider.interface";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 2000;

type OpenAiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenAiChatCompletionRequest = {
  model: string;
  messages: OpenAiMessage[];
  temperature?: number;
  // biome-ignore lint/style/useNamingConvention: OpenAI API requires snake_case
  max_tokens?: number;
  tools?: OpenAiTool[];
  // biome-ignore lint/style/useNamingConvention: OpenAI API requires snake_case
  tool_choice?: string | { type: "function"; function: { name: string } };
};

type OpenAiTool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

type OpenAiChatCompletionResponse = {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string | null;
      // biome-ignore lint/style/useNamingConvention: OpenAI API requires snake_case
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    // biome-ignore lint/style/useNamingConvention: OpenAI API requires snake_case
    finish_reason: string;
  }>;
  usage: {
    // biome-ignore lint/style/useNamingConvention: OpenAI API requires snake_case
    total_tokens: number;
  };
};

@Injectable()
export class OpenAiProvider extends AiProvider {
  constructor(configService: ConfigService<AppConfig>) {
    super();
    this.configService = configService;
    this.logger = new Logger(OpenAiProvider.name);
  }

  private readonly configService: ConfigService<AppConfig>;
  private readonly logger: Logger;

  async generateCompletion(
    options: AiCompletionOptions
  ): Promise<AiCompletionResult> {
    const apiKey = this.configService.get<string>("openai.apiKey", {
      infer: true,
    });

    if (!apiKey) {
      this.logger.warn("OpenAI API key not configured, using mock response");
      return this.getMockResponse(options);
    }

    const model = options.model ?? DEFAULT_MODEL;
    const temperature = options.temperature ?? DEFAULT_TEMPERATURE;
    const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;

    const requestBody: OpenAiChatCompletionRequest = {
      // biome-ignore lint/style/useNamingConvention: OpenAI API requires snake_case
      max_tokens: maxTokens,
      messages: options.messages.map((msg) => ({
        content: msg.content,
        role: msg.role,
      })),
      model,
      temperature,
    };

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          body: JSON.stringify(requestBody),
          headers: {
            // biome-ignore lint/style/useNamingConvention: HTTP header requires this format
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `OpenAI API error: ${response.status} - ${errorText}`
        );
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = (await response.json()) as OpenAiChatCompletionResponse;
      const choice = data.choices[0];

      if (!choice) {
        throw new Error("No response from OpenAI");
      }

      return {
        content: choice.message.content ?? "",
        tokens: data.usage.total_tokens,
      };
    } catch (error) {
      this.logger.error("Failed to call OpenAI API", error);
      throw error;
    }
  }

  private getMockResponse(options: AiCompletionOptions): AiCompletionResult {
    const userMessage = options.messages
      .filter((msg) => msg.role === "user")
      .at(-1);

    return {
      content: userMessage
        ? `[模拟回复] 您说：${userMessage.content}\n\n由于未配置OpenAI API密钥，这是一个模拟响应。请在环境变量中配置OPENAI_API_KEY以使用真实的AI服务。`
        : "您好！我是AI学习助手。请配置OpenAI API密钥以使用完整功能。",
      tokens: 100,
    };
  }
}
