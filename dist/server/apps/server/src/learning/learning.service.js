"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningService = void 0;
const common_1 = require("@nestjs/common");
// biome-ignore lint/style/useImportType: Prisma service is required at runtime for dependency injection.
const prisma_service_1 = require("../prisma/prisma.service");
const DAYS_PER_WEEK = 7;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const WEEK_DURATION_MS = DAYS_PER_WEEK *
    HOURS_PER_DAY *
    MINUTES_PER_HOUR *
    SECONDS_PER_MINUTE *
    MILLISECONDS_PER_SECOND;
let LearningService = class LearningService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary(userId) {
        var _a;
        const [userRecord, planRecords, studyRecords, progressRecords, sessionRecords,] = await this.prisma.$transaction([
            this.prisma.user.findUnique({
                where: { id: userId },
            }),
            this.prisma.plan.findMany({
                where: { userId },
                include: { tasks: true },
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.studySession.findMany({
                where: { userId },
                orderBy: { recordedAt: "desc" },
                take: 12,
            }),
            this.prisma.progressSnapshot.findMany({
                where: { userId },
                orderBy: { capturedAt: "desc" },
                take: 1,
            }),
            this.prisma.session.findMany({
                where: { userId },
                orderBy: { updatedAt: "desc" },
            }),
        ]);
        if (userRecord === null) {
            throw new Error("User not found while building learning summary");
        }
        const plans = this.toPlanDtos(planRecords);
        const studySessions = this.toStudySessions(studyRecords);
        const metrics = this.toStudyMetrics((_a = progressRecords[0]) !== null && _a !== void 0 ? _a : null, plans, studySessions);
        const chatSessions = this.toChatSessions(sessionRecords);
        const learnerProfile = this.toLearnerProfile(userRecord.displayName, plans);
        return {
            chatSessions,
            learnerProfile,
            learningPlans: plans,
            metrics,
            studySessions,
        };
    }
    toPlanDtos(plans) {
        var _a, _b, _c, _d;
        const result = [];
        for (const plan of plans) {
            const taskDtos = [];
            for (const task of plan.tasks) {
                taskDtos.push({
                    completedAt: (_a = task.completedAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                    dueDate: (_b = task.dueDate) === null || _b === void 0 ? void 0 : _b.toISOString(),
                    id: task.id,
                    status: task.status,
                    summary: task.summary,
                });
            }
            result.push({
                completedSteps: plan.completedSteps,
                dueDate: (_c = plan.dueDate) === null || _c === void 0 ? void 0 : _c.toISOString(),
                focus: plan.focus,
                id: plan.id,
                sessionId: (_d = plan.sessionId) !== null && _d !== void 0 ? _d : undefined,
                status: plan.status,
                targetSteps: plan.targetSteps,
                tasks: taskDtos,
                title: plan.title,
            });
        }
        return result;
    }
    toStudySessions(records) {
        const sessions = [];
        for (const record of records) {
            sessions.push({
                date: record.recordedAt.toISOString(),
                focus: record.focus,
                id: record.id,
                minutes: record.minutes,
            });
        }
        return sessions;
    }
    toChatSessions(records) {
        const sessions = [];
        for (const record of records) {
            sessions.push({
                focus: record.focus,
                id: record.id,
                title: record.title,
                updatedAt: record.updatedAt.toISOString(),
            });
        }
        return sessions;
    }
    toLearnerProfile(name, plans) {
        const focusSet = new Set();
        for (const plan of plans) {
            focusSet.add(plan.focus);
        }
        const focusList = Array.from(focusSet);
        const recentFocus = focusList.slice(0, 2).join("、") || "持续学习";
        const learningGoal = focusList.join("、") || "打造个性化学习节奏";
        return {
            learningGoal,
            name,
            recentFocus,
        };
    }
    toStudyMetrics(snapshot, plans, studySessions) {
        var _a;
        const totalCompletedSteps = this.countTotalCompletedSteps(plans);
        const streakDays = (_a = snapshot === null || snapshot === void 0 ? void 0 : snapshot.streakDays) !== null && _a !== void 0 ? _a : 0;
        const weeklyHours = this.calculateWeeklyHours(studySessions);
        return {
            streakDays,
            totalCompletedSteps,
            weeklyHours,
        };
    }
    countTotalCompletedSteps(plans) {
        let total = 0;
        for (const plan of plans) {
            total += plan.completedSteps;
        }
        return total;
    }
    calculateWeeklyHours(sessions) {
        const now = Date.now();
        let minutes = 0;
        for (const session of sessions) {
            const recordedTimestamp = new Date(session.date).getTime();
            if (now - recordedTimestamp <= WEEK_DURATION_MS) {
                minutes += session.minutes;
            }
        }
        return Math.round((minutes / 60) * 10) / 10;
    }
};
exports.LearningService = LearningService;
exports.LearningService = LearningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LearningService);
