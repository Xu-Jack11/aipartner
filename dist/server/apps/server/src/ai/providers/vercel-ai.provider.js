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
const DEFAULT_MAX_TOKENS = 2000;
/**
 * 根据 baseURL 推断默认模型
 * 不同的 AI 服务提供商有不同的默认模型
 */
const getDefaultModelForProvider = (baseUrl) => {
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
let VercelAiProvider = VercelAiProvider_1 = class VercelAiProvider extends ai_provider_interface_1.AiProvider {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(VercelAiProvider_1.name);
    }
    async generateCompletion(options) {
        var _a, _b, _c;
        const apiKey = this.configService.get("openai.apiKey", {
            infer: true,
        });
        if (!apiKey) {
            this.logger.warn("OpenAI API key not configured, using mock response");
            return this.getMockResponse(options);
        }
        const baseUrl = this.configService.get("openai.baseUrl", {
            infer: true,
        });
        // 根据 baseURL 智能选择默认模型
        const defaultModel = getDefaultModelForProvider(baseUrl);
        const model = (_a = options.model) !== null && _a !== void 0 ? _a : defaultModel;
        const temperature = (_b = options.temperature) !== null && _b !== void 0 ? _b : DEFAULT_TEMPERATURE;
        const maxTokens = (_c = options.maxTokens) !== null && _c !== void 0 ? _c : DEFAULT_MAX_TOKENS;
        try {
            const openai = (0, openai_1.createOpenAI)({
                apiKey,
                // biome-ignore lint/style/useNamingConvention: Vercel SDK requires baseURL with uppercase URL
                baseURL: baseUrl,
            });
            const result = await (0, ai_1.generateText)({
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
        }
        catch (error) {
            this.logger.error(`Failed to call OpenAI API via Vercel SDK. baseURL: ${baseUrl}, model: ${model}`);
            this.logger.error(error);
            throw error;
        }
    }
    getMockResponse(options) {
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
};
exports.VercelAiProvider = VercelAiProvider;
exports.VercelAiProvider = VercelAiProvider = VercelAiProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], VercelAiProvider);
