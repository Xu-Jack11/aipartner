import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { AuthUser } from "../auth/auth.types";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { DialogueService } from "./dialogue.service";
// biome-ignore lint/style/useImportType: ValidationPipe requires class metadata at runtime.
import { CreateSessionDto } from "./dto/create-session.dto";
// biome-ignore lint/style/useImportType: ValidationPipe requires class metadata at runtime.
import { SendMessageDto } from "./dto/send-message.dto";
import type {
  MessageResponse,
  SessionResponse,
  SessionWithMessagesResponse,
} from "./dto/session-response.dto";

@Controller({ path: "dialogue", version: "1" })
@UseGuards(JwtAuthGuard)
export class DialogueController {
  constructor(dialogueService: DialogueService) {
    this.dialogueService = dialogueService;
  }

  private readonly dialogueService: DialogueService;

  @Get("sessions")
  @HttpCode(HttpStatus.OK)
  listSessions(
    @CurrentUser() user: AuthUser
  ): Promise<readonly SessionResponse[]> {
    return this.dialogueService.listSessions(user.id);
  }

  @Post("sessions")
  @HttpCode(HttpStatus.CREATED)
  createSession(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateSessionDto
  ): Promise<SessionResponse> {
    return this.dialogueService.createSession(user.id, dto);
  }

  @Get("sessions/:id")
  @HttpCode(HttpStatus.OK)
  getSession(
    @CurrentUser() user: AuthUser,
    @Param("id") sessionId: string
  ): Promise<SessionWithMessagesResponse> {
    return this.dialogueService.getSession(user.id, sessionId);
  }

  @Post("sessions/:id/messages")
  @HttpCode(HttpStatus.CREATED)
  sendMessage(
    @CurrentUser() user: AuthUser,
    @Param("id") sessionId: string,
    @Body() dto: SendMessageDto
  ): Promise<MessageResponse> {
    return this.dialogueService.sendMessage(user.id, sessionId, dto);
  }
}
