import { Controller, Get, UseGuards } from "@nestjs/common";
import type { AuthUser } from "../auth/auth.types";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import type { LearningSummaryDto } from "./dto/learning-summary.dto";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { LearningService } from "./learning.service";

@Controller({ path: "learning", version: "1" })
@UseGuards(JwtAuthGuard)
export class LearningController {
  constructor(learningService: LearningService) {
    this.learningService = learningService;
  }

  private readonly learningService: LearningService;

  @Get("summary")
  getSummary(@CurrentUser() user: AuthUser): Promise<LearningSummaryDto> {
    return this.learningService.getSummary(user.id);
  }
}
