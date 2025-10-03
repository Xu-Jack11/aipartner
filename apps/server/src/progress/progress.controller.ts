import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import type { AuthUser } from "../auth/auth.types";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import type { CreateStudySessionDto } from "./dto/create-study-session.dto";
import type {
  ProgressStatsResponse,
  ProgressTrendResponse,
  StudySessionResponse,
} from "./dto/progress-response.dto";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { ProgressService } from "./progress.service";

@Controller("progress")
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(progressService: ProgressService) {
    this.progressService = progressService;
  }

  private readonly progressService: ProgressService;

  /**
   * 创建学习会话记录
   * POST /api/v1/progress/sessions
   */
  @Post("sessions")
  createSession(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateStudySessionDto
  ): Promise<StudySessionResponse> {
    return this.progressService.createStudySession(user.id, dto);
  }

  /**
   * 获取学习会话列表
   * GET /api/v1/progress/sessions?limit=20
   */
  @Get("sessions")
  getSessions(
    @CurrentUser() user: AuthUser,
    @Query("limit") limit?: number
  ): Promise<readonly StudySessionResponse[]> {
    return this.progressService.getStudySessions(user.id, limit);
  }

  /**
   * 获取学习进度统计
   * GET /api/v1/progress/stats
   */
  @Get("stats")
  getStats(@CurrentUser() user: AuthUser): Promise<ProgressStatsResponse> {
    return this.progressService.getProgressStats(user.id);
  }

  /**
   * 获取学习趋势数据
   * GET /api/v1/progress/trend?days=30
   */
  @Get("trend")
  getTrend(
    @CurrentUser() user: AuthUser,
    @Query("days") days?: number
  ): Promise<ProgressTrendResponse> {
    return this.progressService.getProgressTrend(user.id, days);
  }
}
