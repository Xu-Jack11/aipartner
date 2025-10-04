"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ai_provider_interface_1 = require("./providers/ai-provider.interface");
const mock_ai_provider_1 = require("./providers/mock-ai.provider");
const vercel_ai_provider_1 = require("./providers/vercel-ai.provider");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        exports: [ai_provider_interface_1.AiProvider],
        imports: [config_1.ConfigModule],
        providers: [
            {
                inject: [config_1.ConfigService],
                provide: ai_provider_interface_1.AiProvider,
                useFactory: (configService) => {
                    var _a;
                    const apiKey = (_a = configService.get("openai", { infer: true })) === null || _a === void 0 ? void 0 : _a.apiKey;
                    if (apiKey !== undefined && apiKey.length > 0) {
                        return new vercel_ai_provider_1.VercelAiProvider(configService);
                    }
                    return new mock_ai_provider_1.MockAiProvider();
                },
            },
        ],
    })
], AiModule);
