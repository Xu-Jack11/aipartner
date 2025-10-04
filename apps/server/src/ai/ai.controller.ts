import { Controller, Get, Logger, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import type { ModelListResponse } from "./dto/model-response.dto";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { AiProvider } from "./providers/ai-provider.interface";

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(aiProvider: AiProvider) {
    this.aiProvider = aiProvider;
    this.logger = new Logger(AiController.name);
  }

  private readonly aiProvider: AiProvider;
  private readonly logger: Logger;

  @Get("models")
  async listModels(): Promise<ModelListResponse> {
    try {
      const models = await this.aiProvider.listModels();
      return { models };
    } catch (error) {
      this.logger.error("Failed to list models", error);
      return { models: [] };
    }
  }
}
