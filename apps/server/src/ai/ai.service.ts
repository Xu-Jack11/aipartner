import { Injectable, Logger } from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { ConfigService } from "@nestjs/config";
import type { AppConfig } from "../types";

type ModelInfo = {
  id: string;
  object: string;
  created: number;
  // biome-ignore lint/style/useNamingConvention: API response uses snake_case
  owned_by: string;
};

type ModelsResponse = {
  object: string;
  data: ModelInfo[];
};

@Injectable()
export class AiService {
  constructor(configService: ConfigService<AppConfig>) {
    this.configService = configService;
    this.logger = new Logger(AiService.name);
  }

  private readonly configService: ConfigService<AppConfig>;
  private readonly logger: Logger;

  async getAvailableModels(): Promise<ModelsResponse> {
    const apiKey = this.configService.get<string>("openai.apiKey", {
      infer: true,
    });
    const baseUrl = this.configService.get<string>("openai.baseUrl", {
      infer: true,
    });

    if (!apiKey) {
      this.logger.warn(
        "OpenAI API key not configured, returning empty models list"
      );
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
        this.logger.error(
          `Failed to fetch models: ${response.status} - ${errorText}`
        );
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = (await response.json()) as ModelsResponse;
      return data;
    } catch (error) {
      this.logger.error("Failed to fetch AI models", error);
      throw error;
    }
  }
}
