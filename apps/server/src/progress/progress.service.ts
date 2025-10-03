import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { PrismaService } from "../prisma/prisma.service";
import type { CreateStudySessionDto } from "./dto/create-study-session.dto";
import type {
  ProgressSnapshotResponse,
  ProgressStatsResponse,
  ProgressTrendResponse,
  StudySessionResponse,
  TrendDataPoint,
} from "./dto/progress-response.dto";

const MINUTES_PER_DAY = 24 * 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const MILLISECONDS_PER_DAY =
  MINUTES_PER_DAY * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30;
const DEFAULT_SESSION_LIMIT = 20;

@Injectable()
export class ProgressService {
  constructor(prismaService: PrismaService) {
    this.prisma = prismaService;
  }

  private readonly prisma: PrismaService;

  /**
   * 创建学习会话记录
   */
  async createStudySession(
    userId: string,
    dto: CreateStudySessionDto
  ): Promise<StudySessionResponse> {
    const session = await this.prisma.studySession.create({
      data: {
        focus: dto.focus,
        minutes: dto.minutes,
        recordedAt: dto.recordedAt ?? new Date(),
        sessionId: dto.sessionId,
        userId,
      },
    });

    // 触发快照更新(异步,不阻塞响应)
    this.updateProgressSnapshot(userId).catch(() => {
      // 快照更新失败不影响主流程
    });

    return this.toStudySessionResponse(session);
  }

  /**
   * 获取用户学习会话列表
   */
  async getStudySessions(
    userId: string,
    limit = DEFAULT_SESSION_LIMIT
  ): Promise<readonly StudySessionResponse[]> {
    const sessions = await this.prisma.studySession.findMany({
      orderBy: { recordedAt: "desc" },
      take: limit,
      where: { userId },
    });

    return sessions.map((s) => this.toStudySessionResponse(s));
  }

  /**
   * 获取学习进度统计
   */
  async getProgressStats(userId: string): Promise<ProgressStatsResponse> {
    const now = new Date();
    const weekAgo = new Date(
      now.getTime() - DAYS_IN_WEEK * MILLISECONDS_PER_DAY
    );
    const monthAgo = new Date(
      now.getTime() - DAYS_IN_MONTH * MILLISECONDS_PER_DAY
    );

    // 获取所有学习会话
    const allSessions = await this.prisma.studySession.findMany({
      orderBy: { recordedAt: "asc" },
      where: { userId },
    });

    // 获取所有已完成任务数
    const completedTasksCount = await this.prisma.task.count({
      where: {
        plan: { userId },
        status: "done",
      },
    });

    // 计算统计数据
    const totalStudyMinutes = allSessions.reduce(
      (sum, s) => sum + s.minutes,
      0
    );
    const weeklyStudyMinutes = allSessions
      .filter((s) => s.recordedAt >= weekAgo)
      .reduce((sum, s) => sum + s.minutes, 0);
    const monthlyStudyMinutes = allSessions
      .filter((s) => s.recordedAt >= monthAgo)
      .reduce((sum, s) => sum + s.minutes, 0);

    // 计算活跃天数
    const uniqueDates = new Set(
      allSessions.map((s) => s.recordedAt.toISOString().split("T")[0])
    );
    const activeDays = uniqueDates.size;

    // 计算连续学习天数
    const streakDays = this.calculateStreakDays(allSessions);

    // 获取最近20条会话
    const recentSessions = allSessions.slice(-DEFAULT_SESSION_LIMIT).reverse();

    // 获取最新快照
    const latestSnapshot = await this.prisma.progressSnapshot.findFirst({
      orderBy: { capturedAt: "desc" },
      where: { userId },
    });

    return {
      activeDays,
      avgDailyMinutes: activeDays > 0 ? totalStudyMinutes / activeDays : 0,
      latestSnapshot: latestSnapshot
        ? this.toProgressSnapshotResponse(latestSnapshot)
        : null,
      monthlyStudyMinutes,
      recentSessions: recentSessions.map((s) => this.toStudySessionResponse(s)),
      streakDays,
      totalCompletedTasks: completedTasksCount,
      totalStudyMinutes,
      weeklyStudyMinutes,
    };
  }

  /**
   * 获取学习趋势数据
   */
  async getProgressTrend(
    userId: string,
    days = 30
  ): Promise<ProgressTrendResponse> {
    const startDate = new Date(Date.now() - days * MILLISECONDS_PER_DAY);

    // 获取时间范围内的学习会话
    const sessions = await this.prisma.studySession.findMany({
      orderBy: { recordedAt: "asc" },
      where: {
        recordedAt: { gte: startDate },
        userId,
      },
    });

    // 获取时间范围内的任务完成情况
    const completedTasks = await this.prisma.task.findMany({
      select: {
        completedAt: true,
      },
      where: {
        completedAt: { gte: startDate },
        plan: { userId },
        status: "done",
      },
    });

    // 按日期分组统计
    const dataMap = new Map<
      string,
      { minutes: number; completedTasks: number }
    >();

    // 初始化所有日期
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * MILLISECONDS_PER_DAY);
      const dateKey = date.toISOString().split("T")[0];
      dataMap.set(dateKey, { completedTasks: 0, minutes: 0 });
    }

    // 统计学习时长
    for (const session of sessions) {
      const dateKey = session.recordedAt.toISOString().split("T")[0];
      const data = dataMap.get(dateKey);
      if (data) {
        data.minutes += session.minutes;
      }
    }

    // 统计完成任务数
    for (const task of completedTasks) {
      if (task.completedAt) {
        const dateKey = task.completedAt.toISOString().split("T")[0];
        const data = dataMap.get(dateKey);
        if (data) {
          data.completedTasks += 1;
        }
      }
    }

    // 转换为数组
    const dataPoints: TrendDataPoint[] = Array.from(dataMap.entries()).map(
      ([date, data]) => ({
        completedTasks: data.completedTasks,
        date,
        minutes: data.minutes,
      })
    );

    return {
      dataPoints,
      days,
    };
  }

  /**
   * 更新进度快照(内部方法)
   */
  private async updateProgressSnapshot(userId: string): Promise<void> {
    const stats = await this.getProgressStats(userId);

    await this.prisma.progressSnapshot.create({
      data: {
        completedTasks: stats.totalCompletedTasks,
        streakDays: stats.streakDays,
        studyMinutes: stats.totalStudyMinutes,
        userId,
      },
    });
  }

  /**
   * 计算连续学习天数
   */
  private calculateStreakDays(sessions: Array<{ recordedAt: Date }>): number {
    if (sessions.length === 0) {
      return 0;
    }

    // 提取所有学习日期(去重并排序)
    const uniqueDates = Array.from(
      new Set(sessions.map((s) => s.recordedAt.toISOString().split("T")[0]))
    ).sort();

    if (uniqueDates.length === 0) {
      return 0;
    }

    const today = new Date().toISOString().split("T")[0];
    const lastDate = uniqueDates.at(-1);

    // 如果最后学习日期不是今天或昨天,连续天数为0
    const daysSinceLastStudy = lastDate
      ? Math.floor(
          (new Date(today).getTime() - new Date(lastDate).getTime()) /
            MILLISECONDS_PER_DAY
        )
      : Number.POSITIVE_INFINITY;

    if (daysSinceLastStudy > 1) {
      return 0;
    }

    // 从后往前计算连续天数
    let streak = 1;
    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const currentDate = new Date(uniqueDates[i]);
      const nextDate = new Date(uniqueDates[i + 1]);
      const dayDiff = Math.floor(
        (nextDate.getTime() - currentDate.getTime()) / MILLISECONDS_PER_DAY
      );

      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * 转换为响应类型
   */
  private toStudySessionResponse(session: {
    id: string;
    userId: string;
    sessionId: string | null;
    focus: string;
    minutes: number;
    recordedAt: Date;
    createdAt: Date;
  }): StudySessionResponse {
    return {
      createdAt: session.createdAt,
      focus: session.focus,
      id: session.id,
      minutes: session.minutes,
      recordedAt: session.recordedAt,
      sessionId: session.sessionId,
      userId: session.userId,
    };
  }

  private toProgressSnapshotResponse(snapshot: {
    id: string;
    userId: string;
    streakDays: number;
    completedTasks: number;
    studyMinutes: number;
    capturedAt: Date;
  }): ProgressSnapshotResponse {
    return {
      capturedAt: snapshot.capturedAt,
      completedTasks: snapshot.completedTasks,
      id: snapshot.id,
      streakDays: snapshot.streakDays,
      studyMinutes: snapshot.studyMinutes,
      userId: snapshot.userId,
    };
  }
}
