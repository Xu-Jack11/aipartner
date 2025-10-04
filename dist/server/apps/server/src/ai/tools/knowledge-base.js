"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildKnowledgeBaseContext = void 0;
const KNOWLEDGE_BASE_ENTRIES = [
    {
        content: "番茄工作法通过将学习拆分为25分钟高效专注时段配合5分钟休息，能够帮助学习者维持注意力并建立节奏。准备一个待办清单，在每个番茄钟开始前设定目标，结束后进行复盘。连续完成四个番茄钟后建议安排一次较长的休息，以避免注意力透支。",
        id: "pomodoro-technique",
        keyPoints: [
            "25分钟专注 + 5分钟休息的循环",
            "明确任务目标并在番茄钟结束后复盘",
            "每完成四个番茄钟安排15-30分钟长休息",
        ],
        summary: "番茄工作法是一种节奏化的时间管理方法，帮助你在短时高强度的学习中保持专注，并通过定期复盘提升效率。",
        tags: ["时间管理", "专注力", "自律"],
        title: "番茄工作法的高效使用指南",
    },
    {
        content: "费曼学习法强调用自己的语言讲解知识点，找到理解中的漏洞。学习时先构建知识框架，再假装向他人讲授，如同老师备课。遇到解释不通顺的部分，回到资料查漏补缺，最终形成自己的笔记。",
        id: "feynman-technique",
        keyPoints: [
            "将知识点讲述给“假想的学生”",
            "在讲解过程中暴露理解薄弱环节",
            "用更简单的语言重新阐释并巩固记忆",
        ],
        summary: "费曼学习法通过讲解的方式检验理解程度，能够在短时间内定位盲区并强化记忆，是备考和复盘的利器。",
        tags: ["学习方法", "备考", "复盘"],
        title: "费曼学习法的四个步骤",
    },
    {
        content: "间隔重复结合主动回忆可以显著提升长期记忆保持。使用数字化工具或纸质卡片记录知识点，根据掌握程度安排1、3、7、14天等逐步拉长的复习间隔。复习时务必先尝试回忆再对照答案，避免被动阅读。",
        id: "spaced-repetition",
        keyPoints: [
            "先回忆后验证，强化记忆路径",
            "根据掌握度动态调整复习间隔",
            "结合错题本或卡片管理知识点",
        ],
        summary: "间隔重复配合主动回忆能够延长记忆保持时间，帮助你高效安排复习节奏，是应试与长期学习的核心策略。",
        tags: ["记忆", "复习", "学习计划"],
        title: "间隔重复与主动回忆的组合策略",
    },
    {
        content: "制定SMART目标需要确保学习任务具体、可衡量、可达成、相关性强并且有截止时间。先拆分长期目标，再为每个阶段设定衡量指标，例如每周完成两份练习、一个项目或一篇总结。配合周复盘检查偏差，及时调整。",
        id: "smart-goals",
        keyPoints: [
            "目标需具体且能衡量进度",
            "设定明确的完成时限与评估标准",
            "通过周复盘持续迭代计划",
        ],
        summary: "SMART目标体系帮助你把模糊的学习愿望转化为可执行计划，确保努力方向聚焦并便于跟踪。",
        tags: ["目标管理", "规划", "习惯养成"],
        title: "用SMART原则设计学习目标",
    },
    {
        content: "深度学习笔记推荐采用“康奈尔笔记法”：左侧写关键提示，中间详细记录，底部写总结。课后10分钟内进行第一次整理，24小时内完成归纳，7天内回顾。通过不同颜色或符号区分概念、例题和反思。",
        id: "cornell-notes",
        keyPoints: [
            "按提示区、记录区、总结区三栏布局",
            "在24小时内完成第一次整理与提炼",
            "定期回顾以巩固理解和建立索引",
        ],
        summary: "康奈尔笔记法帮助你在记录过程中主动加工信息，形成结构化的知识网络，适用于课堂笔记与自学笔记。",
        tags: ["笔记", "信息整理", "高校学习"],
        title: "康奈尔笔记法实践技巧",
    },
];
const TITLE_MATCH_BONUS = 0.5;
const TAG_MATCH_BONUS = 0.3;
const sanitizeText = (text) => text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const tokenize = (text) => {
    const sanitized = sanitizeText(text);
    return sanitized.length === 0 ? [] : sanitized.split(" ");
};
const computeScore = (entry, query) => {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) {
        return 0;
    }
    const combinedText = `${entry.title} ${entry.summary} ${entry.content} ${entry.tags.join(" ")}`;
    const entryTokens = new Set(tokenize(combinedText));
    let matches = 0;
    for (const token of queryTokens) {
        if (entryTokens.has(token)) {
            matches += 1;
        }
    }
    const titleBonus = entry.title
        .toLowerCase()
        .includes(query.toLowerCase().trim())
        ? TITLE_MATCH_BONUS
        : 0;
    const tagBonus = entry.tags.some((tag) => query.toLowerCase().includes(tag.toLowerCase()))
        ? TAG_MATCH_BONUS
        : 0;
    return matches / queryTokens.length + titleBonus + tagBonus;
};
const buildKnowledgeBaseContext = (query, limit = 3) => {
    const sanitizedQuery = query.trim();
    if (sanitizedQuery.length === 0) {
        return;
    }
    const rankedEntries = KNOWLEDGE_BASE_ENTRIES.map((entry) => ({
        entry,
        score: computeScore(entry, sanitizedQuery),
    }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    if (rankedEntries.length === 0) {
        return;
    }
    return rankedEntries
        .map(({ entry }, index) => {
        const points = entry.keyPoints.length > 0
            ? `要点：${entry.keyPoints.join("；")}`
            : undefined;
        return [`${index + 1}. ${entry.title}`, `摘要：${entry.summary}`, points]
            .filter(Boolean)
            .join("\n");
    })
        .join("\n\n");
};
exports.buildKnowledgeBaseContext = buildKnowledgeBaseContext;
