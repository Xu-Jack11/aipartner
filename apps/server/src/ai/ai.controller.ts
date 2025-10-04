import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { AiService } from "./ai.service";

@Controller({ path: "ai", version: "1" })
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(aiService: AiService) {
    this.aiService = aiService;
  }

  private readonly aiService: AiService;

  @Get("models")
  getModels() {
    return this.aiService.getAvailableModels();
  }
}
