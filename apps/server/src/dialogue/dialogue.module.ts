import { Module } from "@nestjs/common";
import { AiProvider } from "../ai/providers/ai-provider.interface";
import { OpenAiProvider } from "../ai/providers/openai.provider";
import { PrismaModule } from "../prisma/prisma.module";
import { DialogueController } from "./dialogue.controller";
import { DialogueService } from "./dialogue.service";

@Module({
  controllers: [DialogueController],
  exports: [DialogueService],
  imports: [PrismaModule],
  providers: [
    DialogueService,
    {
      provide: AiProvider,
      useClass: OpenAiProvider,
    },
  ],
})
export class DialogueModule {}
