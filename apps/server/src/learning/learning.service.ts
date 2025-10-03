import { Injectable } from "@nestjs/common";
import type { ProgressSnapshot, Session, StudySession } from "@prisma/client";
// biome-ignore lint/style/useImportType: Prisma service is required at runtime for dependency injection.
import { PrismaService } from "../prisma/prisma.service";
import type {
  ChatSessionDto,
  LearnerProfileDto,
  LearningPlanDto,
  LearningSummaryDto,
  LearningTaskDto,
  PrismaPlanWithTasks,
  StudyMetricsDto,
  StudySessionDto,
} from "./dto/learning-summary.dto";

const DAYS_PER_WEEK = 7;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const WEEK_DURATION_MS =
  DAYS_PER_WEEK *
  HOURS_PER_DAY *
  MINUTES_PER_HOUR *
  SECONDS_PER_MINUTE *
  MILLISECONDS_PER_SECOND;

@Injectable()
export class LearningService {
  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  private readonly prisma: PrismaService;

  async getSummary(userId: string): Promise<LearningSummaryDto> {
    const [
      userRecord,
      planRecords,
      studyRecords,
      progressRecords,
      sessionRecords,
    ] = await this.prisma.$transaction([
      this.prisma.user.findUnique({
        where: { id: userId },
      }),
      this.prisma.plan.findMany({
        where: { userId },
        include: { tasks: true },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.studySession.findMany({
        where: { userId },
        orderBy: { recordedAt: "desc" },
        take: 12,
      }),
      this.prisma.progressSnapshot.findMany({
        where: { userId },
        orderBy: { capturedAt: "desc" },
        take: 1,
      }),
      this.prisma.session.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    if (userRecord === null) {
      throw new Error("User not found while building learning summary");
    }

    const plans = this.toPlanDtos(planRecords);
    const studySessions = this.toStudySessions(studyRecords);
    const metrics = this.toStudyMetrics(
      progressRecords[0] ?? null,
      plans,
      studySessions
    );
    const chatSessions = this.toChatSessions(sessionRecords);
    const learnerProfile = this.toLearnerProfile(userRecord.displayName, plans);

    return {
      chatSessions,
      learnerProfile,
      learningPlans: plans,
      metrics,
      studySessions,
    };
  }

  private toPlanDtos(plans: PrismaPlanWithTasks[]): LearningPlanDto[] {
    const result: LearningPlanDto[] = [];
    for (const plan of plans) {
      const taskDtos: LearningTaskDto[] = [];
      for (const task of plan.tasks) {
        taskDtos.push({
          completedAt: task.completedAt?.toISOString(),
          dueDate: task.dueDate?.toISOString(),
          id: task.id,
          status: task.status,
          summary: task.summary,
        });
      }
      result.push({
        completedSteps: plan.completedSteps,
        dueDate: plan.dueDate?.toISOString(),
        focus: plan.focus,
        id: plan.id,
        sessionId: plan.sessionId ?? undefined,
        status: plan.status,
        targetSteps: plan.targetSteps,
        tasks: taskDtos,
        title: plan.title,
      });
    }
    return result;
  }

  private toStudySessions(records: StudySession[]): StudySessionDto[] {
    const sessions: StudySessionDto[] = [];
    for (const record of records) {
      sessions.push({
        date: record.recordedAt.toISOString(),
        focus: record.focus,
        id: record.id,
        minutes: record.minutes,
      });
    }
    return sessions;
  }

  private toChatSessions(records: Session[]): ChatSessionDto[] {
    const sessions: ChatSessionDto[] = [];
    for (const record of records) {
      sessions.push({
        focus: record.focus,
        id: record.id,
        title: record.title,
        updatedAt: record.updatedAt.toISOString(),
      });
    }
    return sessions;
  }

  private toLearnerProfile(
    name: string,
    plans: LearningPlanDto[]
  ): LearnerProfileDto {
    const focusSet = new Set<string>();
    for (const plan of plans) {
      focusSet.add(plan.focus);
    }
    const focusList = Array.from(focusSet);
    const recentFocus = focusList.slice(0, 2).join("、") || "持续学习";
    const learningGoal = focusList.join("、") || "打造个性化学习节奏";

    return {
      learningGoal,
      name,
      recentFocus,
    };
  }

  private toStudyMetrics(
    snapshot: ProgressSnapshot | null,
    plans: LearningPlanDto[],
    studySessions: StudySessionDto[]
  ): StudyMetricsDto {
    const totalCompletedSteps = this.countTotalCompletedSteps(plans);
    const streakDays = snapshot?.streakDays ?? 0;
    const weeklyHours = this.calculateWeeklyHours(studySessions);

    return {
      streakDays,
      totalCompletedSteps,
      weeklyHours,
    };
  }

  private countTotalCompletedSteps(plans: LearningPlanDto[]): number {
    let total = 0;
    for (const plan of plans) {
      total += plan.completedSteps;
    }
    return total;
  }

  private calculateWeeklyHours(sessions: StudySessionDto[]): number {
    const now = Date.now();
    let minutes = 0;
    for (const session of sessions) {
      const recordedTimestamp = new Date(session.date).getTime();
      if (now - recordedTimestamp <= WEEK_DURATION_MS) {
        minutes += session.minutes;
      }
    }
    return Math.round((minutes / 60) * 10) / 10;
  }
}
