import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { env } from "./config/env";
import { LearningModule } from "./learning/learning.module";
import { PrismaModule } from "./prisma/prisma.module";
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
    LearningModule,
  ],
})
export class AppModule {}
