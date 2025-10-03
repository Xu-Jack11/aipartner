import { Injectable, NotFoundException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { AiProvider } from "../ai/providers/ai-provider.interface";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { PrismaService } from "../prisma/prisma.service";
import type { CreatePlanDto } from "./dto/create-plan.dto";
import type { CreateTaskDto } from "./dto/create-task.dto";
import type { GeneratePlanDto } from "./dto/generate-plan.dto";
import type { PlanResponse, TaskResponse } from "./dto/plan-response.dto";
import type { UpdatePlanDto } from "./dto/update-plan.dto";
import type { UpdateTaskDto } from "./dto/update-task.dto";

// 正则表达式在顶层定义以避免性能问题
const JSON_EXTRACTION_REGEX = /\{[\s\S]*\}/;

@Injectable()
export class PlanningService {
  constructor(prismaService: PrismaService, aiProvider: AiProvider) {
    this.prisma = prismaService;
    this.aiProvider = aiProvider;
  }

  private readonly aiProvider: AiProvider;
  private readonly prisma: PrismaService;

  async listPlans(userId: string): Promise<readonly PlanResponse[]> {
    const plans = await this.prisma.plan.findMany({
      include: {
        tasks: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      where: { userId },
    });

    return plans.map((plan) => this.toPlanResponse(plan));
  }

  async createPlan(userId: string, dto: CreatePlanDto): Promise<PlanResponse> {
    const plan = await this.prisma.plan.create({
      data: {
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        focus: dto.focus,
        sessionId: dto.sessionId,
        title: dto.title,
        userId,
      },
      include: {
        tasks: true,
      },
    });

    return this.toPlanResponse(plan);
  }

  async generatePlanFromSession(
    userId: string,
    dto: GeneratePlanDto
  ): Promise<PlanResponse> {
    // 1. 获取会话信息和消息历史
    const session = await this.prisma.session.findUnique({
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      where: {
        id: dto.sessionId,
        userId,
      },
    });

    if (session === null) {
      throw new NotFoundException("会话不存在");
    }

    // 2. 构建提示词，让AI分析对话内容生成学习计划
    const conversationSummary = session.messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const systemPrompt = `你是一个专业的学习规划助手。请根据以下对话内容，生成一个结构化的学习计划。

对话内容：
${conversationSummary}

请以JSON格式返回学习计划，包含以下字段：
{
  "title": "学习计划标题",
  "focus": "学习重点领域",
  "tasks": [
    {
      "summary": "任务描述",
      "dueDate": "可选的截止日期(ISO 8601格式)"
    }
  ]
}

要求：
1. 标题应简洁明了，概括学习主题
2. 重点领域应总结核心知识点
3. 任务列表应按学习顺序排列，每个任务应具体可执行
4. 如果对话中提到时间要求，设置合理的截止日期
5. 任务数量建议3-8个，确保可行性`;

    // 3. 调用AI生成计划
    const aiResponse = await this.aiProvider.generateCompletion({
      messages: [{ content: systemPrompt, role: "system" }],
      model: "gpt-4o-mini",
    });

    // 4. 解析AI响应
    let planData: {
      title: string;
      focus: string;
      tasks: Array<{ summary: string; dueDate?: string }>;
    };

    try {
      // 尝试从响应中提取JSON
      const jsonMatch = aiResponse.content.match(JSON_EXTRACTION_REGEX);
      if (jsonMatch === null) {
        throw new Error("AI响应中未找到JSON数据");
      }
      planData = JSON.parse(jsonMatch[0]);
    } catch {
      // 如果解析失败，使用默认计划
      planData = {
        focus: session.focus,
        tasks: dto.taskSuggestions ?? [
          {
            summary: "回顾对话内容，整理学习要点",
          },
          {
            summary: "深入研究关键知识点",
          },
          {
            summary: "实践应用所学知识",
          },
        ],
        title: `${session.focus}学习计划`,
      };
    }

    // 5. 创建计划和任务
    const plan = await this.prisma.plan.create({
      data: {
        focus: planData.focus,
        sessionId: dto.sessionId,
        targetSteps: planData.tasks.length,
        title: planData.title,
        userId,
      },
      include: {
        tasks: true,
      },
    });

    // 6. 批量创建任务
    const tasks = await this.prisma.task.createManyAndReturn({
      data: planData.tasks.map((task) => ({
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        planId: plan.id,
        summary: task.summary,
      })),
    });

    return this.toPlanResponse({ ...plan, tasks });
  }

  async updatePlan(
    userId: string,
    planId: string,
    dto: UpdatePlanDto
  ): Promise<PlanResponse> {
    // 验证计划存在且属于当前用户
    const existingPlan = await this.prisma.plan.findUnique({
      where: {
        id: planId,
        userId,
      },
    });

    if (existingPlan === null) {
      throw new NotFoundException("学习计划不存在");
    }

    const updatedPlan = await this.prisma.plan.update({
      data: {
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        focus: dto.focus,
        status: dto.status,
        title: dto.title,
      },
      include: {
        tasks: {
          orderBy: { createdAt: "asc" },
        },
      },
      where: { id: planId },
    });

    return this.toPlanResponse(updatedPlan);
  }

  async addTask(
    userId: string,
    planId: string,
    dto: CreateTaskDto
  ): Promise<PlanResponse> {
    // 验证计划存在且属于当前用户
    const plan = await this.prisma.plan.findUnique({
      where: {
        id: planId,
        userId,
      },
    });

    if (plan === null) {
      throw new NotFoundException("学习计划不存在");
    }

    // 创建新任务
    await this.prisma.task.create({
      data: {
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        planId,
        summary: dto.summary,
      },
    });

    // 更新计划的目标步骤数
    const updatedPlan = await this.prisma.plan.update({
      data: {
        targetSteps: {
          increment: 1,
        },
      },
      include: {
        tasks: {
          orderBy: { createdAt: "asc" },
        },
      },
      where: { id: planId },
    });

    return this.toPlanResponse(updatedPlan);
  }

  async updateTask(
    userId: string,
    planId: string,
    taskId: string,
    dto: UpdateTaskDto
  ): Promise<PlanResponse> {
    // 验证计划和任务存在且属于当前用户
    const plan = await this.prisma.plan.findUnique({
      include: {
        tasks: true,
      },
      where: {
        id: planId,
        userId,
      },
    });

    if (plan === null) {
      throw new NotFoundException("学习计划不存在");
    }

    const task = plan.tasks.find((t) => t.id === taskId);
    if (task === undefined) {
      throw new NotFoundException("任务不存在");
    }

    // 检查状态变化
    const wasCompleted = task.status === "done";
    const nowCompleted = dto.status === "done";

    // 计算完成步骤的变化量
    let completedStepsChange = 0;
    if (!wasCompleted && nowCompleted) {
      // 从未完成变为完成，增加1
      completedStepsChange = 1;
    } else if (wasCompleted && !nowCompleted) {
      // 从完成变为未完成，减少1
      completedStepsChange = -1;
    }

    // 更新任务
    await this.prisma.task.update({
      data: {
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: dto.status,
        summary: dto.summary,
      },
      where: { id: taskId },
    });

    // 如果任务完成状态改变，更新计划的完成步骤数
    let updatedPlan = plan;
    if (completedStepsChange !== 0) {
      updatedPlan = await this.prisma.plan.update({
        data: {
          completedSteps: {
            increment: completedStepsChange,
          },
        },
        include: {
          tasks: {
            orderBy: { createdAt: "asc" },
          },
        },
        where: { id: planId },
      });
    } else {
      updatedPlan = await this.prisma.plan.findUniqueOrThrow({
        include: {
          tasks: {
            orderBy: { createdAt: "asc" },
          },
        },
        where: { id: planId },
      });
    }

    return this.toPlanResponse(updatedPlan);
  }

  async deletePlan(userId: string, planId: string): Promise<void> {
    // 验证计划存在且属于当前用户
    const plan = await this.prisma.plan.findFirst({
      where: {
        id: planId,
        userId,
      },
    });

    if (plan === null) {
      throw new NotFoundException("学习计划不存在");
    }

    // 删除计划(级联删除关联的任务)
    await this.prisma.plan.delete({
      where: { id: planId },
    });
  }

  private toPlanResponse(plan: {
    id: string;
    title: string;
    focus: string;
    status: string;
    targetSteps: number;
    completedSteps: number;
    dueDate: Date | null;
    sessionId: string | null;
    createdAt: Date;
    updatedAt: Date;
    tasks: Array<{
      id: string;
      summary: string;
      status: string;
      dueDate: Date | null;
      completedAt: Date | null;
    }>;
  }): PlanResponse {
    return {
      completedSteps: plan.completedSteps,
      createdAt: plan.createdAt.toISOString(),
      dueDate: plan.dueDate?.toISOString(),
      focus: plan.focus,
      id: plan.id,
      sessionId: plan.sessionId ?? undefined,
      status: plan.status,
      targetSteps: plan.targetSteps,
      tasks: plan.tasks.map(
        (task): TaskResponse => ({
          completedAt: task.completedAt?.toISOString(),
          dueDate: task.dueDate?.toISOString(),
          id: task.id,
          status: task.status,
          summary: task.summary,
        })
      ),
      title: plan.title,
      updatedAt: plan.updatedAt.toISOString(),
    };
  }
}
