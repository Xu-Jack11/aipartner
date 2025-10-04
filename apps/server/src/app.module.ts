import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiModule } from "./ai/ai.module";
import { AuthModule } from "./auth/auth.module";
import { env } from "./config/env";
import { DialogueModule } from "./dialogue/dialogue.module";
import { LearningModule } from "./learning/learning.module";
import { PlanningModule } from "./planning/planning.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProgressModule } from "./progress/progress.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [() => env],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    AiModule,
    LearningModule,
    DialogueModule,
    PlanningModule,
    ProgressModule,
  ],
})
export class AppModule {}
