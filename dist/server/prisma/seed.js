"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs");
const prisma = new client_1.PrismaClient();
const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "password123";
const BCRYPT_SALT_ROUNDS = 12;
const PROGRESS_SNAPSHOT_SUFFIX = "-snapshot";
const main = async () => {
    const passwordHash = await (0, bcryptjs_1.hash)(DEMO_PASSWORD, BCRYPT_SALT_ROUNDS);
    const existingUser = await prisma.user.findUnique({
        where: { email: DEMO_EMAIL },
    });
    const user = existingUser
        ? existingUser
        : await prisma.user.create({
            data: {
                displayName: "李华",
                email: DEMO_EMAIL,
                passwordHash,
                timezone: "Asia/Shanghai",
            },
        });
    const sessionLinear = await upsertSession(user.id, "线性代数重点回顾", "线性代数");
    const sessionEnglish = await upsertSession(user.id, "阅读理解强化练习", "考研英语");
    const sessionStatistics = await upsertSession(user.id, "概率论章节复习", "概率统计");
    await upsertPlan(user.id, sessionLinear.id, {
        completedSteps: 5,
        focus: "线性代数",
        planId: "plan-linear",
        targetSteps: 7,
        title: "线性代数重点回顾",
        dueDate: new Date("2025-10-01"),
        tasks: [
            {
                summary: "整理矩阵运算公式并完成 2 道例题",
                status: "in-progress",
                dueDate: new Date("2025-09-29"),
            },
            {
                summary: "完成特征值自测题并记录错题",
                status: "todo",
                dueDate: new Date("2025-09-29"),
            },
            {
                summary: "总结特征向量在实际问题中的应用",
                status: "todo",
                dueDate: new Date("2025-09-30"),
            },
        ],
    });
    await upsertPlan(user.id, sessionEnglish.id, {
        completedSteps: 3,
        focus: "考研英语",
        planId: "plan-english",
        targetSteps: 5,
        title: "阅读理解强化练习",
        dueDate: new Date("2025-10-03"),
        tasks: [
            {
                summary: "阅读理解练习题 2 篇并整理生词表",
                status: "done",
                dueDate: new Date("2025-09-28"),
            },
            {
                summary: "句法标注训练（每日 2 段）",
                status: "in-progress",
                dueDate: new Date("2025-09-29"),
            },
        ],
    });
    await upsertPlan(user.id, sessionStatistics.id, {
        completedSteps: 2,
        focus: "概率统计",
        planId: "plan-statistics",
        targetSteps: 6,
        title: "概率论章节复习",
        dueDate: new Date("2025-10-05"),
        tasks: [
            {
                summary: "绘制正态抽样流程图",
                status: "in-progress",
                dueDate: new Date("2025-09-28"),
            },
            {
                summary: "完成卡方分布练习题 3 道",
                status: "todo",
                dueDate: new Date("2025-09-29"),
            },
        ],
    });
    await prisma.studySession.createMany({
        data: [
            {
                focus: "线性代数习题",
                minutes: 110,
                recordedAt: new Date("2025-09-28"),
                sessionId: sessionLinear.id,
                userId: user.id,
            },
            {
                focus: "英语阅读理解",
                minutes: 95,
                recordedAt: new Date("2025-09-27"),
                sessionId: sessionEnglish.id,
                userId: user.id,
            },
            {
                focus: "概率统计",
                minutes: 80,
                recordedAt: new Date("2025-09-26"),
                sessionId: sessionStatistics.id,
                userId: user.id,
            },
        ],
        skipDuplicates: true,
    });
    const snapshotId = `${user.id}${PROGRESS_SNAPSHOT_SUFFIX}`;
    await prisma.progressSnapshot.upsert({
        where: { id: snapshotId },
        create: {
            id: snapshotId,
            userId: user.id,
            streakDays: 6,
            studyMinutes: 285,
            completedTasks: 12,
        },
        update: {
            streakDays: 6,
            studyMinutes: 285,
            completedTasks: 12,
        },
    });
    process.stdout.write("Seed completed. Demo account:\n");
    process.stdout.write(`Email: ${DEMO_EMAIL}\n`);
    process.stdout.write(`Password: ${DEMO_PASSWORD}\n`);
};
const upsertSession = (userId, title, focus) => {
    const slug = title.replace(/\s+/g, "-");
    const sessionId = `${userId}-${slug}`;
    return prisma.session.upsert({
        where: { id: sessionId },
        create: {
            focus,
            id: sessionId,
            title,
            userId,
        },
        update: {
            focus,
            title,
        },
    });
};
const upsertPlan = async (userId, sessionId, seed) => {
    const plan = await prisma.plan.upsert({
        where: { id: seed.planId },
        create: {
            id: seed.planId,
            userId,
            sessionId,
            title: seed.title,
            focus: seed.focus,
            dueDate: seed.dueDate,
            targetSteps: seed.targetSteps,
            completedSteps: seed.completedSteps,
            status: "in-progress",
        },
        update: {
            focus: seed.focus,
            dueDate: seed.dueDate,
            title: seed.title,
            completedSteps: seed.completedSteps,
            targetSteps: seed.targetSteps,
        },
        include: { tasks: true },
    });
    await prisma.task.deleteMany({ where: { planId: plan.id } });
    if (seed.tasks.length > 0) {
        await prisma.task.createMany({
            data: seed.tasks.map((task, index) => ({
                planId: plan.id,
                summary: task.summary,
                status: task.status,
                dueDate: task.dueDate,
                orderIndex: index,
            })),
        });
    }
};
main()
    .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
