import { createOpenAI } from "@ai-sdk/openai";
import { Injectable, Logger } from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { ConfigService } from "@nestjs/config";
import { generateText } from "ai";
import type { AppConfig } from "../../types";
import type {
  AiCompletionOptions,
  AiCompletionResult,
} from "./ai-provider.interface";
import { AiProvider } from "./ai-provider.interface";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 2000;

/**
 * 根据 baseURL 推断默认模型
 * 不同的 AI 服务提供商有不同的默认模型
 */
const getDefaultModelForProvider = (baseUrl?: string): string => {
  if (!baseUrl) {
    return DEFAULT_MODEL; // OpenAI 官方 API
  }

  const url = baseUrl.toLowerCase();

  // DeepSeek API
  if (url.includes("deepseek.com")) {
    return "deepseek-chat";
  }

  // Moonshot AI (Kimi)
  if (url.includes("moonshot.cn")) {
    return "moonshot-v1-8k";
  }

  // 智谱 AI (GLM)
  if (url.includes("bigmodel.cn")) {
    return "glm-4";
  }

  // 阿里云通义千问
  if (url.includes("dashscope.aliyun")) {
    return "qwen-turbo";
  }

  // 默认使用 OpenAI 模型
  return DEFAULT_MODEL;
};

@Injectable()
export class VercelAiProvider extends AiProvider {
  constructor(configService: ConfigService<AppConfig>) {
    super();
    this.configService = configService;
    this.logger = new Logger(VercelAiProvider.name);
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

    const baseUrl = this.configService.get<string>("openai.baseUrl", {
      infer: true,
    });

    // 根据 baseURL 智能选择默认模型
    const defaultModel = getDefaultModelForProvider(baseUrl);
    const model = options.model ?? defaultModel;

    const temperature = options.temperature ?? DEFAULT_TEMPERATURE;
    const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;

    try {
      const openai = createOpenAI({
        apiKey,
        // biome-ignore lint/style/useNamingConvention: Vercel SDK requires baseURL with uppercase URL
        baseURL: baseUrl,
      });

      const result = await generateText({
        maxOutputTokens: maxTokens,
        messages: options.messages.map((msg) => ({
          content: msg.content,
          role: msg.role,
        })),
        // Use chat() instead of direct model call to use /chat/completions endpoint
        model: openai.chat(model),
        temperature,
      });

      return {
        content: result.text,
        tokens: result.usage.totalTokens,
      };
    } catch (error) {
      this.logger.error(
        `Failed to call OpenAI API via Vercel SDK. baseURL: ${baseUrl}, model: ${model}`
      );
      this.logger.error(error);
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
      tokens: 0,
    };
  }
}
