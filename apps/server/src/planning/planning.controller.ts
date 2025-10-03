import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { AuthUser } from "../auth/auth.types";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
// biome-ignore lint/style/useImportType: ValidationPipe requires class metadata at runtime for DTO validation
import { CreatePlanDto } from "./dto/create-plan.dto";
// biome-ignore lint/style/useImportType: ValidationPipe requires class metadata at runtime for DTO validation
import { CreateTaskDto } from "./dto/create-task.dto";
// biome-ignore lint/style/useImportType: ValidationPipe requires class metadata at runtime for DTO validation
import { GeneratePlanDto } from "./dto/generate-plan.dto";
// biome-ignore lint/style/useImportType: ValidationPipe requires class metadata at runtime for DTO validation
import { UpdatePlanDto } from "./dto/update-plan.dto";
// biome-ignore lint/style/useImportType: ValidationPipe requires class metadata at runtime for DTO validation
import { UpdateTaskDto } from "./dto/update-task.dto";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { PlanningService } from "./planning.service";

@Controller({ path: "plans", version: "1" })
@UseGuards(JwtAuthGuard)
export class PlanningController {
  constructor(planningService: PlanningService) {
    this.planningService = planningService;
  }

  private readonly planningService: PlanningService;

  @Get()
  async listPlans(@CurrentUser() user: AuthUser) {
    return await this.planningService.listPlans(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPlan(@CurrentUser() user: AuthUser, @Body() dto: CreatePlanDto) {
    return await this.planningService.createPlan(user.id, dto);
  }

  @Post("generate")
  @HttpCode(HttpStatus.CREATED)
  async generatePlan(
    @CurrentUser() user: AuthUser,
    @Body() dto: GeneratePlanDto
  ) {
    return await this.planningService.generatePlanFromSession(user.id, dto);
  }

  @Patch(":id")
  async updatePlan(
    @CurrentUser() user: AuthUser,
    @Param("id") planId: string,
    @Body() dto: UpdatePlanDto
  ) {
    return await this.planningService.updatePlan(user.id, planId, dto);
  }

  @Post(":id/tasks")
  @HttpCode(HttpStatus.CREATED)
  async addTask(
    @CurrentUser() user: AuthUser,
    @Param("id") planId: string,
    @Body() dto: CreateTaskDto
  ) {
    return await this.planningService.addTask(user.id, planId, dto);
  }

  @Patch(":id/tasks/:taskId")
  async updateTask(
    @CurrentUser() user: AuthUser,
    @Param("id") planId: string,
    @Param("taskId") taskId: string,
    @Body() dto: UpdateTaskDto
  ) {
    return await this.planningService.updateTask(user.id, planId, taskId, dto);
  }
}
