"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareMessagesWithTooling = void 0;
const deep_thinking_1 = require("../tools/deep-thinking");
const knowledge_base_1 = require("../tools/knowledge-base");
const web_search_1 = require("../tools/web-search");
const cloneMessages = (messages) => messages.map((msg) => (Object.assign({}, msg)));
const findLastUserMessage = (messages) => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const message = messages[index];
        if (message.role === "user") {
            return message;
        }
    }
    return;
};
const hasActiveTools = (tools) => tools.some((tool) => tool === "knowledge-base" || tool === "web-search");
const appendKnowledgeContext = (sections, query, logger) => {
    var _a;
    try {
        const knowledgeContext = (0, knowledge_base_1.buildKnowledgeBaseContext)(query);
        if (knowledgeContext) {
            sections.push(`知识库检索结果：\n${knowledgeContext}`);
        }
    }
    catch (error) {
        (_a = logger === null || logger === void 0 ? void 0 : logger.warn) === null || _a === void 0 ? void 0 : _a.call(logger, `Knowledge base enrichment failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};
const appendWebSearchContext = async (sections, query, logger) => {
    var _a;
    try {
        const webSearchContext = await (0, web_search_1.fetchWebSearchContext)(query);
        if (webSearchContext) {
            sections.push(`联网搜索结果：\n${webSearchContext}`);
        }
    }
    catch (error) {
        (_a = logger === null || logger === void 0 ? void 0 : logger.warn) === null || _a === void 0 ? void 0 : _a.call(logger, `Web search enrichment failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};
const buildContextSections = async (tools, query, logger) => {
    const sections = [];
    if (tools.includes("knowledge-base")) {
        appendKnowledgeContext(sections, query, logger);
    }
    if (tools.includes("web-search")) {
        await appendWebSearchContext(sections, query, logger);
    }
    return sections;
};
const mergeInstructions = (messages, instructions) => {
    const systemIndex = messages.findIndex((msg) => msg.role === "system");
    const additionalInstruction = instructions.join("\n\n");
    if (systemIndex >= 0) {
        messages[systemIndex] = Object.assign(Object.assign({}, messages[systemIndex]), { content: `${messages[systemIndex].content}\n\n${additionalInstruction}` });
        return messages;
    }
    messages.unshift({
        content: additionalInstruction,
        role: "system",
    });
    return messages;
};
const prepareMessagesWithTooling = async (options, logger) => {
    var _a, _b;
    const requestedTools = (_a = options.tools) !== null && _a !== void 0 ? _a : [];
    const baseMessages = cloneMessages(options.messages);
    if (requestedTools.length === 0) {
        return baseMessages;
    }
    const lastUserMessage = findLastUserMessage(options.messages);
    if (!lastUserMessage) {
        return baseMessages;
    }
    const contextSections = hasActiveTools(requestedTools)
        ? await buildContextSections(requestedTools, lastUserMessage.content, logger)
        : [];
    const instructions = [];
    if (contextSections.length > 0) {
        instructions.push([
            "请结合以下补充材料回答用户问题。",
            ...contextSections,
            "如资料存在冲突，请说明你的判断依据。",
        ].join("\n\n"));
    }
    if (requestedTools.includes("deep-analyze")) {
        instructions.push((0, deep_thinking_1.buildDeepThinkingInstruction)());
    }
    if (instructions.length === 0) {
        return baseMessages;
    }
    const augmented = mergeInstructions(baseMessages, instructions);
    (_b = logger === null || logger === void 0 ? void 0 : logger.debug) === null || _b === void 0 ? void 0 : _b.call(logger, `Tooling instructions applied: ${requestedTools.join(",") || "none"}`);
    return augmented;
};
exports.prepareMessagesWithTooling = prepareMessagesWithTooling;
