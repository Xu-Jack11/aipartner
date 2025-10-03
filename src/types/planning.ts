/**
 * 学习计划相关的类型定义
 */

export type PlanStatus = "active" | "completed" | "archived";
export type TaskStatus = "pending" | "done";

export type TaskResponse = {
  id: string;
  summary: string;
  status: TaskStatus;
  dueDate?: string;
  completedAt?: string;
};

export type PlanResponse = {
  id: string;
  title: string;
  focus: string;
  status: PlanStatus;
  targetSteps: number;
  completedSteps: number;
  dueDate?: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
  tasks: readonly TaskResponse[];
};

export type CreatePlanDto = {
  title: string;
  focus: string;
  sessionId?: string;
  dueDate?: string;
};

export type UpdatePlanDto = {
  title?: string;
  focus?: string;
  dueDate?: string;
  status?: PlanStatus;
};

export type CreateTaskDto = {
  summary: string;
  dueDate?: string;
};

export type UpdateTaskDto = {
  summary?: string;
  status?: TaskStatus;
  dueDate?: string;
  completedAt?: string;
};

export type GeneratePlanDto = {
  sessionId: string;
  taskSuggestions?: Array<{ summary: string; dueDate?: string }>;
};
