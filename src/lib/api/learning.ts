import { apiFetch } from "./client";

export type LearningTaskResponse = {
  readonly id: string;
  readonly summary: string;
  readonly status: string;
  readonly dueDate?: string;
  readonly completedAt?: string;
};

export type LearningPlanResponse = {
  readonly id: string;
  readonly sessionId?: string;
  readonly title: string;
  readonly focus: string;
  readonly dueDate?: string;
  readonly status: string;
  readonly targetSteps: number;
  readonly completedSteps: number;
  readonly tasks: readonly LearningTaskResponse[];
};

export type StudySessionResponse = {
  readonly id: string;
  readonly focus: string;
  readonly minutes: number;
  readonly date: string;
};

export type ChatSessionResponse = {
  readonly id: string;
  readonly title: string;
  readonly focus: string;
  readonly updatedAt: string;
};

export type LearningSummaryResponse = {
  readonly learnerProfile: {
    readonly name: string;
    readonly learningGoal: string;
    readonly recentFocus: string;
  };
  readonly learningPlans: readonly LearningPlanResponse[];
  readonly studySessions: readonly StudySessionResponse[];
  readonly metrics: {
    readonly weeklyHours: number;
    readonly totalCompletedSteps: number;
    readonly streakDays: number;
  };
  readonly chatSessions: readonly ChatSessionResponse[];
};

export const fetchLearningSummary = (
  accessToken: string
): Promise<LearningSummaryResponse> =>
  apiFetch<LearningSummaryResponse>("v1/learning/summary", {
    accessToken,
    method: "GET",
  });
