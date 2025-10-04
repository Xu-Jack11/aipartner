import { buildDeepThinkingInstruction } from "../tools/deep-thinking";
import { buildKnowledgeBaseContext } from "../tools/knowledge-base";
import { fetchWebSearchContext } from "../tools/web-search";
import type { AiCompletionOptions, AiMessage } from "./ai-provider.interface";

type LoggerLike = {
  readonly debug?: (message: string) => void;
  readonly warn?: (message: string) => void;
};

const cloneMessages = (messages: readonly AiMessage[]): AiMessage[] =>
  messages.map((msg) => ({ ...msg }));

const findLastUserMessage = (
  messages: readonly AiMessage[]
): AiMessage | undefined => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === "user") {
      return message;
    }
  }

  return;
};

const hasActiveTools = (tools: readonly string[]): boolean =>
  tools.some((tool) => tool === "knowledge-base" || tool === "web-search");

const appendKnowledgeContext = (
  sections: string[],
  query: string,
  logger?: LoggerLike
) => {
  try {
    const knowledgeContext = buildKnowledgeBaseContext(query);
    if (knowledgeContext) {
      sections.push(`知识库检索结果：\n${knowledgeContext}`);
    }
  } catch (error) {
    logger?.warn?.(
      `Knowledge base enrichment failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

const appendWebSearchContext = async (
  sections: string[],
  query: string,
  logger?: LoggerLike
) => {
  try {
    const webSearchContext = await fetchWebSearchContext(query);
    if (webSearchContext) {
      sections.push(`联网搜索结果：\n${webSearchContext}`);
    }
  } catch (error) {
    logger?.warn?.(
      `Web search enrichment failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

const buildContextSections = async (
  tools: readonly string[],
  query: string,
  logger?: LoggerLike
): Promise<string[]> => {
  const sections: string[] = [];

  if (tools.includes("knowledge-base")) {
    appendKnowledgeContext(sections, query, logger);
  }

  if (tools.includes("web-search")) {
    await appendWebSearchContext(sections, query, logger);
  }

  return sections;
};

const mergeInstructions = (
  messages: AiMessage[],
  instructions: readonly string[]
): AiMessage[] => {
  const systemIndex = messages.findIndex((msg) => msg.role === "system");
  const additionalInstruction = instructions.join("\n\n");

  if (systemIndex >= 0) {
    messages[systemIndex] = {
      ...messages[systemIndex],
      content: `${messages[systemIndex].content}\n\n${additionalInstruction}`,
    };
    return messages;
  }

  messages.unshift({
    content: additionalInstruction,
    role: "system",
  });
  return messages;
};

export const prepareMessagesWithTooling = async (
  options: AiCompletionOptions,
  logger?: LoggerLike
): Promise<AiMessage[]> => {
  const requestedTools = options.tools ?? [];
  const baseMessages = cloneMessages(options.messages);

  if (requestedTools.length === 0) {
    return baseMessages;
  }

  const lastUserMessage = findLastUserMessage(options.messages);
  if (!lastUserMessage) {
    return baseMessages;
  }

  const contextSections = hasActiveTools(requestedTools)
    ? await buildContextSections(
        requestedTools,
        lastUserMessage.content,
        logger
      )
    : [];

  const instructions: string[] = [];

  if (contextSections.length > 0) {
    instructions.push(
      [
        "请结合以下补充材料回答用户问题。",
        ...contextSections,
        "如资料存在冲突，请说明你的判断依据。",
      ].join("\n\n")
    );
  }

  if (requestedTools.includes("deep-analyze")) {
    instructions.push(buildDeepThinkingInstruction());
  }

  if (instructions.length === 0) {
    return baseMessages;
  }

  const augmented = mergeInstructions(baseMessages, instructions);

  logger?.debug?.(
    `Tooling instructions applied: ${requestedTools.join(",") || "none"}`
  );

  return augmented;
};
