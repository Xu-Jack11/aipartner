/**
 * 学习会话记录响应
 */
export type StudySessionResponse = {
  id: string;
  userId: string;
  sessionId: string | null;
  focus: string;
  minutes: number;
  recordedAt: Date;
  createdAt: Date;
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
  capturedAt: Date;
};

/**
 * 学习进度统计响应
 */
export type ProgressStatsResponse = {
  // 连续学习天数
  streakDays: number;

  // 累计完成任务数
  totalCompletedTasks: number;

  // 本周学习分钟数
  weeklyStudyMinutes: number;

  // 本月学习分钟数
  monthlyStudyMinutes: number;

  // 总学习分钟数
  totalStudyMinutes: number;

  // 活跃学习天数
  activeDays: number;

  // 平均每日学习分钟数
  avgDailyMinutes: number;

  // 最近学习会话列表
  recentSessions: readonly StudySessionResponse[];

  // 最新进度快照
  latestSnapshot: ProgressSnapshotResponse | null;
};

/**
 * 学习趋势数据点
 */
export type TrendDataPoint = {
  date: string; // YYYY-MM-DD
  minutes: number;
  completedTasks: number;
};

/**
 * 学习趋势响应
 */
export type ProgressTrendResponse = {
  // 时间范围 (天数)
  days: number;

  // 趋势数据点
  dataPoints: readonly TrendDataPoint[];
};
