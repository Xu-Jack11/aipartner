import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import type { AppConfig } from "../types";
import { AiProvider } from "./providers/ai-provider.interface";
import { MockAiProvider } from "./providers/mock-ai.provider";
import { OpenAiProvider } from "./providers/openai.provider";

@Module({
  exports: [AiProvider],
  imports: [ConfigModule],
  providers: [
    {
      inject: [ConfigService],
      provide: AiProvider,
      useFactory: (configService: ConfigService<AppConfig>) => {
        const apiKey = configService.get("openai", { infer: true })?.apiKey;
        if (apiKey !== undefined && apiKey.length > 0) {
          return new OpenAiProvider(configService);
        }
        return new MockAiProvider();
      },
    },
  ],
})
export class AiModule {}
