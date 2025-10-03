import type {
  Plan,
  ProgressSnapshot,
  Session,
  StudySession,
  Task,
  User,
} from "@prisma/client";

export type LearningPlanDto = {
  readonly id: string;
  readonly sessionId?: string;
  readonly title: string;
  readonly focus: string;
  readonly dueDate?: string;
  readonly status: string;
  readonly targetSteps: number;
  readonly completedSteps: number;
  readonly tasks: readonly LearningTaskDto[];
};

export type LearningTaskDto = {
  readonly id: string;
  readonly summary: string;
  readonly status: string;
  readonly dueDate?: string;
  readonly completedAt?: string;
};

export type StudySessionDto = {
  readonly id: string;
  readonly focus: string;
  readonly minutes: number;
  readonly date: string;
};

export type ChatSessionDto = {
  readonly id: string;
  readonly title: string;
  readonly focus: string;
  readonly updatedAt: string;
};

export type LearnerProfileDto = {
  readonly name: string;
  readonly learningGoal: string;
  readonly recentFocus: string;
};

export type StudyMetricsDto = {
  readonly weeklyHours: number;
  readonly totalCompletedSteps: number;
  readonly streakDays: number;
};

export type LearningSummaryDto = {
  readonly learnerProfile: LearnerProfileDto;
  readonly learningPlans: readonly LearningPlanDto[];
  readonly studySessions: readonly StudySessionDto[];
  readonly metrics: StudyMetricsDto;
  readonly chatSessions: readonly ChatSessionDto[];
};

export type PrismaPlanWithTasks = Plan & { readonly tasks: Task[] };
export type PrismaUserWithRelations = User & {
  readonly plans: Plan[];
  readonly studySessions: StudySession[];
  readonly progressSnapshots: ProgressSnapshot[];
  readonly sessions: Session[];
};
