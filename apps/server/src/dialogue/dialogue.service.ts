import { Injectable, NotFoundException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { AiProvider } from "../ai/providers/ai-provider.interface";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { PrismaService } from "../prisma/prisma.service";
import type { CreateSessionDto } from "./dto/create-session.dto";
import type { SendMessageDto } from "./dto/send-message.dto";
import type {
  MessageResponse,
  SessionResponse,
  SessionWithMessagesResponse,
} from "./dto/session-response.dto";

@Injectable()
export class DialogueService {
  constructor(prismaService: PrismaService, aiProvider: AiProvider) {
    this.prisma = prismaService;
    this.aiProvider = aiProvider;
  }

  private readonly aiProvider: AiProvider;
  private readonly prisma: PrismaService;

  async createSession(
    userId: string,
    dto: CreateSessionDto
  ): Promise<SessionResponse> {
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

  async listSessions(userId: string): Promise<readonly SessionResponse[]> {
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

  async getSession(
    userId: string,
    sessionId: string
  ): Promise<SessionWithMessagesResponse> {
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
      throw new NotFoundException("会话不存在");
    }

    return {
      createdAt: session.createdAt,
      focus: session.focus,
      id: session.id,
      messages: session.messages.map((msg) => ({
        content: msg.content,
        createdAt: msg.createdAt,
        id: msg.id,
        role: msg.role as "user" | "assistant",
      })),
      title: session.title,
      updatedAt: session.updatedAt,
    };
  }

  async sendMessage(
    userId: string,
    sessionId: string,
    dto: SendMessageDto
  ): Promise<MessageResponse> {
    // Verify session exists and belongs to user
    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (session === null) {
      throw new NotFoundException("会话不存在");
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
            { content: systemMessage, role: "system" as const },
            ...messages.map((msg) => ({
              content: msg.content,
              role: msg.role as "user" | "assistant",
            })),
          ]
        : messages.map((msg) => ({
            content: msg.content,
            role: msg.role as "user" | "assistant",
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

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    // Verify session exists and belongs to user
    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (session === null) {
      throw new NotFoundException("会话不存在");
    }

    // Delete session (cascade will delete messages)
    await this.prisma.session.delete({
      where: {
        id: sessionId,
      },
    });
  }
}
