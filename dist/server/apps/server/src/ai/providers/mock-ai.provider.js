"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockAiProvider = void 0;
const common_1 = require("@nestjs/common");
const ai_provider_interface_1 = require("./ai-provider.interface");
const MOCK_DELAY_MS = 1000;
const MOCK_TOKENS_PER_MESSAGE = 50;
let MockAiProvider = class MockAiProvider extends ai_provider_interface_1.AiProvider {
    async generateCompletion(options) {
        // Mock implementation for development
        const userMessage = options.messages
            .filter((msg) => msg.role === "user")
            .at(-1);
        const responseContent = userMessage
            ? `这是一个模拟回复。您说：${userMessage.content}`
            : "您好！我是AI学习助手，很高兴为您服务。";
        // Simulate API delay
        await new Promise((resolve) => {
            setTimeout(resolve, MOCK_DELAY_MS);
        });
        return {
            content: responseContent,
            tokens: options.messages.length * MOCK_TOKENS_PER_MESSAGE,
        };
    }
};
exports.MockAiProvider = MockAiProvider;
exports.MockAiProvider = MockAiProvider = __decorate([
    (0, common_1.Injectable)()
], MockAiProvider);
