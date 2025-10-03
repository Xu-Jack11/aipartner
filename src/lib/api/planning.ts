import type {
  CreatePlanDto,
  CreateTaskDto,
  GeneratePlanDto,
  PlanResponse,
  UpdatePlanDto,
  UpdateTaskDto,
} from "@/types/planning";
import { apiFetch } from "./client";

/**
 * 获取当前用户的所有学习计划
 */
export function fetchPlans(
  accessToken: string
): Promise<readonly PlanResponse[]> {
  return apiFetch<readonly PlanResponse[]>("v1/plans", {
    accessToken,
    method: "GET",
  });
}

/**
 * 创建新的学习计划
 */
export function createPlan(
  accessToken: string,
  dto: CreatePlanDto
): Promise<PlanResponse> {
  return apiFetch<PlanResponse>("v1/plans", {
    accessToken,
    body: JSON.stringify(dto),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

/**
 * 从对话生成学习计划
 */
export function generatePlanFromSession(
  accessToken: string,
  dto: GeneratePlanDto
): Promise<PlanResponse> {
  return apiFetch<PlanResponse>("v1/plans/generate", {
    accessToken,
    body: JSON.stringify(dto),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

/**
 * 更新学习计划
 */
export function updatePlan(
  accessToken: string,
  planId: string,
  dto: UpdatePlanDto
): Promise<PlanResponse> {
  return apiFetch<PlanResponse>(`v1/plans/${planId}`, {
    accessToken,
    body: JSON.stringify(dto),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });
}

/**
 * 向学习计划添加任务
 */
export function addTaskToPlan(
  accessToken: string,
  planId: string,
  dto: CreateTaskDto
): Promise<PlanResponse> {
  return apiFetch<PlanResponse>(`v1/plans/${planId}/tasks`, {
    accessToken,
    body: JSON.stringify(dto),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

/**
 * 更新计划中的任务
 */
export function updatePlanTask(
  accessToken: string,
  planId: string,
  taskId: string,
  dto: UpdateTaskDto
): Promise<PlanResponse> {
  return apiFetch<PlanResponse>(`v1/plans/${planId}/tasks/${taskId}`, {
    accessToken,
    body: JSON.stringify(dto),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });
}

/**
 * 完成任务
 */
export function completeTask(
  accessToken: string,
  planId: string,
  taskId: string
): Promise<PlanResponse> {
  return updatePlanTask(accessToken, planId, taskId, {
    status: "done",
    completedAt: new Date().toISOString(),
  });
}

/**
 * 删除学习计划
 */
export function deletePlan(accessToken: string, planId: string): Promise<void> {
  return apiFetch<void>(`v1/plans/${planId}`, {
    accessToken,
    method: "DELETE",
  });
}
