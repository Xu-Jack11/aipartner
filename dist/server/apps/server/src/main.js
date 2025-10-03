"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const env_1 = require("./config/env");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: true,
    });
    app.setGlobalPrefix("api");
    app.enableVersioning({
        defaultVersion: "1",
        type: common_1.VersioningType.URI,
    });
    const applyGlobalPipes = app.useGlobalPipes.bind(app);
    applyGlobalPipes(new common_1.ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        whitelist: true,
    }));
    const configService = app.get((config_1.ConfigService));
    const port = configService.get("app.port", {
        infer: true,
    });
    const resolvedPort = port !== null && port !== void 0 ? port : env_1.DEFAULT_APP_PORT;
    await app.listen(resolvedPort);
    const logger = new common_1.Logger("Bootstrap");
    logger.log(`API server listening on http://localhost:${resolvedPort}`);
}
bootstrap().catch((error) => {
    const logger = new common_1.Logger("Bootstrap");
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to start API server: ${errorMessage}`);
    process.exitCode = 1;
});
