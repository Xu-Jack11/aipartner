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
// biome-ignore lint/style/useImportType: ValidationPipe requires class metadata at runtime for DTO validation
const create_plan_dto_1 = require("./dto/create-plan.dto");
// biome-ignore lint/style/useImportType: ValidationPipe requires class metadata at runtime for DTO validation
const create_task_dto_1 = require("./dto/create-task.dto");
// biome-ignore lint/style/useImportType: ValidationPipe requires class metadata at runtime for DTO validation
const generate_plan_dto_1 = require("./dto/generate-plan.dto");
// biome-ignore lint/style/useImportType: ValidationPipe requires class metadata at runtime for DTO validation
const update_plan_dto_1 = require("./dto/update-plan.dto");
// biome-ignore lint/style/useImportType: ValidationPipe requires class metadata at runtime for DTO validation
const update_task_dto_1 = require("./dto/update-task.dto");
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
    async deletePlan(user, planId) {
        await this.planningService.deletePlan(user.id, planId);
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
    __metadata("design:paramtypes", [Object, create_plan_dto_1.CreatePlanDto]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Post)("generate"),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, generate_plan_dto_1.GeneratePlanDto]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "generatePlan", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_plan_dto_1.UpdatePlanDto]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Post)(":id/tasks"),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "addTask", null);
__decorate([
    (0, common_1.Patch)(":id/tasks/:taskId"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Param)("taskId")),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, update_task_dto_1.UpdateTaskDto]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "updateTask", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "deletePlan", null);
exports.PlanningController = PlanningController = __decorate([
    (0, common_1.Controller)({ path: "plans", version: "1" }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [planning_service_1.PlanningService])
], PlanningController);
