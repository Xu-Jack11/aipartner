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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogueController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
const dialogue_service_1 = require("./dialogue.service");
// biome-ignore lint/style/useImportType: ValidationPipe requires class metadata at runtime.
const create_session_dto_1 = require("./dto/create-session.dto");
// biome-ignore lint/style/useImportType: ValidationPipe requires class metadata at runtime.
const send_message_dto_1 = require("./dto/send-message.dto");
let DialogueController = class DialogueController {
    constructor(dialogueService) {
        this.dialogueService = dialogueService;
    }
    listSessions(user) {
        return this.dialogueService.listSessions(user.id);
    }
    createSession(user, dto) {
        return this.dialogueService.createSession(user.id, dto);
    }
    getSession(user, sessionId) {
        return this.dialogueService.getSession(user.id, sessionId);
    }
    sendMessage(user, sessionId, dto) {
        return this.dialogueService.sendMessage(user.id, sessionId, dto);
    }
};
exports.DialogueController = DialogueController;
__decorate([
    (0, common_1.Get)("sessions"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DialogueController.prototype, "listSessions", null);
__decorate([
    (0, common_1.Post)("sessions"),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_session_dto_1.CreateSessionDto]),
    __metadata("design:returntype", Promise)
], DialogueController.prototype, "createSession", null);
__decorate([
    (0, common_1.Get)("sessions/:id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DialogueController.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)("sessions/:id/messages"),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], DialogueController.prototype, "sendMessage", null);
exports.DialogueController = DialogueController = __decorate([
    (0, common_1.Controller)({ path: "dialogue", version: "1" }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [dialogue_service_1.DialogueService])
], DialogueController);
