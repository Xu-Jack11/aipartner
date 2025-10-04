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
import { prepareMessagesWithTooling } from "./tool-preparation";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TEMPERATURE = 0.7;

/**
 * Vercel AI SDK 提供商实现
 *
 * 优势:
 * - 统一的 API 接口,支持多种 AI 提供商 (OpenAI, Anthropic, Google, etc.)
 * - 内置流式响应支持
 * - 更好的类型安全
 * - 自动重试和错误处理
 * - 适合 Vercel 部署环境
 */
@Injectable()
export class VercelAiProvider extends AiProvider {
  constructor(configService: ConfigService<AppConfig>) {
    super();
    this.configService = configService;
    this.logger = new Logger(VercelAiProvider.name);

    // 初始化 OpenAI 客户端
    const apiKey = this.configService.get<string>("openai.apiKey", {
      infer: true,
    });

    if (apiKey === undefined || apiKey.length === 0) {
      this.logger.warn("OpenAI API key not configured");
    }

    this.openai = createOpenAI({
      apiKey: apiKey ?? "",
    });

    this.logger.log("Vercel AI SDK provider initialized");
  }

  private readonly configService: ConfigService<AppConfig>;
  private readonly logger: Logger;
  private readonly openai: ReturnType<typeof createOpenAI>;

  async generateCompletion(
    options: AiCompletionOptions
  ): Promise<AiCompletionResult> {
    const model = options.model ?? DEFAULT_MODEL;
    const temperature = options.temperature ?? DEFAULT_TEMPERATURE;

    this.logger.debug(`Generating completion with model: ${model}`);

    try {
      const augmentedMessages = await prepareMessagesWithTooling(
        options,
        this.logger
      );

      // 将消息格式转换为 Vercel AI SDK 格式
      const messages = augmentedMessages.map((msg) => ({
        content: msg.content,
        role: msg.role as "system" | "user" | "assistant",
      }));

      // 使用 Vercel AI SDK 生成文本
      const result = await generateText({
        maxRetries: 2,
        messages,
        model: this.openai(model),
        temperature,
      });

      this.logger.debug(
        `Completion generated successfully. Tokens: ${result.usage.totalTokens}`
      );

      return {
        content: result.text,
        tokens: result.usage.totalTokens,
      };
    } catch (error) {
      this.logger.error("Failed to generate completion", error);
      throw new Error(
        `AI completion failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
