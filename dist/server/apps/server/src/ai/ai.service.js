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
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
const config_1 = require("@nestjs/config");
let AiService = AiService_1 = class AiService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AiService_1.name);
    }
    async getAvailableModels() {
        const apiKey = this.configService.get("openai.apiKey", {
            infer: true,
        });
        const baseUrl = this.configService.get("openai.baseUrl", {
            infer: true,
        });
        if (!apiKey) {
            this.logger.warn("OpenAI API key not configured, returning empty models list");
            return {
                data: [],
                object: "list",
            };
        }
        try {
            const url = baseUrl
                ? `${baseUrl}/models`
                : "https://api.openai.com/v1/models";
            const response = await fetch(url, {
                headers: {
                    // biome-ignore lint/style/useNamingConvention: HTTP header requires this format
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                method: "GET",
            });
            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Failed to fetch models: ${response.status} - ${errorText}`);
                throw new Error(`Failed to fetch models: ${response.status}`);
            }
            const data = (await response.json());
            return data;
        }
        catch (error) {
            this.logger.error("Failed to fetch AI models", error);
            throw error;
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
