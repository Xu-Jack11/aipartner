import "reflect-metadata";

import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { DEFAULT_APP_PORT } from "./config/env";
import type { AppConfig } from "./types";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  app.setGlobalPrefix("api");
  app.enableVersioning({
    defaultVersion: "1",
    type: VersioningType.URI,
  });
  const applyGlobalPipes = app.useGlobalPipes.bind(app);
  applyGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    })
  );

  const configService = app.get(ConfigService<AppConfig>);
  const port = configService.get<number>("app.port", {
    infer: true,
  });
  const resolvedPort = port ?? DEFAULT_APP_PORT;

  await app.listen(resolvedPort);

  const logger = new Logger("Bootstrap");
  logger.log(`API server listening on http://localhost:${resolvedPort}`);
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger("Bootstrap");
  const errorMessage = error instanceof Error ? error.message : String(error);
  logger.error(`Failed to start API server: ${errorMessage}`);
  process.exitCode = 1;
});
