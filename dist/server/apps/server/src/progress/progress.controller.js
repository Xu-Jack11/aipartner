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
exports.ProgressController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
const progress_service_1 = require("./progress.service");
let ProgressController = class ProgressController {
    constructor(progressService) {
        this.progressService = progressService;
    }
    /**
     * 创建学习会话记录
     * POST /api/v1/progress/sessions
     */
    createSession(user, dto) {
        return this.progressService.createStudySession(user.id, dto);
    }
    /**
     * 获取学习会话列表
     * GET /api/v1/progress/sessions?limit=20
     */
    getSessions(user, limit) {
        return this.progressService.getStudySessions(user.id, limit);
    }
    /**
     * 获取学习进度统计
     * GET /api/v1/progress/stats
     */
    getStats(user) {
        return this.progressService.getProgressStats(user.id);
    }
    /**
     * 获取学习趋势数据
     * GET /api/v1/progress/trend?days=30
     */
    getTrend(user, days) {
        return this.progressService.getProgressTrend(user.id, days);
    }
};
exports.ProgressController = ProgressController;
__decorate([
    (0, common_1.Post)("sessions"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "createSession", null);
__decorate([
    (0, common_1.Get)("sessions"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "getSessions", null);
__decorate([
    (0, common_1.Get)("stats"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)("trend"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)("days")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "getTrend", null);
exports.ProgressController = ProgressController = __decorate([
    (0, common_1.Controller)("v1/progress"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [progress_service_1.ProgressService])
], ProgressController);
