import { apiFetch } from "./client";

/**
 * 学习会话记录响应
 */
export type StudySessionResponse = {
  id: string;
  userId: string;
  sessionId: string | null;
  focus: string;
  minutes: number;
  recordedAt: string;
  createdAt: string;
};

/**
 * 进度快照响应
 */
export type ProgressSnapshotResponse = {
  id: string;
  userId: string;
  streakDays: number;
  completedTasks: number;
  studyMinutes: number;
  capturedAt: string;
};

/**
 * 学习进度统计响应
 */
export type ProgressStatsResponse = {
  streakDays: number;
  totalCompletedTasks: number;
  weeklyStudyMinutes: number;
  monthlyStudyMinutes: number;
  totalStudyMinutes: number;
  activeDays: number;
  avgDailyMinutes: number;
  recentSessions: readonly StudySessionResponse[];
  latestSnapshot: ProgressSnapshotResponse | null;
};

/**
 * 学习趋势数据点
 */
export type TrendDataPoint = {
  date: string;
  minutes: number;
  completedTasks: number;
};

/**
 * 学习趋势响应
 */
export type ProgressTrendResponse = {
  days: number;
  dataPoints: readonly TrendDataPoint[];
};

/**
 * 创建学习会话记录请求
 */
export type CreateStudySessionDto = {
  sessionId?: string;
  focus: string;
  minutes: number;
  recordedAt?: string;
};

/**
 * 获取学习进度统计
 */
export function fetchProgressStats(
  accessToken: string
): Promise<ProgressStatsResponse> {
  return apiFetch<ProgressStatsResponse>("v1/progress/stats", {
    accessToken,
    method: "GET",
  });
}

/**
 * 获取学习会话列表
 */
export function fetchStudySessions(
  accessToken: string,
  limit?: number
): Promise<readonly StudySessionResponse[]> {
  const url =
    limit !== undefined
      ? `v1/progress/sessions?limit=${limit}`
      : "v1/progress/sessions";
  return apiFetch<readonly StudySessionResponse[]>(url, {
    accessToken,
    method: "GET",
  });
}

/**
 * 创建学习会话记录
 */
export function createStudySession(
  accessToken: string,
  dto: CreateStudySessionDto
): Promise<StudySessionResponse> {
  return apiFetch<StudySessionResponse>("v1/progress/sessions", {
    accessToken,
    body: JSON.stringify(dto),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

/**
 * 获取学习趋势数据
 */
export function fetchProgressTrend(
  accessToken: string,
  days = 30
): Promise<ProgressTrendResponse> {
  return apiFetch<ProgressTrendResponse>(`v1/progress/trend?days=${days}`, {
    accessToken,
    method: "GET",
  });
}
