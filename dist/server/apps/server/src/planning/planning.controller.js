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
exports.PlanningController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
const planning_service_1 = require("./planning.service");
let PlanningController = class PlanningController {
    constructor(planningService) {
        this.planningService = planningService;
    }
    async listPlans(user) {
        return await this.planningService.listPlans(user.id);
    }
    async createPlan(user, dto) {
        return await this.planningService.createPlan(user.id, dto);
    }
    async generatePlan(user, dto) {
        return await this.planningService.generatePlanFromSession(user.id, dto);
    }
    async updatePlan(user, planId, dto) {
        return await this.planningService.updatePlan(user.id, planId, dto);
    }
    async addTask(user, planId, dto) {
        return await this.planningService.addTask(user.id, planId, dto);
    }
    async updateTask(user, planId, taskId, dto) {
        return await this.planningService.updateTask(user.id, planId, taskId, dto);
    }
};
exports.PlanningController = PlanningController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "listPlans", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Post)("generate"),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "generatePlan", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Function]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Post)(":id/tasks"),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Function]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "addTask", null);
__decorate([
    (0, common_1.Patch)(":id/tasks/:taskId"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Param)("taskId")),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Function]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "updateTask", null);
exports.PlanningController = PlanningController = __decorate([
    (0, common_1.Controller)({ path: "plans", version: "1" }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [planning_service_1.PlanningService])
], PlanningController);
