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
        if (apiKey === undefined || apiKey.length === 0) {
            this.logger.warn("OpenAI API key not configured");
        }
        this.openai = (0, openai_1.createOpenAI)({
            apiKey: apiKey !== null && apiKey !== void 0 ? apiKey : "",
        });
        this.logger.log("Vercel AI SDK provider initialized");
    }
    async generateCompletion(options) {
        var _a, _b;
        const model = (_a = options.model) !== null && _a !== void 0 ? _a : DEFAULT_MODEL;
        const temperature = (_b = options.temperature) !== null && _b !== void 0 ? _b : DEFAULT_TEMPERATURE;
        this.logger.debug(`Generating completion with model: ${model}`);
        try {
            // 将消息格式转换为 Vercel AI SDK 格式
            const messages = options.messages.map((msg) => ({
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
};
exports.VercelAiProvider = VercelAiProvider;
exports.VercelAiProvider = VercelAiProvider = VercelAiProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], VercelAiProvider);
