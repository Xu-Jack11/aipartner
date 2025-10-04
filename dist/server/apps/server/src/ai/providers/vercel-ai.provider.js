"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VercelAiProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VercelAiProvider = void 0;
const openai_1 = require("@ai-sdk/openai");
const common_1 = require("@nestjs/common");
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
const config_1 = require("@nestjs/config");
const ai_1 = require("ai");
const ai_provider_interface_1 = require("./ai-provider.interface");
const tool_preparation_1 = require("./tool-preparation");
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
let VercelAiProvider = VercelAiProvider_1 = class VercelAiProvider extends ai_provider_interface_1.AiProvider {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(VercelAiProvider_1.name);
        // 初始化 OpenAI 客户端
        const apiKey = this.configService.get("openai.apiKey", {
            infer: true,
        });
        const baseUrl = this.configService.get("openai.baseUrl", {
            infer: true,
        });
        if (apiKey === undefined || apiKey.length === 0) {
            this.logger.warn("OpenAI API key not configured");
        }
        const openaiConfig = {
            apiKey: apiKey !== null && apiKey !== void 0 ? apiKey : "",
        };
        if (baseUrl !== undefined && baseUrl.length > 0) {
            // 对于 OpenAI 兼容的 API（如 DeepSeek），需要提供完整的 base URL 包括 /v1
            // Vercel AI SDK 不会自动添加 /v1 路径
            const fullBaseUrl = baseUrl.endsWith("/v1")
                ? baseUrl
                : `${baseUrl}/v1`;
            openaiConfig.baseURL = fullBaseUrl;
            this.logger.log(`Using custom OpenAI base URL: ${fullBaseUrl}`);
        }
        this.openai = (0, openai_1.createOpenAI)(openaiConfig);
        this.logger.log("Vercel AI SDK provider initialized");
    }
    async generateCompletion(options) {
        var _a, _b;
        const model = (_a = options.model) !== null && _a !== void 0 ? _a : DEFAULT_MODEL;
        const temperature = (_b = options.temperature) !== null && _b !== void 0 ? _b : DEFAULT_TEMPERATURE;
        const baseUrl = this.configService.get("openai.baseUrl", {
            infer: true,
        });
        this.logger.debug(`Generating completion with model: ${model}`);
        this.logger.debug(`Using base URL: ${baseUrl !== null && baseUrl !== void 0 ? baseUrl : "default (OpenAI)"}`);
        this.logger.debug(`Messages count: ${options.messages.length}`);
        try {
            const augmentedMessages = await (0, tool_preparation_1.prepareMessagesWithTooling)(options, this.logger);
            // 将消息格式转换为 Vercel AI SDK 格式
            const messages = augmentedMessages.map((msg) => ({
                content: msg.content,
                role: msg.role,
            }));
            // 使用 Vercel AI SDK 生成文本
            const result = await (0, ai_1.generateText)({
                maxRetries: 2,
                messages,
                model: this.openai(model),
                temperature,
            });
            this.logger.debug(`Completion generated successfully. Tokens: ${result.usage.totalTokens}`);
            return {
                content: result.text,
                tokens: result.usage.totalTokens,
            };
        }
        catch (error) {
            this.logger.error("Failed to generate completion", error);
            throw new Error(`AI completion failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async listModels() {
        var _a;
        const baseUrl = (_a = this.configService.get("openai.baseUrl", {
            infer: true,
        })) !== null && _a !== void 0 ? _a : "https://api.openai.com";
        const apiKey = this.configService.get("openai.apiKey", {
            infer: true,
        });
        if (!apiKey) {
            this.logger.warn("OpenAI API key not configured");
            return [];
        }
        try {
            const response = await fetch(`${baseUrl}/v1/models`, {
                headers: {
                    // biome-ignore lint/style/useNamingConvention: HTTP header requires this format
                    Authorization: `Bearer ${apiKey}`,
                },
                method: "GET",
            });
            if (!response.ok) {
                this.logger.error(`Failed to fetch models: ${response.status}`);
                return [];
            }
            const data = (await response.json());
            return data.data.map((model) => ({
                created: model.created,
                id: model.id,
                object: model.object,
                ownedBy: model.owned_by,
            }));
        }
        catch (error) {
            this.logger.error("Failed to list models", error);
            return [];
        }
    }
};
exports.VercelAiProvider = VercelAiProvider;
exports.VercelAiProvider = VercelAiProvider = VercelAiProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], VercelAiProvider);
