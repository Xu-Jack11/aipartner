import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { PrismaModule } from "../prisma/prisma.module";
import { PlanningController } from "./planning.controller";
import { PlanningService } from "./planning.service";

@Module({
  controllers: [PlanningController],
  exports: [PlanningService],
  imports: [PrismaModule, AiModule],
  providers: [PlanningService],
})
export class PlanningModule {}
