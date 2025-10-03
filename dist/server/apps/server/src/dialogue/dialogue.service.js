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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogueService = void 0;
const common_1 = require("@nestjs/common");
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
const ai_provider_interface_1 = require("../ai/providers/ai-provider.interface");
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
const prisma_service_1 = require("../prisma/prisma.service");
let DialogueService = class DialogueService {
    constructor(prismaService, aiProvider) {
        this.prisma = prismaService;
        this.aiProvider = aiProvider;
    }
    async createSession(userId, dto) {
        const session = await this.prisma.session.create({
            data: {
                focus: dto.focus,
                title: dto.title,
                userId,
            },
        });
        return {
            createdAt: session.createdAt,
            focus: session.focus,
            id: session.id,
            title: session.title,
            updatedAt: session.updatedAt,
        };
    }
    async listSessions(userId) {
        const sessions = await this.prisma.session.findMany({
            orderBy: {
                updatedAt: "desc",
            },
            where: {
                userId,
            },
        });
        return sessions.map((session) => ({
            createdAt: session.createdAt,
            focus: session.focus,
            id: session.id,
            title: session.title,
            updatedAt: session.updatedAt,
        }));
    }
    async getSession(userId, sessionId) {
        const session = await this.prisma.session.findUnique({
            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
            where: {
                id: sessionId,
                userId,
            },
        });
        if (session === null) {
            throw new common_1.NotFoundException("会话不存在");
        }
        return {
            createdAt: session.createdAt,
            focus: session.focus,
            id: session.id,
            messages: session.messages.map((msg) => ({
                content: msg.content,
                createdAt: msg.createdAt,
                id: msg.id,
                role: msg.role,
            })),
            title: session.title,
            updatedAt: session.updatedAt,
        };
    }
    async sendMessage(userId, sessionId, dto) {
        // Verify session exists and belongs to user
        const session = await this.prisma.session.findUnique({
            where: {
                id: sessionId,
                userId,
            },
        });
        if (session === null) {
            throw new common_1.NotFoundException("会话不存在");
        }
        // Save user message
        await this.prisma.chatMessage.create({
            data: {
                content: dto.content,
                role: "user",
                sessionId,
                userId,
            },
        });
        // Get conversation history
        const messages = await this.prisma.chatMessage.findMany({
            orderBy: {
                createdAt: "asc",
            },
            where: {
                sessionId,
            },
        });
        // Prepare system message with tool context if tools are requested
        let systemMessage = "";
        if (dto.tools && dto.tools.length > 0) {
            const toolDescriptions = dto.tools
                .map((tool) => {
                switch (tool) {
                    case "web-search": {
                        return "You have access to web search capabilities to find current information.";
                    }
                    case "knowledge-base": {
                        return "You have access to a knowledge base with domain-specific information.";
                    }
                    default: {
                        return "";
                    }
                }
            })
                .filter(Boolean)
                .join(" ");
            if (toolDescriptions) {
                systemMessage = `System: ${toolDescriptions}`;
            }
        }
        // Generate AI response
        const aiResponse = await this.aiProvider.generateCompletion({
            messages: systemMessage
                ? [
                    { content: systemMessage, role: "system" },
                    ...messages.map((msg) => ({
                        content: msg.content,
                        role: msg.role,
                    })),
                ]
                : messages.map((msg) => ({
                    content: msg.content,
                    role: msg.role,
                })),
            model: dto.model,
        });
        // Save AI response
        const assistantMessage = await this.prisma.chatMessage.create({
            data: {
                content: aiResponse.content,
                role: "assistant",
                sessionId,
                userId,
            },
        });
        // Update session timestamp
        await this.prisma.session.update({
            data: {
                updatedAt: new Date(),
            },
            where: {
                id: sessionId,
            },
        });
        return {
            content: assistantMessage.content,
            createdAt: assistantMessage.createdAt,
            id: assistantMessage.id,
            role: "assistant",
        };
    }
    async deleteSession(userId, sessionId) {
        // Verify session exists and belongs to user
        const session = await this.prisma.session.findUnique({
            where: {
                id: sessionId,
                userId,
            },
        });
        if (session === null) {
            throw new common_1.NotFoundException("会话不存在");
        }
        // Delete session (cascade will delete messages)
        await this.prisma.session.delete({
            where: {
                id: sessionId,
            },
        });
    }
};
exports.DialogueService = DialogueService;
exports.DialogueService = DialogueService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, ai_provider_interface_1.AiProvider])
], DialogueService);
