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
var OpenAiProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiProvider = void 0;
const common_1 = require("@nestjs/common");
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
const config_1 = require("@nestjs/config");
const ai_provider_interface_1 = require("./ai-provider.interface");
const tool_preparation_1 = require("./tool-preparation");
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 2000;
let OpenAiProvider = OpenAiProvider_1 = class OpenAiProvider extends ai_provider_interface_1.AiProvider {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(OpenAiProvider_1.name);
    }
    async generateCompletion(options) {
        var _a, _b, _c, _d, _e;
        const apiKey = this.configService.get("openai.apiKey", {
            infer: true,
        });
        if (!apiKey) {
            this.logger.warn("OpenAI API key not configured, using mock response");
            return this.getMockResponse(options);
        }
        const baseUrl = (_a = this.configService.get("openai.baseUrl", {
            infer: true,
        })) !== null && _a !== void 0 ? _a : "https://api.openai.com";
        const model = (_b = options.model) !== null && _b !== void 0 ? _b : DEFAULT_MODEL;
        const temperature = (_c = options.temperature) !== null && _c !== void 0 ? _c : DEFAULT_TEMPERATURE;
        const maxTokens = (_d = options.maxTokens) !== null && _d !== void 0 ? _d : DEFAULT_MAX_TOKENS;
        const augmentedMessages = await (0, tool_preparation_1.prepareMessagesWithTooling)(options, this.logger);
        const requestBody = {
            // biome-ignore lint/style/useNamingConvention: OpenAI API requires snake_case
            max_tokens: maxTokens,
            messages: augmentedMessages.map((msg) => ({
                content: msg.content,
                role: msg.role,
            })),
            model,
            temperature,
        };
        try {
            const response = await fetch(`${baseUrl}/v1/chat/completions`, {
                body: JSON.stringify(requestBody),
                headers: {
                    // biome-ignore lint/style/useNamingConvention: HTTP header requires this format
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
            });
            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`OpenAI API error: ${response.status} - ${errorText}`);
                throw new Error(`OpenAI API error: ${response.status}`);
            }
            const data = (await response.json());
            const choice = data.choices[0];
            if (!choice) {
                throw new Error("No response from OpenAI");
            }
            return {
                content: (_e = choice.message.content) !== null && _e !== void 0 ? _e : "",
                tokens: data.usage.total_tokens,
            };
        }
        catch (error) {
            this.logger.error("Failed to call OpenAI API", error);
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
            tokens: 100,
        };
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
exports.OpenAiProvider = OpenAiProvider;
exports.OpenAiProvider = OpenAiProvider = OpenAiProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OpenAiProvider);
