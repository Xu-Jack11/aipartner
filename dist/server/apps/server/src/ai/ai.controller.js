"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
const ai_provider_interface_1 = require("./providers/ai-provider.interface");
let AiController = AiController_1 = class AiController {
    constructor(aiProvider) {
        this.aiProvider = aiProvider;
        this.logger = new common_1.Logger(AiController_1.name);
    }
    async listModels() {
        try {
            const models = await this.aiProvider.listModels();
            return { models };
        }
        catch (error) {
            this.logger.error("Failed to list models", error);
            return { models: [] };
        }
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Get)("models"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiController.prototype, "listModels", null);
exports.AiController = AiController = AiController_1 = __decorate([
    (0, common_1.Controller)("ai"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ai_provider_interface_1.AiProvider])
], AiController);
