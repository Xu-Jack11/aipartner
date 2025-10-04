"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogueModule = void 0;
const common_1 = require("@nestjs/common");
const ai_module_1 = require("../ai/ai.module");
const prisma_module_1 = require("../prisma/prisma.module");
const dialogue_controller_1 = require("./dialogue.controller");
const dialogue_service_1 = require("./dialogue.service");
let DialogueModule = class DialogueModule {
};
exports.DialogueModule = DialogueModule;
exports.DialogueModule = DialogueModule = __decorate([
    (0, common_1.Module)({
        controllers: [dialogue_controller_1.DialogueController],
        exports: [dialogue_service_1.DialogueService],
        imports: [prisma_module_1.PrismaModule, ai_module_1.AiModule],
        providers: [dialogue_service_1.DialogueService],
    })
], DialogueModule);
