export type TaskResponse = {
  readonly id: string;
  readonly summary: string;
  readonly status: string;
  readonly dueDate?: string;
  readonly completedAt?: string;
};

export type PlanResponse = {
  readonly id: string;
  readonly title: string;
  readonly focus: string;
  readonly status: string;
  readonly targetSteps: number;
  readonly completedSteps: number;
  readonly dueDate?: string;
  readonly sessionId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly tasks: readonly TaskResponse[];
};
