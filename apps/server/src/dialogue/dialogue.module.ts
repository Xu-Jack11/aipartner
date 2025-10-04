import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { PrismaModule } from "../prisma/prisma.module";
import { DialogueController } from "./dialogue.controller";
import { DialogueService } from "./dialogue.service";

@Module({
  controllers: [DialogueController],
  exports: [DialogueService],
  imports: [PrismaModule, AiModule],
  providers: [DialogueService],
})
export class DialogueModule {}
